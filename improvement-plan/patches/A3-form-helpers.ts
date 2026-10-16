// PROPOSED (not applied). Target path: lib/forms.ts
// One place for FormData parsing used by every server action file.
import type { LocalizedText } from "@/lib/content/types";

export const str = (fd: FormData, key: string): string => String(fd.get(key) ?? "").trim();
export const bool = (fd: FormData, key: string): boolean => fd.get(key) === "on";
export function num(fd: FormData, key: string): number | null {
  const raw = str(fd, key).replace(",", ".");
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}
export function inList<T extends string>(list: readonly T[], v: string, fallback: T): T;
export function inList<T extends string>(list: readonly T[], v: string | null | undefined): T | null;
export function inList<T extends string>(list: readonly T[], v: string | null | undefined, fallback?: T): T | null {
  return v && (list as readonly string[]).includes(v) ? (v as T) : (fallback ?? null);
}
export function lines(fd: FormData, key: string, max = 10): string[] {
  return str(fd, key).split(/\r?\n|,/).map((l) => l.trim()).filter(Boolean).slice(0, max);
}
export function localized(fd: FormData, base: string): LocalizedText | null {
  const en = str(fd, `${base}_en`);
  if (!en) return null;
  const out: LocalizedText = { en };
  for (const l of ["uk", "de", "ru"] as const) {
    const v = str(fd, `${base}_${l}`);
    if (v) out[l] = v;
  }
  return out;
}
