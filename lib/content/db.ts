import type { Author, LocalizedText, Post, PostAttachment, VideoSource, Workout } from "./types";
import { createServerSupabase } from "@/lib/supabase/server";

/** Row shapes as stored in Supabase (snake_case, jsonb for localized text). */
export interface WorkoutRow {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  category: Workout["category"];
  duration_min: number;
  level: Workout["level"];
  goals: Workout["goals"];
  access: Workout["access"];
  language: Workout["language"];
  cover_tone: Workout["coverTone"];
  video: VideoSource;
  author_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostRow {
  id: string;
  kind: Post["kind"];
  author_id: string | null;
  title: LocalizedText | null;
  body: LocalizedText;
  attachment: PostAttachment | null;
  language: Post["language"];
  access: Post["access"];
  reactions_enabled: boolean;
  comments_enabled: boolean;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AuthorRow {
  id: string;
  user_id: string | null;
  name: string;
  role: Author["role"];
  bio: LocalizedText | null;
  specialties: string[] | null;
  verified: boolean;
  avatar_src: string | null;
  instagram: string | null;
}

export const authorColumns = "id, user_id, name, role, bio, specialties, verified, avatar_src, instagram";

export function rowToAuthor(r: AuthorRow): Author {
  return {
    id: r.id,
    name: r.name,
    role: r.role,
    bio: r.bio ?? undefined,
    specialties: r.specialties ?? [],
    verified: r.verified,
    avatarSrc: r.avatar_src ?? undefined,
    instagram: r.instagram ?? undefined,
  };
}

export const workoutColumns =
  "id, slug, title, description, category, duration_min, level, goals, access, language, cover_tone, video, author_id, published, published_at, created_at, updated_at";
export const postColumns =
  "id, kind, author_id, title, body, attachment, language, access, reactions_enabled, comments_enabled, published, published_at, created_at, updated_at";

export function rowToWorkout(r: WorkoutRow): Workout {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    description: r.description ?? { en: "" },
    category: r.category,
    durationMin: r.duration_min,
    level: r.level,
    goals: r.goals ?? [],
    access: r.access,
    language: r.language,
    coverTone: r.cover_tone,
    video: r.video ?? null,
    authorId: r.author_id ?? "",
    publishedAt: r.published_at ?? r.created_at,
  };
}

export function rowToPost(r: PostRow): Post {
  return {
    id: r.id,
    kind: r.kind,
    authorId: r.author_id ?? "",
    title: r.title ?? undefined,
    body: r.body,
    attachment: r.attachment ?? undefined,
    language: r.language,
    access: r.access,
    publishedAt: r.published_at ?? r.created_at,
    reactionsEnabled: r.reactions_enabled,
    commentsEnabled: r.comments_enabled,
  };
}

/** Server-side Supabase client for content reads, or null when not configured. */
export async function getDb() {
  return createServerSupabase();
}

/* ----------------------------------------------------------------------------
   Courses and skincare rows
---------------------------------------------------------------------------- */

import type { Course, CourseModule, Lesson, Product, SkinArticle, SkinRoutine } from "./types";

export interface CourseRow {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  cover_tone: Course["coverTone"];
  level: Course["level"];
  access: Course["access"];
  language: Course["language"];
  author_id: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ModuleRow {
  id: string;
  course_id: string;
  title: LocalizedText;
  position: number;
}

export interface LessonRow {
  id: string;
  module_id: string;
  slug: string;
  title: LocalizedText;
  summary: LocalizedText | null;
  duration_min: number | null;
  video: VideoSource;
  routine: LocalizedText[];
  recommendations: LocalizedText | null;
  access: Lesson["access"];
  position: number;
}

export interface RoutineRow {
  id: string;
  slug: string;
  title: LocalizedText;
  time_of_day: SkinRoutine["time"];
  steps: LocalizedText[];
  language: SkinRoutine["language"];
  access: SkinRoutine["access"];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleRow {
  id: string;
  slug: string;
  title: LocalizedText;
  body: LocalizedText;
  language: SkinArticle["language"];
  access: SkinArticle["access"];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: Product["category"];
  description: LocalizedText;
  ingredients: string[];
  usage: LocalizedText;
  purchase_url: string | null;
  image_src: string | null;
  language: Product["language"];
  access: Product["access"];
  published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export const courseColumns = "id, slug, title, description, cover_tone, level, access, language, author_id, published, published_at, created_at, updated_at";
export const moduleColumns = "id, course_id, title, position";
export const lessonColumns = "id, module_id, slug, title, summary, duration_min, video, routine, recommendations, access, position";
export const routineColumns = "id, slug, title, time_of_day, steps, language, access, published, published_at, created_at, updated_at";
export const articleColumns = "id, slug, title, body, language, access, published, published_at, created_at, updated_at";
export const productColumns = "id, slug, name, brand, category, description, ingredients, usage, purchase_url, image_src, language, access, published, published_at, created_at, updated_at";

export function rowToLesson(r: LessonRow): Lesson {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    summary: r.summary ?? undefined,
    durationMin: r.duration_min ?? undefined,
    video: r.video ?? null,
    routine: r.routine ?? [],
    recommendations: r.recommendations ?? undefined,
    access: r.access,
  };
}

export function rowsToCourse(c: CourseRow, modules: ModuleRow[], lessons: LessonRow[]): Course {
  const mods: CourseModule[] = modules
    .filter((m) => m.course_id === c.id)
    .sort((a, b) => a.position - b.position)
    .map((m) => ({
      id: m.id,
      title: m.title,
      lessons: lessons.filter((l) => l.module_id === m.id).sort((a, b) => a.position - b.position).map(rowToLesson),
    }));
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    description: c.description ?? { en: "" },
    coverTone: c.cover_tone,
    level: c.level,
    access: c.access,
    language: c.language,
    authorId: c.author_id ?? "",
    modules: mods,
    publishedAt: c.published_at ?? c.created_at,
  };
}

export function rowToRoutine(r: RoutineRow): SkinRoutine {
  return { id: r.id, slug: r.slug, title: r.title, time: r.time_of_day, steps: r.steps ?? [], language: r.language, access: r.access, publishedAt: r.published_at ?? r.created_at };
}

export function rowToArticle(r: ArticleRow): SkinArticle {
  return { id: r.id, slug: r.slug, title: r.title, body: r.body, language: r.language, access: r.access, publishedAt: r.published_at ?? r.created_at };
}

export function rowToProduct(r: ProductRow): Product {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    brand: r.brand,
    category: r.category,
    description: r.description ?? { en: "" },
    ingredients: r.ingredients ?? [],
    usage: r.usage ?? { en: "" },
    purchaseUrl: r.purchase_url ?? undefined,
    imageSrc: r.image_src ?? undefined,
    language: r.language,
    access: r.access,
    publishedAt: r.published_at ?? r.created_at,
  };
}
