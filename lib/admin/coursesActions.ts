"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { redirect } from "next/navigation";
import { levels } from "@/lib/content/types";
import { localized, str } from "@/lib/forms";
import { type AdminState, localizedLines, staffClient, authorFor, slugify, video, inList, published, mapDbError, tones, languagesList } from "./shared";

/* ----------------------------------------------------------------------------
   Courses, modules, lessons
---------------------------------------------------------------------------- */


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
    author_id: authorFor(ctx.user, str(fd, "author_id")),
    kind: str(fd, "kind") === "program" ? "program" : "course",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { data, error } = await ctx.db.from("courses").upsert(row, { onConflict: "id" }).select("id").single();
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect(`/admin/courses/${data.id}?saved=1`);
}

export async function deleteCourse(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("courses").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
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
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect(`/admin/courses/${courseId}?saved=1`);
}

export async function deleteModule(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const courseId = str(fd, "course_id");
  if (id) await ctx.db.from("course_modules").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect(`/admin/courses/${courseId}?deleted=1`);
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
    workout_id: str(fd, "workout_id") || null,
    routine: localizedLines(fd, "routine"),
    recommendations: localized(fd, "recommendations"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    position: Number.isFinite(position) ? position : 0,
  };
  const { error } = await ctx.db.from("lessons").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect(`/admin/courses/${courseId}?saved=1`);
}

export async function deleteLesson(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  const courseId = str(fd, "course_id");
  if (id) await ctx.db.from("lessons").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect(`/admin/courses/${courseId}?deleted=1`);
}
