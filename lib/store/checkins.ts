"use client";

import { createLocalStore } from "./localStore";
import { localDay } from "./water";
import { markHabit } from "./habits";

export const checkinScales = ["mood", "energy", "sleep", "tension"] as const;
export type CheckinScale = (typeof checkinScales)[number];

export interface Checkin {
  mood?: number;
  energy?: number;
  sleep?: number;
  tension?: number;
  gratitude?: string;
  updatedAt: string;
}

export interface CheckinsState {
  days: Record<string, Checkin>;
}

/** Daily well-being check-in, per local day. Synced to `wellbeing_checkins` by UserDataSync when signed in. */
export const checkinsStore = createLocalStore<CheckinsState>("kl_checkins", { days: {} });

export function saveCheckin(patch: Partial<Omit<Checkin, "updatedAt">>, day = localDay()): void {
  const s = checkinsStore.read();
  const next: Checkin = { ...(s.days[day] ?? {}), ...patch, updatedAt: new Date().toISOString() };
  const keys = Object.keys({ ...s.days, [day]: null }).sort().slice(-400);
  const days: Record<string, Checkin> = {};
  for (const k of keys) days[k] = k === day ? next : s.days[k];
  checkinsStore.write({ days });
  if (checkinScales.some((k) => typeof next[k] === "number")) markHabit("journal", day);
}

export interface CheckinRow {
  day: string;
  mood: number | null;
  energy: number | null;
  sleep: number | null;
  tension: number | null;
  gratitude: string | null;
  updated_at: string;
}

/** Newest wins per day */
export function mergeCheckins(rows: CheckinRow[]): void {
  const s = checkinsStore.read();
  const days = { ...s.days };
  for (const r of rows) {
    const local = days[r.day];
    if (!local || local.updatedAt < r.updated_at) {
      days[r.day] = { mood: r.mood ?? undefined, energy: r.energy ?? undefined, sleep: r.sleep ?? undefined, tension: r.tension ?? undefined, gratitude: r.gratitude ?? undefined, updatedAt: r.updated_at };
    }
  }
  checkinsStore.write({ days });
}

export function toRow(userId: string, day: string, c: Checkin) {
  return { user_id: userId, day, mood: c.mood ?? null, energy: c.energy ?? null, sleep: c.sleep ?? null, tension: c.tension ?? null, gratitude: c.gratitude?.slice(0, 500) ?? null, updated_at: c.updatedAt };
}
