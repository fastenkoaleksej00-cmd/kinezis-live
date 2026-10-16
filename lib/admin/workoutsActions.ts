"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { redirect } from "next/navigation";
import { categoryIds, equipmentIds, goals as goalList, levels, type Goal } from "@/lib/content/types";
import { regionIds } from "@/lib/body/regions";
import { parseYouTubeId, youTubeThumb } from "@/lib/video/youtube";
import { bool, localized, str } from "@/lib/forms";
import { type AdminState, type QuickPublishState, staffClient, authorFor, slugify, video, inList, published, mapDbError, languagesList } from "./shared";

export async function saveWorkout(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(title.en));
  if (!slug) return { error: "invalid" };
  const duration = Number.parseInt(str(fd, "duration_min"), 10);
  const vid = video(fd);
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    description: localized(fd, "description") ?? { en: "" },
    category: inList(categoryIds, str(fd, "category"), "kinesiotherapy"),
    duration_min: Number.isFinite(duration) && duration > 0 ? duration : 10,
    level: inList(levels, str(fd, "level"), "beginner"),
    goals: goalList.filter((g) => bool(fd, `goal_${g}`)) as Goal[],
    // YouTube terms forbid selling access to their videos: embedded YouTube sessions are always free
    access: vid?.kind !== "youtube" && str(fd, "access") === "premium" ? "premium" : "free",
    language: inList(["en", "uk", "de", "ru"] as const, str(fd, "language"), "uk"),
    cover_tone: inList(["deep", "mint", "light"] as const, str(fd, "cover_tone"), "deep"),
    video: vid,
    author_id: authorFor(ctx.user, str(fd, "author_id")),
    equipment: equipmentIds.filter((e) => bool(fd, `equipment_${e}`)),
    body_regions: regionIds.filter((r) => bool(fd, `region_${r}`)),
    safety: localized(fd, "safety"),
    ...published(fd, str(fd, "published_at_prev") || null),
    ...(ctx.user.role === "admin" && str(fd, "review_status") ? { review_status: inList(["draft", "pending", "approved", "rejected"] as const, str(fd, "review_status"), "approved") } : {}),
  };
  const { error } = await ctx.db.from("workouts").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/workouts?saved=1");
}

/**
 * Add a YouTube video as a draft session: title and thumbnail come from YouTube oEmbed (no API key),
 * duration, category and language are set by the trainer. The video itself stays on YouTube.
 */
export async function importYouTube(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const id = parseYouTubeId(str(fd, "youtube_url"));
  if (!id) return { error: "invalid" };
  const minutes = Number.parseInt(str(fd, "duration_min"), 10);
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 240) return { error: "invalid" };
  let title = "";
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`, { cache: "no-store" });
    if (res.ok) title = String(((await res.json()) as { title?: string }).title ?? "").slice(0, 200);
    else return { error: "invalid" };
  } catch {
    return { error: "generic" };
  }
  const language = inList(languagesList, str(fd, "language"), "ru");
  const row = {
    slug: `yt-${id}`,
    title: { en: title || id, [language]: title || id },
    description: { en: "", [language]: "" },
    category: inList(categoryIds, str(fd, "category"), "yoga"),
    duration_min: minutes,
    level: inList(levels, str(fd, "level"), "beginner"),
    goals: [],
    access: "free",
    language,
    cover_tone: "deep",
    video: { kind: "youtube", id, poster: youTubeThumb(id) },
    author_id: authorFor(ctx.user, str(fd, "author_id") || (ctx.user.authorId ?? "")),
    published: false,
    published_at: null,
  };
  const { data, error } = await ctx.db.from("workouts").insert(row).select("id").single();
  if (error || !data) return { error: error ? mapDbError(error.message) : "generic" };
  revalidatePath("/admin/workouts");
  redirect(`/admin/workouts/${(data as { id: string }).id}?imported=1`);
}

export async function deleteWorkout(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("workouts").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/workouts?deleted=1");
}

/* ----------------------------------------------------------------------------
   Quick workout publish (trainer, from the "+" on Home)
---------------------------------------------------------------------------- */

export async function quickPublishWorkout(_prev: QuickPublishState, fd: FormData): Promise<QuickPublishState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = str(fd, "title");
  if (!title) return { error: "titleRequired" };
  const language = inList(languagesList, str(fd, "language"), "uk");
  const videoPath = str(fd, "video_path");
  const poster = str(fd, "poster_url");
  const duration = Number.parseInt(str(fd, "duration_min"), 10);
  const publish = str(fd, "mode") === "publish";
  const description = str(fd, "description");
  const base = await slugify(title);
  const slug = `${base || "session"}-${Date.now().toString(36).slice(-4)}`;
  const row = {
    slug,
    title: { en: title, [language]: title },
    description: description ? { en: description, [language]: description } : { en: "" },
    category: inList(categoryIds, str(fd, "category"), "mobility"),
    duration_min: Number.isFinite(duration) && duration > 0 ? duration : 15,
    level: inList(levels, str(fd, "level"), "beginner"),
    goals: goalList.filter((g) => fd.get(`goal_${g}`) === "on") as Goal[],
    access: str(fd, "access") === "premium" ? "premium" : "free",
    language,
    cover_tone: "deep",
    video: videoPath ? (poster ? { kind: "storage", bucket: "videos", path: videoPath, poster } : { kind: "storage", bucket: "videos", path: videoPath }) : null,
    author_id: authorFor(ctx.user, str(fd, "author_id")),
    equipment: equipmentIds.filter((e) => bool(fd, `equipment_${e}`)),
    body_regions: regionIds.filter((r) => bool(fd, `region_${r}`)),
    safety: description && str(fd, "safety") ? { en: str(fd, "safety"), [language]: str(fd, "safety") } : str(fd, "safety") ? { en: str(fd, "safety"), [language]: str(fd, "safety") } : null,
    published: publish,
    published_at: publish ? new Date().toISOString() : null,
  };
  const { error } = await ctx.db.from("workouts").insert(row);
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  // Trainers' publications wait for review, so send them to their own list instead of a public page that is not live yet
  redirect(publish && ctx.user.role === "admin" ? `/library/${slug}?published=1` : publish ? "/admin/workouts?submitted=1" : "/admin/workouts?saved=1");
}
