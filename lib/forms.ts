import type { LocalizedText } from "@/lib/content/types";

/** FormData helpers shared by every server action file (one behaviour everywhere). */
export const str = (fd: FormData, key: string): string => String(fd.get(key) ?? "").trim();

export const bool = (fd: FormData, key: string): boolean => fd.get(key) === "on";

/** Number with a comma or dot decimal separator; null when empty or not a number */
export function num(fd: FormData, key: string): number | null {
  const v = str(fd, key).replace(",", ".");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Up to `max` non-empty lines (newline- or comma-separated) */
export function lines(fd: FormData, key: string, max = 10): string[] {
  return str(fd, key)
    .split(/\r?\n|,/)
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, max);
}

/** `<base>_en` is required; uk/de/ru are added when filled */
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
