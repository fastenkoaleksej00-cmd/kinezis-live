"use client";

import { useEffect, useRef } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { favoritesStore } from "@/lib/store/favorites";
import { lessonsStore } from "@/lib/store/lessons";
import { progressStore, type ProgressEntry } from "@/lib/store/progress";
import { getBrowserClient } from "@/lib/supabase/client";

interface FavoriteRow {
  item_key: string;
}
interface ProgressRow {
  item_id: string;
  position_sec: number;
  duration_sec: number;
  completed: boolean;
  updated_at: string;
}
interface LessonRow {
  lesson_id: string;
  completed: boolean;
  updated_at: string;
}

/**
 * Keeps local stores and the account in sync.
 * On sign-in: pull remote rows, merge with local (union for favourites, newest wins for progress), push the result.
 * Afterwards: every local change is written to the account. Signed out: local only, nothing is sent.
 */
export function UserDataSync() {
  const userId = useRef<string | null>(null);
  const lastFavorites = useRef<string[]>([]);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) return;
    let cancelled = false;
    const unsubscribers: Array<() => void> = [];

    async function pullAndMerge(client: SupabaseClient, uid: string) {
      const [fav, prog, les] = await Promise.all([
        client.from("favorites").select("item_key").eq("user_id", uid),
        client.from("watch_progress").select("item_id, position_sec, duration_sec, completed, updated_at").eq("user_id", uid),
        client.from("lesson_progress").select("lesson_id, completed, updated_at").eq("user_id", uid),
      ]);
      if (cancelled) return;

      // Favourites: union, remote order first
      const remoteFav = ((fav.data ?? []) as FavoriteRow[]).map((r) => r.item_key);
      const localFav = favoritesStore.read();
      const mergedFav = Array.from(new Set([...localFav, ...remoteFav]));
      favoritesStore.write(mergedFav);
      lastFavorites.current = mergedFav;
      const missingRemote = mergedFav.filter((k) => !remoteFav.includes(k));
      if (missingRemote.length > 0) {
        await client.from("favorites").upsert(missingRemote.map((item_key) => ({ user_id: uid, item_key })), { onConflict: "user_id,item_key" });
      }

      // Watch progress: newest wins
      const localProg = progressStore.read();
      const mergedProg: Record<string, ProgressEntry> = { ...localProg };
      for (const r of (prog.data ?? []) as ProgressRow[]) {
        const local = mergedProg[r.item_id];
        if (!local || local.updatedAt < r.updated_at) {
          mergedProg[r.item_id] = { position: r.position_sec, duration: r.duration_sec, completed: r.completed, updatedAt: r.updated_at };
        }
      }
      progressStore.write(mergedProg);
      const progRows = Object.entries(mergedProg)
        .filter(([id, e]) => {
          const remote = ((prog.data ?? []) as ProgressRow[]).find((r) => r.item_id === id);
          return !remote || remote.updated_at < e.updatedAt;
        })
        .map(([item_id, e]) => ({ user_id: uid, item_id, position_sec: e.position, duration_sec: e.duration, completed: e.completed, updated_at: e.updatedAt }));
      if (progRows.length > 0) await client.from("watch_progress").upsert(progRows, { onConflict: "user_id,item_id" });

      // Lessons: newest wins
      const localLes = lessonsStore.read();
      const mergedLes = { ...localLes };
      for (const r of (les.data ?? []) as LessonRow[]) {
        const local = mergedLes[r.lesson_id];
        if (!local || local.at < r.updated_at) mergedLes[r.lesson_id] = { completed: r.completed, at: r.updated_at };
      }
      lessonsStore.write(mergedLes);
      const lesRows = Object.entries(mergedLes)
        .filter(([id, e]) => {
          const remote = ((les.data ?? []) as LessonRow[]).find((r) => r.lesson_id === id);
          return !remote || remote.updated_at < e.at;
        })
        .map(([lesson_id, e]) => ({ user_id: uid, lesson_id, completed: e.completed, updated_at: e.at }));
      if (lesRows.length > 0) await client.from("lesson_progress").upsert(lesRows, { onConflict: "user_id,lesson_id" });
    }

    function startPush(client: SupabaseClient) {
      unsubscribers.push(
        favoritesStore.subscribe(() => {
          const uid = userId.current;
          if (!uid) return;
          const next = favoritesStore.read();
          const prev = lastFavorites.current;
          const added = next.filter((k) => !prev.includes(k));
          const removed = prev.filter((k) => !next.includes(k));
          lastFavorites.current = next;
          if (added.length > 0) void client.from("favorites").upsert(added.map((item_key) => ({ user_id: uid, item_key })), { onConflict: "user_id,item_key" });
          if (removed.length > 0) void client.from("favorites").delete().eq("user_id", uid).in("item_key", removed);
        }),
        progressStore.subscribe(() => {
          const uid = userId.current;
          if (!uid) return;
          const all = progressStore.read();
          // Only the most recently updated entry changed
          const latest = Object.entries(all).sort((a, b) => (a[1].updatedAt < b[1].updatedAt ? 1 : -1))[0];
          if (!latest) return;
          const [item_id, e] = latest;
          void client.from("watch_progress").upsert({ user_id: uid, item_id, position_sec: e.position, duration_sec: e.duration, completed: e.completed, updated_at: e.updatedAt }, { onConflict: "user_id,item_id" });
        }),
        lessonsStore.subscribe(() => {
          const uid = userId.current;
          if (!uid) return;
          const all = lessonsStore.read();
          const latest = Object.entries(all).sort((a, b) => (a[1].at < b[1].at ? 1 : -1))[0];
          if (!latest) return;
          const [lesson_id, e] = latest;
          void client.from("lesson_progress").upsert({ user_id: uid, lesson_id, completed: e.completed, updated_at: e.at }, { onConflict: "user_id,lesson_id" });
        }),
      );
    }

    startPush(supabase);

    const { data: auth } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user.id ?? null;
      if (uid && uid !== userId.current) {
        userId.current = uid;
        void pullAndMerge(supabase, uid);
      } else if (!uid) {
        userId.current = null;
      }
    });

    return () => {
      cancelled = true;
      auth.subscription.unsubscribe();
      unsubscribers.forEach((u) => u());
    };
  }, []);

  return null;
}
