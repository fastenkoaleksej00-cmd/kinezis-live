"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { redirect } from "next/navigation";
import { type LocalizedText, type PostAttachment } from "@/lib/content/types";
import { createServerSupabase } from "@/lib/supabase/server";
import { ownStorageUrl } from "@/lib/security";
import { logModeration } from "./moderationLog";
import { communityTopics, normalizeTags, postTypes, riskyText } from "@/lib/community/types";
import { bool, localized, str } from "@/lib/forms";
import { type AdminState, type QuickPublishState, staffClient, authorFor, video, inList, published, mapDbError, tones, languagesList } from "./shared";

function attachment(fd: FormData): PostAttachment | null {
  const kind = str(fd, "attachment_kind");
  const tone = inList(["deep", "mint", "light"] as const, str(fd, "attachment_tone"), "deep");
  if (kind === "photo") {
    const alt = localized(fd, "attachment_alt") ?? { en: "" };
    const src = str(fd, "attachment_photo_src");
    return src ? { kind: "photo", coverTone: tone, alt, src } : { kind: "photo", coverTone: tone, alt };
  }
  if (kind === "video") {
    const d = Number.parseInt(str(fd, "attachment_duration"), 10);
    return { kind: "video", coverTone: tone, source: video(fd, "attachment_video"), ...(Number.isFinite(d) && d > 0 ? { durationSec: d } : {}) };
  }
  if (kind === "workout") {
    const workoutId = str(fd, "attachment_workout_id");
    return workoutId ? { kind: "workout", workoutId } : null;
  }
  return null;
}

export async function savePost(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const body = localized(fd, "body");
  if (!body) return { error: "bodyRequired" };
  const id = str(fd, "id") || undefined;
  const row = {
    ...(id ? { id } : {}),
    kind: inList(["news", "tip", "session", "video", "photo"] as const, str(fd, "kind"), "news"),
    author_id: authorFor(ctx.user, str(fd, "author_id")),
    title: localized(fd, "title"),
    body,
    attachment: attachment(fd),
    language: inList(["en", "uk", "de", "ru"] as const, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    reactions_enabled: bool(fd, "reactions_enabled"),
    comments_enabled: bool(fd, "comments_enabled"),
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("posts").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/posts?saved=1");
}

export async function deletePost(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("posts").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/posts?deleted=1");
}

/* ----------------------------------------------------------------------------
   Quick publish from the feed ("+")
---------------------------------------------------------------------------- */


/**
 * One-step post: caption + optional uploaded photo/video, published immediately.
 * The caption is stored under the chosen content language and copied to `en` as the required fallback.
 */
export async function quickPublish(_prev: QuickPublishState, fd: FormData): Promise<QuickPublishState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const caption = str(fd, "caption");
  if (!caption) return { error: "bodyRequired" };
  const language = inList(languagesList, str(fd, "language"), "uk");
  const body: LocalizedText = { en: caption, [language]: caption };
  const kind = inList(["news", "tip", "session", "video", "photo"] as const, str(fd, "kind"), "news");
  const mediaKind = str(fd, "media_kind");
  const mediaPath = str(fd, "media_path");
  const mediaUrl = ownStorageUrl(str(fd, "media_url")) ?? "";
  const tone = inList(tones, str(fd, "tone"), "deep");

  let attachment: PostAttachment | null = null;
  if (mediaKind === "photo" && mediaUrl) attachment = { kind: "photo", coverTone: tone, alt: { en: caption.slice(0, 80) }, src: mediaUrl };
  if (mediaKind === "video" && mediaPath) attachment = { kind: "video", coverTone: tone, source: { kind: "storage", bucket: "videos", path: mediaPath } };

  const { error } = await ctx.db.from("posts").insert({
    kind: attachment?.kind === "video" ? (kind === "news" ? "video" : kind) : attachment?.kind === "photo" ? (kind === "news" ? "photo" : kind) : kind,
    author_id: authorFor(ctx.user, str(fd, "author_id")),
    title: null,
    body,
    attachment,
    language,
    access: str(fd, "access") === "premium" ? "premium" : "free",
    reactions_enabled: true,
    comments_enabled: true,
    published: true,
    published_at: new Date().toISOString(),
  });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/?posted=1");
}

/* ----------------------------------------------------------------------------
   Community posts: members publish and delete their own; staff moderate
---------------------------------------------------------------------------- */

const memberCategories = ["workouts", "face", "skincare", "nutrition", "motivation", "other"] as const;

export async function memberPublish(_prev: QuickPublishState, fd: FormData): Promise<QuickPublishState> {
  const supabase = await createServerSupabase();
  if (!supabase) return { error: "notConfigured" };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "forbidden" };
  const caption = str(fd, "caption");
  if (!caption) return { error: "bodyRequired" };
  const language = inList(languagesList, str(fd, "language"), "uk");
  const mediaKind = str(fd, "media_kind");
  const mediaPath = str(fd, "media_path");
  const mediaUrl = ownStorageUrl(str(fd, "media_url")) ?? "";
  let attachment: PostAttachment | null = null;
  if (mediaKind === "photo" && mediaUrl) attachment = { kind: "photo", coverTone: "deep", alt: { en: caption.slice(0, 80) }, src: mediaUrl };
  if (mediaKind === "video" && mediaPath) attachment = { kind: "video", coverTone: "deep", source: { kind: "storage", bucket: "member-videos", path: mediaPath } };
  const topic = inList(communityTopics, str(fd, "topic"), "general");
  const postType = inList(postTypes, str(fd, "post_type"), "story");
  const tags = normalizeTags(str(fd, "tags"));
  const flagged = riskyText(caption);
  const category = topic === "face" ? "face" : topic === "nutrition" ? "nutrition" : topic === "mind" ? "motivation" : topic === "general" ? inList(memberCategories, str(fd, "category"), "other") : "workouts";
  const { error } = await supabase.from("posts").insert({
    topic,
    post_type: postType,
    tags,
    needs_review: flagged,
    review_reason: flagged ? "keywords" : null,
    kind: attachment?.kind === "video" ? "video" : attachment?.kind === "photo" ? "photo" : "news",
    author_id: null,
    user_id: user.id,
    category,
    title: null,
    body: { en: caption, [language]: caption },
    attachment,
    language,
    access: "free",
    reactions_enabled: true,
    comments_enabled: true,
    published: true,
    published_at: new Date().toISOString(),
  });
  if (error) return { error: /rate_limit/.test(error.message) ? "rateLimit" : /links_new_account/.test(error.message) ? "linksNew" : mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect(`/community?posted=1${flagged ? "&review=1" : ""}&topic=${topic}`);
}

/** Owner deletes their own post; staff may delete any. RLS enforces both. */
export async function deleteOwnPost(fd: FormData): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase) return;
  const id = str(fd, "id");
  if (id) await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/?deleted=1");
}

export async function setPostHidden(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const hidden = str(fd, "hidden") === "true";
  if (id) {
    await ctx.db.from("posts").update({ hidden }).eq("id", id);
    await logModeration(ctx.db, ctx.user.id, hidden ? "hide_post" : "unhide_post", "post", id);
  }
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/community");
}
