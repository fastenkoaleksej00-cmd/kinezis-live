import type { Locale } from "@/i18n/config";
import type { LocalizedText, Workout, WorkoutCardData } from "./types";

export function pick(text: LocalizedText, locale: Locale): string {
  return text[locale] ?? text.en;
}

export function toCardData(w: Workout, locale: Locale): WorkoutCardData {
  return {
    id: w.id,
    slug: w.slug,
    title: pick(w.title, locale),
    category: w.category,
    durationMin: w.durationMin,
    level: w.level,
    coverTone: w.coverTone,
    hasVideo: w.video !== null,
    access: w.access,
  };
}
