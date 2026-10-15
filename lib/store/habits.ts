"use client";

import { createLocalStore } from "./localStore";
import { localDay } from "./water";

/** Daily habit marks on this device; feed the challenges. Nothing is inferred, only what the member finished. */
export const habitKinds = ["breath", "meditation", "screenBreak", "evening", "journal"] as const;
export type HabitKind = (typeof habitKinds)[number];

export interface HabitsState {
  days: Record<string, HabitKind[]>;
}

export const habitsStore = createLocalStore<HabitsState>("kl_habits", { days: {} });

export function markHabit(kind: HabitKind, day = localDay()): void {
  const s = habitsStore.read();
  const list = s.days[day] ?? [];
  if (list.includes(kind)) return;
  const keys = Object.keys({ ...s.days, [day]: [] }).sort().slice(-120);
  const days: Record<string, HabitKind[]> = {};
  for (const k of keys) days[k] = k === day ? [...list, kind] : s.days[k];
  habitsStore.write({ days });
}

export function hasHabit(s: HabitsState, kind: HabitKind, day: string): boolean {
  return s.days[day]?.includes(kind) ?? false;
}
