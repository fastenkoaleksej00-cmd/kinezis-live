import type { CategoryId, LocalizedText } from "@/lib/content/types";

/**
 * Audio shipped with the app (public/audio). Add a track: copy the file to public/audio with a latin name
 * and add one entry here. Keep the credit line when the source requires attribution.
 */
export type TrackKind = "nature" | "music";
export interface Track {
  id: string;
  kind: TrackKind;
  file: string;
  title: LocalizedText;
  /** Seconds, for display */
  duration: number;
  credit?: string;
  /** Library categories where this music is suggested before a session */
  suggestFor?: CategoryId[];
}

const calm: CategoryId[] = ["yoga", "stretching", "mobility", "pilates", "kinesiotherapy", "back"];

export const tracks: Track[] = [
  { id: "rain", kind: "nature", file: "/audio/rain.mp3", duration: 914, title: { en: "Rain", ru: "Дождь", uk: "Дощ", de: "Regen" } },
  { id: "sea", kind: "nature", file: "/audio/sea.mp3", duration: 61, title: { en: "Sea and gulls", ru: "Море и чайки", uk: "Море й чайки", de: "Meer und Möwen" } },
  { id: "wind", kind: "nature", file: "/audio/wind.mp3", duration: 123, title: { en: "Steppe wind", ru: "Ветер в степи", uk: "Вітер у степу", de: "Steppenwind" }, credit: "noisefx.ru" },
  { id: "yoga-1", kind: "music", file: "/audio/yoga-1.mp3", duration: 175, title: { en: "Yoga music 1", ru: "Музыка для йоги 1", uk: "Музика для йоги 1", de: "Yogamusik 1" }, suggestFor: calm },
  { id: "yoga-2", kind: "music", file: "/audio/yoga-2.mp3", duration: 215, title: { en: "Yoga music 2", ru: "Музыка для йоги 2", uk: "Музика для йоги 2", de: "Yogamusik 2" }, suggestFor: calm },
  { id: "yoga-3", kind: "music", file: "/audio/yoga-3.mp3", duration: 120, title: { en: "Whisper of the wind", ru: "Шёпот ветра", uk: "Шепіт вітру", de: "Flüstern des Windes" }, credit: "Zvukogram.com", suggestFor: calm },
  { id: "yoga-4", kind: "music", file: "/audio/yoga-4.mp3", duration: 248, title: { en: "Yoga music 4", ru: "Музыка для йоги 4", uk: "Музика для йоги 4", de: "Yogamusik 4" }, suggestFor: calm },
];

export const trackById = Object.fromEntries(tracks.map((t) => [t.id, t])) as Record<string, Track>;
export const natureTracks = tracks.filter((t) => t.kind === "nature");
export const musicTracks = tracks.filter((t) => t.kind === "music");
export function musicFor(category: CategoryId): Track[] {
  return musicTracks.filter((t) => t.suggestFor?.includes(category));
}
