import { cache } from "react";
import { authorColumns, getDb, rowToAuthor, rowToWorkout, workoutColumns, type AuthorRow, type WorkoutRow } from "./db";
import {
  categoryIds,
  durationBuckets,
  goals,
  levels,
  type Author,
  type DurationBucket,
  type Workout,
  type WorkoutFilters,
} from "./types";

/**
 * Content repository. Reads published workouts from Supabase; while the database
 * holds none (or Supabase is not configured) the sample set below shapes the UI.
 */

export const authors: Author[] = [
  { id: "yuliia", name: "Юлія", role: "trainer", specialties: ["yoga", "stretching", "mobility", "kinesiotherapy"], verified: true, instagram: "https://www.instagram.com/julruz_" },
];

/** Authors from the database, falling back to the built-in trainer. */
export const listAuthors = cache(async (): Promise<Author[]> => {
  const db = await getDb();
  if (!db) return authors;
  const { data } = await db.from("authors").select(authorColumns).order("created_at");
  const rows = (data ?? []) as AuthorRow[];
  return rows.length > 0 ? rows.map(rowToAuthor) : authors;
});

export async function getAuthor(id: string): Promise<Author | undefined> {
  return (await listAuthors()).find((a) => a.id === id);
}

/**
 * Sample sessions. Neutral names and descriptions that only describe a format,
 * no promises and no invented results. Every `video` is null until real files arrive.
 */
const sampleWorkouts: Workout[] = [
  {
    id: "w-spine-warmup",
    slug: "gentle-spine-warm-up",
    title: { en: "Gentle spine warm-up", uk: "М’яка розминка хребта", de: "Sanftes Aufwärmen der Wirbelsäule" },
    description: {
      en: "A calm sequence that moves the spine through its ranges segment by segment. Suitable as a daily start.",
      uk: "Спокійна послідовність, що м’яко проводить хребет через його діапазони руху. Підходить як щоденний старт.",
      de: "Eine ruhige Abfolge, die die Wirbelsäule Segment für Segment durch ihre Bewegungsbereiche führt. Als täglicher Einstieg geeignet.",
    },
    category: "kinesiotherapy",
    durationMin: 12,
    level: "beginner",
    goals: ["mobility", "posture"],
    access: "free",
    language: "uk",
    coverTone: "deep",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-01",
    sample: true,
  },
  {
    id: "w-hip-control",
    slug: "hip-and-pelvis-control",
    title: { en: "Hip and pelvis control", uk: "Контроль таза та кульшових суглобів", de: "Hüft- und Beckenkontrolle" },
    description: {
      en: "Slow, controlled movements for the hips and pelvis with attention to alignment.",
      uk: "Повільні контрольовані рухи для таза та кульшових суглобів з увагою до положення тіла.",
      de: "Langsame, kontrollierte Bewegungen für Hüfte und Becken mit Blick auf die Ausrichtung.",
    },
    category: "kinesiotherapy",
    durationMin: 22,
    level: "intermediate",
    goals: ["mobility", "strength"],
    access: "free",
    language: "uk",
    coverTone: "light",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-02",
    sample: true,
  },
  {
    id: "w-morning-flow",
    slug: "morning-flow",
    title: { en: "Morning flow", uk: "Ранковий флоу", de: "Morgen-Flow" },
    description: {
      en: "A light yoga flow to wake the body up. Breath-led, no complex poses.",
      uk: "Легкий йога-флоу, щоб розбудити тіло. Ведеться диханням, без складних поз.",
      de: "Ein leichter Yoga-Flow zum Aufwachen. Vom Atem geführt, ohne komplexe Haltungen.",
    },
    category: "yoga",
    durationMin: 18,
    level: "beginner",
    goals: ["energy", "mobility"],
    access: "free",
    language: "uk",
    coverTone: "deep",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-03",
    sample: true,
  },
  {
    id: "w-evening-wind-down",
    slug: "evening-wind-down",
    title: { en: "Evening wind-down", uk: "Вечірнє розслаблення", de: "Abendliches Runterkommen" },
    description: {
      en: "Slow floor-based yoga for the end of the day. Long holds and quiet breathing.",
      uk: "Повільна йога на підлозі для завершення дня. Довгі утримання та спокійне дихання.",
      de: "Langsames Boden-Yoga für den Tagesausklang. Lange Haltephasen und ruhige Atmung.",
    },
    category: "yoga",
    durationMin: 25,
    level: "beginner",
    goals: ["relax", "recovery"],
    access: "free",
    language: "uk",
    coverTone: "mint",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-04",
    sample: true,
  },
  {
    id: "w-core-foundations",
    slug: "core-foundations",
    title: { en: "Core foundations", uk: "Основи кору", de: "Core-Grundlagen" },
    description: {
      en: "Pilates basics for the centre of the body: breathing, neutral spine and small precise movements.",
      uk: "Основи пілатесу для центру тіла: дихання, нейтральний хребет і малі точні рухи.",
      de: "Pilates-Basics für die Körpermitte: Atmung, neutrale Wirbelsäule und kleine präzise Bewegungen.",
    },
    category: "pilates",
    durationMin: 20,
    level: "beginner",
    goals: ["strength", "posture"],
    access: "free",
    language: "uk",
    coverTone: "light",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-05",
    sample: true,
  },
  {
    id: "w-full-body-control",
    slug: "full-body-control",
    title: { en: "Full-body control", uk: "Контроль усього тіла", de: "Ganzkörperkontrolle" },
    description: {
      en: "A longer Pilates session that links the core with the arms and legs.",
      uk: "Довше заняття з пілатесу, що пов’язує кор із руками та ногами.",
      de: "Eine längere Pilates-Einheit, die die Körpermitte mit Armen und Beinen verbindet.",
    },
    category: "pilates",
    durationMin: 35,
    level: "intermediate",
    goals: ["strength"],
    access: "free",
    language: "uk",
    coverTone: "deep",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-06",
    sample: true,
  },
  {
    id: "w-hamstrings-hips",
    slug: "hamstrings-and-hips",
    title: { en: "Hamstrings and hips", uk: "Задня поверхня стегна та кульшові", de: "Hamstrings und Hüften" },
    description: {
      en: "Stretching for the back of the legs and the hips, with calm transitions.",
      uk: "Розтяжка задньої поверхні ніг і кульшових суглобів зі спокійними переходами.",
      de: "Dehnung für die Beinrückseite und die Hüften mit ruhigen Übergängen.",
    },
    category: "stretching",
    durationMin: 15,
    level: "beginner",
    goals: ["mobility", "recovery"],
    access: "free",
    language: "uk",
    coverTone: "mint",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-07",
    sample: true,
  },
  {
    id: "w-deep-stretch",
    slug: "deep-stretch-after-work",
    title: { en: "Deep stretch after work", uk: "Глибока розтяжка після роботи", de: "Tiefe Dehnung nach der Arbeit" },
    description: {
      en: "A full stretching session for the end of a sitting day. Hips, chest, neck and back.",
      uk: "Повне заняття з розтяжки після дня сидіння. Кульшові, груди, шия та спина.",
      de: "Eine komplette Dehn-Einheit nach einem Sitztag. Hüften, Brust, Nacken und Rücken.",
    },
    category: "stretching",
    durationMin: 30,
    level: "intermediate",
    goals: ["relax", "recovery"],
    access: "free",
    language: "uk",
    coverTone: "deep",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-08",
    sample: true,
  },
  {
    id: "w-shoulders-thoracic",
    slug: "shoulders-and-thoracic-spine",
    title: { en: "Shoulders and thoracic spine", uk: "Плечі та грудний відділ", de: "Schultern und Brustwirbelsäule" },
    description: {
      en: "Mobility drills for the shoulder girdle and the upper back.",
      uk: "Вправи на мобільність плечового пояса та верхньої частини спини.",
      de: "Mobilitätsübungen für den Schultergürtel und den oberen Rücken.",
    },
    category: "mobility",
    durationMin: 14,
    level: "beginner",
    goals: ["mobility", "posture"],
    access: "free",
    language: "uk",
    coverTone: "light",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-09",
    sample: true,
  },
  {
    id: "w-ankles-knees-hips",
    slug: "ankles-knees-hips",
    title: { en: "Ankles, knees, hips", uk: "Гомілки, коліна, кульшові", de: "Sprunggelenke, Knie, Hüften" },
    description: {
      en: "Joint-by-joint mobility for the lower body, from the feet upward.",
      uk: "Мобільність нижньої частини тіла суглоб за суглобом, від стоп угору.",
      de: "Mobilität für den Unterkörper Gelenk für Gelenk, von den Füßen aufwärts.",
    },
    category: "mobility",
    durationMin: 20,
    level: "intermediate",
    goals: ["mobility"],
    access: "free",
    language: "uk",
    coverTone: "deep",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-10",
    sample: true,
  },
  {
    id: "w-back-ten",
    slug: "back-care-10-minutes",
    title: { en: "Back care: 10 minutes", uk: "Турбота про спину: 10 хвилин", de: "Rückenpflege: 10 Minuten" },
    description: {
      en: "A short daily routine of gentle movements for the back. No equipment.",
      uk: "Коротка щоденна рутина з м’яких рухів для спини. Без обладнання.",
      de: "Eine kurze tägliche Routine sanfter Bewegungen für den Rücken. Ohne Hilfsmittel.",
    },
    category: "back",
    durationMin: 10,
    level: "beginner",
    goals: ["posture", "recovery"],
    access: "free",
    language: "uk",
    coverTone: "mint",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-11",
    sample: true,
  },
  {
    id: "w-strong-back",
    slug: "strong-back-basics",
    title: { en: "Strong back basics", uk: "Основи міцної спини", de: "Grundlagen für einen starken Rücken" },
    description: {
      en: "Foundational strengthening for the muscles that support the spine.",
      uk: "Базове зміцнення м’язів, що підтримують хребет.",
      de: "Grundlegende Kräftigung der Muskulatur, die die Wirbelsäule stützt.",
    },
    category: "back",
    durationMin: 28,
    level: "intermediate",
    goals: ["strength", "posture"],
    access: "free",
    language: "uk",
    coverTone: "deep",
    video: null,
    authorId: "yuliia",
    publishedAt: "2026-10-12",
    sample: true,
  },
];

export function bucketOf(durationMin: number): DurationBucket {
  if (durationMin < 15) return "short";
  if (durationMin <= 30) return "medium";
  return "long";
}

const fetchAll = cache(async (): Promise<Workout[]> => {
  const db = await getDb();
  if (!db) return sampleWorkouts;
  const { data, error } = await db.from("workouts").select(workoutColumns).eq("published", true).order("published_at", { ascending: false });
  if (error || !data || data.length === 0) return sampleWorkouts;
  return (data as unknown as WorkoutRow[]).map(rowToWorkout);
});

export async function listWorkouts(filters: WorkoutFilters = {}): Promise<Workout[]> {
  const all = await fetchAll();
  return all
    .filter((w) => !filters.category || w.category === filters.category)
    .filter((w) => !filters.duration || bucketOf(w.durationMin) === filters.duration)
    .filter((w) => !filters.goal || w.goals.includes(filters.goal))
    .filter((w) => !filters.level || w.level === filters.level)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export async function getWorkout(slug: string): Promise<Workout | undefined> {
  return (await fetchAll()).find((w) => w.slug === slug);
}

export async function getWorkoutById(id: string): Promise<Workout | undefined> {
  return (await fetchAll()).find((w) => w.id === id);
}

type SearchParams = Record<string, string | string[] | undefined>;

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Reads ?category=&duration=&goal=&level= and keeps only known values. */
export function parseFilters(params: SearchParams): WorkoutFilters {
  const category = one(params.category);
  const duration = one(params.duration);
  const goal = one(params.goal);
  const level = one(params.level);
  const inList = <T extends string>(list: readonly T[], v: string | undefined): T | undefined =>
    v && (list as readonly string[]).includes(v) ? (v as T) : undefined;
  return {
    category: inList(categoryIds, category),
    duration: inList(durationBuckets, duration),
    goal: inList(goals, goal),
    level: inList(levels, level),
  };
}

/** Session of the day: rotates through the catalogue by calendar day, same for everyone. */
export async function getTodayWorkout(date = new Date()): Promise<Workout | undefined> {
  const all = await listWorkouts();
  if (all.length === 0) return undefined;
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86_400_000);
  return all[dayOfYear % all.length];
}
