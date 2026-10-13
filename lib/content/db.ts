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
