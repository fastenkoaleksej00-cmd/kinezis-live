"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { categoryIds, goals as goalList, levels, mealSlots, type Goal, type LocalizedText, type MealSlot, type PostAttachment, type VideoSource } from "@/lib/content/types";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";

export type AdminErrorCode = "forbidden" | "notConfigured" | "titleRequired" | "bodyRequired" | "slugTaken" | "invalid" | "generic";

export interface AdminState {
  error?: AdminErrorCode;
}

async function staffClient() {
  const user = await getSessionUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) return { error: "forbidden" as const };
  const db = await createServerSupabase();
  if (!db) return { error: "notConfigured" as const };
  return { db, user };
}

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
const bool = (fd: FormData, key: string) => fd.get(key) === "on";

function localized(fd: FormData, base: string): LocalizedText | null {
  const en = str(fd, `${base}_en`);
  if (!en) return null;
  const out: LocalizedText = { en };
  const uk = str(fd, `${base}_uk`);
  const de = str(fd, `${base}_de`);
  const ru = str(fd, `${base}_ru`);
  if (uk) out.uk = uk;
  if (de) out.de = de;
  if (ru) out.ru = ru;
  return out;
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

function video(fd: FormData, base = "video"): VideoSource {
  const kind = str(fd, `${base}_kind`);
  const src = str(fd, `${base}_src`);
  const path = str(fd, `${base}_path`);
  const poster = str(fd, `${base}_poster`);
  if (kind === "storage") {
    if (!path) return null;
    return poster ? { kind, bucket: "videos", path, poster } : { kind, bucket: "videos", path };
  }
  if ((kind !== "file" && kind !== "hls") || !src) return null;
  return poster ? { kind, src, poster } : { kind, src };
}

function inList<T extends string>(list: readonly T[], v: string, fallback: T): T {
  return (list as readonly string[]).includes(v) ? (v as T) : fallback;
}

function published(fd: FormData, previous: string | null | undefined) {
  const isPublished = bool(fd, "published");
  return { published: isPublished, published_at: isPublished ? (previous ?? new Date().toISOString()) : null };
}

function mapDbError(message: string): AdminErrorCode {
  if (message.includes("workouts_slug_key") || message.toLowerCase().includes("duplicate")) return "slugTaken";
  if (message.toLowerCase().includes("violates")) return "invalid";
  return "generic";
}

export async function saveWorkout(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(title.en));
  if (!slug) return { error: "invalid" };
  const duration = Number.parseInt(str(fd, "duration_min"), 10);
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    description: localized(fd, "description") ?? { en: "" },
    category: inList(categoryIds, str(fd, "category"), "kinesiotherapy"),
    duration_min: Number.isFinite(duration) && duration > 0 ? duration : 10,
    level: inList(levels, str(fd, "level"), "beginner"),
    goals: goalList.filter((g) => bool(fd, `goal_${g}`)) as Goal[],
    access: str(fd, "access") === "premium" ? "premium" : "free",
    language: inList(["en", "uk", "de", "ru"] as const, str(fd, "language"), "uk"),
    cover_tone: inList(["deep", "mint", "light"] as const, str(fd, "cover_tone"), "deep"),
    video: video(fd),
    author_id: str(fd, "author_id") || null,
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("workouts").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/admin/workouts?saved=1");
}

export async function deleteWorkout(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("workouts").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/workouts?deleted=1");
}

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
    author_id: str(fd, "author_id") || null,
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
  revalidatePath("/", "layout");
  redirect("/admin/posts?saved=1");
}

export async function deletePost(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("posts").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/posts?deleted=1");
}

/* ----------------------------------------------------------------------------
   Courses, modules, lessons
---------------------------------------------------------------------------- */

const tones = ["deep", "mint", "light"] as const;
const languagesList = ["en", "uk", "de", "ru"] as const;

export async function saveCourse(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(title.en));
  if (!slug) return { error: "invalid" };
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    description: localized(fd, "description") ?? { en: "" },
    cover_tone: inList(tones, str(fd, "cover_tone"), "mint"),
    level: inList(levels, str(fd, "level"), "beginner"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    language: inList(languagesList, str(fd, "language"), "uk"),
    author_id: str(fd, "author_id") || null,
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { data, error } = await ctx.db.from("courses").upsert(row, { onConflict: "id" }).select("id").single();
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout");
  redirect(`/admin/courses/${data.id}?saved=1`);
}

export async function deleteCourse(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("courses").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/courses?deleted=1");
}

export async function saveModule(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const courseId = str(fd, "course_id");
  const title = localized(fd, "title");
  if (!courseId || !title) return;
  const id = str(fd, "id") || undefined;
  const position = Number.parseInt(str(fd, "position"), 10);
  await ctx.db.from("course_modules").upsert({ ...(id ? { id } : {}), course_id: courseId, title, position: Number.isFinite(position) ? position : 0 }, { onConflict: "id" });
  revalidatePath("/", "layout");
  redirect(`/admin/courses/${courseId}?saved=1`);
}

export async function deleteModule(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const courseId = str(fd, "course_id");
  if (id) await ctx.db.from("course_modules").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect(`/admin/courses/${courseId}?deleted=1`);
}

function localizedLines(fd: FormData, base: string): LocalizedText[] {
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

export async function saveLesson(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const moduleId = str(fd, "module_id");
  const courseId = str(fd, "course_id");
  if (!moduleId || !courseId) return { error: "invalid" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(title.en));
  const duration = Number.parseInt(str(fd, "duration_min"), 10);
  const position = Number.parseInt(str(fd, "position"), 10);
  const row = {
    ...(id ? { id } : {}),
    module_id: moduleId,
    slug,
    title,
    summary: localized(fd, "summary"),
    duration_min: Number.isFinite(duration) && duration > 0 ? duration : null,
    video: video(fd),
    routine: localizedLines(fd, "routine"),
    recommendations: localized(fd, "recommendations"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    position: Number.isFinite(position) ? position : 0,
  };
  const { error } = await ctx.db.from("lessons").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout");
  redirect(`/admin/courses/${courseId}?saved=1`);
}

export async function deleteLesson(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const courseId = str(fd, "course_id");
  if (id) await ctx.db.from("lessons").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect(`/admin/courses/${courseId}?deleted=1`);
}

/* ----------------------------------------------------------------------------
   Skincare: routines, articles, products
---------------------------------------------------------------------------- */

export async function saveRoutine(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(title.en));
  const steps = localizedLines(fd, "steps");
  if (steps.length === 0) return { error: "bodyRequired" };
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    time_of_day: inList(["morning", "evening", "weekly"] as const, str(fd, "time_of_day"), "morning"),
    steps,
    language: inList(languagesList, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("skin_routines").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/admin/skincare?saved=1");
}

export async function deleteRoutine(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("skin_routines").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/skincare?deleted=1");
}

export async function saveArticle(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const body = localized(fd, "body");
  if (!body) return { error: "bodyRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(title.en));
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    body,
    language: inList(languagesList, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("skin_articles").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/admin/skincare?saved=1");
}

export async function deleteArticle(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("skin_articles").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/skincare?deleted=1");
}

const productCategories = ["cleanser", "toner", "serum", "moisturizer", "spf", "mask", "tool", "other"] as const;

export async function saveProduct(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const name = str(fd, "name");
  if (!name) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(`${str(fd, "brand")} ${name}`));
  const ingredients = str(fd, "ingredients")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
  const purchaseUrl = str(fd, "purchase_url");
  const imageSrc = str(fd, "image_src");
  const row = {
    ...(id ? { id } : {}),
    slug,
    name,
    brand: str(fd, "brand"),
    category: inList(productCategories, str(fd, "category"), "other"),
    description: localized(fd, "description") ?? { en: "" },
    ingredients,
    usage: localized(fd, "usage") ?? { en: "" },
    purchase_url: purchaseUrl || null,
    image_src: imageSrc || null,
    language: inList(languagesList, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("products").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/admin/skincare?saved=1");
}

export async function deleteProduct(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("products").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/skincare?deleted=1");
}

/* ----------------------------------------------------------------------------
   Quick publish from the feed ("+")
---------------------------------------------------------------------------- */

export interface QuickPublishState {
  error?: AdminErrorCode;
}

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
  const mediaUrl = str(fd, "media_url");
  const tone = inList(tones, str(fd, "tone"), "deep");

  let attachment: PostAttachment | null = null;
  if (mediaKind === "photo" && mediaUrl) attachment = { kind: "photo", coverTone: tone, alt: { en: caption.slice(0, 80) }, src: mediaUrl };
  if (mediaKind === "video" && mediaPath) attachment = { kind: "video", coverTone: tone, source: { kind: "storage", bucket: "videos", path: mediaPath } };

  const { error } = await ctx.db.from("posts").insert({
    kind: attachment?.kind === "video" ? (kind === "news" ? "video" : kind) : attachment?.kind === "photo" ? (kind === "news" ? "photo" : kind) : kind,
    author_id: str(fd, "author_id") || null,
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
  revalidatePath("/", "layout");
  redirect("/?posted=1");
}

/* ----------------------------------------------------------------------------
   Meal plans
---------------------------------------------------------------------------- */

export async function saveMealPlan(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const date = str(fd, "plan_date");
  const slug = str(fd, "slug") || (await slugify(`${date || ""} ${title.en}`));
  const meals = mealSlots
    .map((slot) => ({ slot, text: localized(fd, `meal_${slot}`) }))
    .filter((m): m is { slot: MealSlot; text: LocalizedText } => m.text !== null);
  if (meals.length === 0) return { error: "bodyRequired" };
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    plan_date: date || null,
    meals,
    notes: localized(fd, "notes"),
    author_id: str(fd, "author_id") || null,
    language: inList(languagesList, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("meal_plans").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/admin/nutrition?saved=1");
}

export async function deleteMealPlan(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("meal_plans").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/nutrition?deleted=1");
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
  const mediaUrl = str(fd, "media_url");
  let attachment: PostAttachment | null = null;
  if (mediaKind === "photo" && mediaUrl) attachment = { kind: "photo", coverTone: "deep", alt: { en: caption.slice(0, 80) }, src: mediaUrl };
  if (mediaKind === "video" && mediaPath) attachment = { kind: "video", coverTone: "deep", source: { kind: "storage", bucket: "member-videos", path: mediaPath } };
  const category = inList(memberCategories, str(fd, "category"), "other");
  const { error } = await supabase.from("posts").insert({
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
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout");
  redirect("/?posted=1&feed=community");
}

/** Owner deletes their own post; staff may delete any. RLS enforces both. */
export async function deleteOwnPost(fd: FormData): Promise<void> {
  const supabase = await createServerSupabase();
  if (!supabase) return;
  const id = str(fd, "id");
  if (id) await supabase.from("posts").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/?deleted=1");
}

export async function setPostHidden(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const hidden = str(fd, "hidden") === "true";
  if (id) await ctx.db.from("posts").update({ hidden }).eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/community");
}
