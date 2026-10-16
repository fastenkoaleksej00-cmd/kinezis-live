/** Shared helpers for the admin server actions. Not a "use server" module, so none of these become public endpoints. */
import { type LocalizedText, type VideoSource } from "@/lib/content/types";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { parseYouTubeId, youTubeThumb } from "@/lib/video/youtube";
import { bool, str } from "@/lib/forms";

export type AdminErrorCode = "forbidden" | "notConfigured" | "titleRequired" | "bodyRequired" | "slugTaken" | "invalid" | "generic" | "rateLimit" | "linksNew";

export interface AdminState {
  error?: AdminErrorCode;
}

export async function staffClient() {
  const user = await getSessionUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) return { error: "forbidden" as const };
  if (user.role === "trainer" && user.authorStatus !== "active") return { error: "forbidden" as const };
  const db = await createServerSupabase();
  if (!db) return { error: "notConfigured" as const };
  return { db, user };
}

/** Admins pick any author; trainers always publish as themselves (the database enforces the same rule). */
export function authorFor(user: { role: string; authorId: string | null }, requested: string): string | null {
  return user.role === "admin" ? requested || null : user.authorId;
}


export async function slugify(input: string): Promise<string> {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function video(fd: FormData, base = "video"): VideoSource {
  const kind = str(fd, `${base}_kind`);
  const src = str(fd, `${base}_src`);
  const path = str(fd, `${base}_path`);
  const poster = str(fd, `${base}_poster`);
  if (kind === "youtube") {
    const id = parseYouTubeId(src);
    if (!id) return null;
    return { kind, id, poster: poster || youTubeThumb(id) };
  }
  if (kind === "storage") {
    if (!path) return null;
    return poster ? { kind, bucket: "videos", path, poster } : { kind, bucket: "videos", path };
  }
  if ((kind !== "file" && kind !== "hls") || !src) return null;
  return poster ? { kind, src, poster } : { kind, src };
}

export function inList<T extends string>(list: readonly T[], v: string, fallback: T): T {
  return (list as readonly string[]).includes(v) ? (v as T) : fallback;
}

export function published(fd: FormData, previous: string | null | undefined) {
  const isPublished = bool(fd, "published");
  return { published: isPublished, published_at: isPublished ? (previous ?? new Date().toISOString()) : null };
}

export function mapDbError(message: string): AdminErrorCode {
  if (/row-level security|permission denied/i.test(message)) return "forbidden";
  if (message.includes("workouts_slug_key") || message.toLowerCase().includes("duplicate")) return "slugTaken";
  if (message.toLowerCase().includes("violates")) return "invalid";
  return "generic";
}


export const tones = ["deep", "mint", "light"] as const;
export const languagesList = ["en", "uk", "de", "ru"] as const;

export interface QuickPublishState {
  error?: AdminErrorCode;
}

export function localizedLines(fd: FormData, base: string): LocalizedText[] {
  const split = (v: string) => v.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const en = split(str(fd, `${base}_en`));
  const uk = split(str(fd, `${base}_uk`));
  const de = split(str(fd, `${base}_de`));
  const ru = split(str(fd, `${base}_ru`));
  return en.map((line, i) => {
    const out: LocalizedText = { en: line };
    if (uk[i]) out.uk = uk[i];
    if (de[i]) out.de = de[i];
    if (ru[i]) out.ru = ru[i];
    return out;
  });
}
