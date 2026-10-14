import { authorColumns, getDb, postColumns, workoutColumns, type AuthorRow, type PostRow, type WorkoutRow } from "@/lib/content/db";

/** Staff reads: RLS lets trainers and admins see drafts too. */
export async function listAllWorkouts(): Promise<WorkoutRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("workouts").select(workoutColumns).order("updated_at", { ascending: false });
  return (data ?? []) as unknown as WorkoutRow[];
}

export async function getWorkoutRow(id: string): Promise<WorkoutRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("workouts").select(workoutColumns).eq("id", id).maybeSingle();
  return (data as unknown as WorkoutRow | null) ?? null;
}

export async function listAllPosts(): Promise<PostRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("posts").select(postColumns).order("updated_at", { ascending: false });
  return (data ?? []) as unknown as PostRow[];
}

export async function getPostRow(id: string): Promise<PostRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("posts").select(postColumns).eq("id", id).maybeSingle();
  return (data as unknown as PostRow | null) ?? null;
}

export async function listAuthorRows(): Promise<AuthorRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("authors").select(authorColumns).order("created_at");
  return (data ?? []) as AuthorRow[];
}

/* ----------------------------------------------------------------------------
   Courses and skincare (staff reads)
---------------------------------------------------------------------------- */

import {
  articleColumns,
  courseColumns,
  lessonColumns,
  moduleColumns,
  productColumns,
  routineColumns,
  type ArticleRow,
  type CourseRow,
  type LessonRow,
  type ModuleRow,
  type ProductRow,
  type RoutineRow,
} from "@/lib/content/db";

export async function listAllCourses(): Promise<CourseRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("courses").select(courseColumns).order("updated_at", { ascending: false });
  return (data ?? []) as unknown as CourseRow[];
}

export async function getCourseRow(id: string): Promise<CourseRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("courses").select(courseColumns).eq("id", id).maybeSingle();
  return (data as unknown as CourseRow | null) ?? null;
}

export async function listModuleRows(courseId: string): Promise<ModuleRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("course_modules").select(moduleColumns).eq("course_id", courseId).order("position");
  return (data ?? []) as ModuleRow[];
}

export async function listLessonRows(moduleIds: string[]): Promise<LessonRow[]> {
  const db = await getDb();
  if (!db || moduleIds.length === 0) return [];
  const { data } = await db.from("lessons").select(lessonColumns).in("module_id", moduleIds).order("position");
  return (data ?? []) as unknown as LessonRow[];
}

export async function getLessonRow(id: string): Promise<LessonRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("lessons").select(lessonColumns).eq("id", id).maybeSingle();
  return (data as unknown as LessonRow | null) ?? null;
}

export async function listAllRoutines(): Promise<RoutineRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("skin_routines").select(routineColumns).order("updated_at", { ascending: false });
  return (data ?? []) as unknown as RoutineRow[];
}

export async function getRoutineRow(id: string): Promise<RoutineRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("skin_routines").select(routineColumns).eq("id", id).maybeSingle();
  return (data as unknown as RoutineRow | null) ?? null;
}

export async function listAllArticles(): Promise<ArticleRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("skin_articles").select(articleColumns).order("updated_at", { ascending: false });
  return (data ?? []) as unknown as ArticleRow[];
}

export async function getArticleRow(id: string): Promise<ArticleRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("skin_articles").select(articleColumns).eq("id", id).maybeSingle();
  return (data as unknown as ArticleRow | null) ?? null;
}

export async function listAllProducts(): Promise<ProductRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("products").select(productColumns).order("updated_at", { ascending: false });
  return (data ?? []) as unknown as ProductRow[];
}

export async function getProductRow(id: string): Promise<ProductRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("products").select(productColumns).eq("id", id).maybeSingle();
  return (data as unknown as ProductRow | null) ?? null;
}
