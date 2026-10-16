"use client";

/**
 * Personal per-device data. Cleared on sign-out so the next person on a shared phone does not see
 * someone else's mood journal or water log. Synced data comes back from the account on the next sign-in.
 * Appearance, language, quick-access layout and tips stay.
 */
const PERSONAL_KEYS = ["kl_checkins", "kl_water", "kl_habits", "kl_favorites", "kl_progress", "kl_lessons", "kl_shopping", "kl_challenges"];

export function clearPersonalData(): void {
  for (const key of PERSONAL_KEYS) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // private mode: nothing stored
    }
  }
}
