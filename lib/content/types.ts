import type { Locale } from "@/i18n/config";

/** Language of the content itself (voice-over, on-screen text). Independent of the UI language. */
export type ContentLanguage = Locale;

/** Text that may exist in several languages. English is the required fallback. */
export type LocalizedText = { en: string } & Partial<Record<Locale, string>>;

export const categoryIds = ["kinesiotherapy", "yoga", "pilates", "stretching", "mobility", "back"] as const;
export type CategoryId = (typeof categoryIds)[number];

export const levels = ["beginner", "intermediate", "advanced"] as const;
export type Level = (typeof levels)[number];

export const goals = ["mobility", "posture", "relax", "strength", "energy", "recovery"] as const;
export type Goal = (typeof goals)[number];

/** short: under 15 min, medium: 15–30 min, long: over 30 min */
export const durationBuckets = ["short", "medium", "long"] as const;
export type DurationBucket = (typeof durationBuckets)[number];

/** Free/premium split exists in the model only; no paywall UI until the subscription stage. */
export type Access = "free" | "premium";

export type CoverTone = "deep" | "mint" | "light";

/**
 * Where the video lives. `null` means not connected yet, and the player shows an honest empty state.
 * Stage 5 adds the real host (signed URLs); large files never go into the repo or the database.
 */
export type VideoSource =
  | { kind: "file"; src: string; poster?: string }
  | { kind: "hls"; src: string; poster?: string }
  /** Uploaded through the admin panel into Supabase Storage; played via a signed URL */
  | { kind: "storage"; bucket: "videos" | "member-videos"; path: string; poster?: string }
  | null;

/** What the player actually receives after the source has been resolved to a playable URL. */
export interface PlayableVideo {
  src: string;
  poster?: string;
}

export interface Author {
  id: string;
  name: string;
  role: "trainer" | "author";
  bio?: LocalizedText;
  specialties: string[];
  verified: boolean;
  avatarSrc?: string;
  instagram?: string;
}

export interface Workout {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  category: CategoryId;
  durationMin: number;
  level: Level;
  goals: Goal[];
  access: Access;
  language: ContentLanguage;
  coverTone: CoverTone;
  video: VideoSource;
  authorId: string;
  publishedAt: string;
  /** Sample item used to shape the UI before real content exists */
  sample?: boolean;
}

export interface WorkoutFilters {
  category?: CategoryId;
  duration?: DurationBucket;
  goal?: Goal;
  level?: Level;
}

/** Flat, already-localised shape that cards and client components can receive. */
export interface WorkoutCardData {
  id: string;
  slug: string;
  title: string;
  category: CategoryId;
  durationMin: number;
  level: Level;
  coverTone: CoverTone;
  hasVideo: boolean;
  access: Access;
}

/* ----------------------------------------------------------------------------
   Trainer feed
---------------------------------------------------------------------------- */

/** What a post mainly is. Drives the small label on the card. */
export type PostKind = "news" | "tip" | "session" | "video" | "photo";

/**
 * Optional attachment. Photos use brand covers until real images arrive;
 * video follows the same VideoSource rules as workouts; a session links to the library.
 */
export type PostAttachment =
  | { kind: "photo"; coverTone: CoverTone; alt: LocalizedText; src?: string }
  | { kind: "video"; coverTone: CoverTone; source: VideoSource; durationSec?: number }
  | { kind: "workout"; workoutId: string };

export interface Post {
  id: string;
  kind: PostKind;
  /** Trainer/author id for staff posts; empty for member posts */
  authorId: string;
  /** Member who posted (community post) */
  userId?: string;
  category?: string;
  hidden?: boolean;
  title?: LocalizedText;
  body: LocalizedText;
  attachment?: PostAttachment;
  language: ContentLanguage;
  access: Access;
  publishedAt: string;
  /** Reactions and comments exist in the model only; no UI sends anything yet. */
  reactionsEnabled: boolean;
  commentsEnabled: boolean;
  sample?: boolean;
}

/* ----------------------------------------------------------------------------
   Face Fitness courses
---------------------------------------------------------------------------- */

export interface Lesson {
  id: string;
  slug: string;
  title: LocalizedText;
  summary?: LocalizedText;
  durationMin?: number;
  video: VideoSource;
  /** Step-by-step routine shown under the video */
  routine?: LocalizedText[];
  /** Free-text recommendations from the author */
  recommendations?: LocalizedText;
  access: Access;
}

export interface CourseModule {
  id: string;
  title: LocalizedText;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  slug: string;
  title: LocalizedText;
  description: LocalizedText;
  coverTone: CoverTone;
  level: Level;
  access: Access;
  language: ContentLanguage;
  authorId: string;
  modules: CourseModule[];
  publishedAt: string;
  sample?: boolean;
}

/* ----------------------------------------------------------------------------
   Cosmetics & Skincare
---------------------------------------------------------------------------- */

export type RoutineTime = "morning" | "evening" | "weekly";

export interface SkinRoutine {
  id: string;
  slug: string;
  title: LocalizedText;
  time: RoutineTime;
  steps: LocalizedText[];
  language: ContentLanguage;
  access: Access;
  publishedAt: string;
}

export interface SkinArticle {
  id: string;
  slug: string;
  title: LocalizedText;
  body: LocalizedText;
  language: ContentLanguage;
  access: Access;
  publishedAt: string;
}

export type ProductCategory = "cleanser" | "toner" | "serum" | "moisturizer" | "spf" | "mask" | "tool" | "other";

/** A real product entered by the trainer. Nothing here is invented by the app. */
export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: LocalizedText;
  ingredients: string[];
  usage: LocalizedText;
  purchaseUrl?: string;
  imageSrc?: string;
  language: ContentLanguage;
  access: Access;
  publishedAt: string;
}

/* ----------------------------------------------------------------------------
   Nutrition: the trainer's day on a plate. An example, never a prescription.
---------------------------------------------------------------------------- */

export const mealSlots = ["breakfast", "lunch", "dinner", "snacks"] as const;
export type MealSlot = (typeof mealSlots)[number];

export interface Meal {
  slot: MealSlot;
  text: LocalizedText;
}

export interface MealPlan {
  id: string;
  slug: string;
  title: LocalizedText;
  date?: string;
  meals: Meal[];
  notes?: LocalizedText;
  authorId: string;
  language: ContentLanguage;
  access: Access;
  publishedAt: string;
}
