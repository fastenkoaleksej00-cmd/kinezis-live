export const locales = ["en", "uk", "de"] as const;
export type Locale = (typeof locales)[number];

/** English is the first-launch language; the user can change it in Settings. */
export const defaultLocale: Locale = "en";

/** Cookie that stores the chosen interface language (separate from content language). */
export const LOCALE_COOKIE = "kl_locale";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
