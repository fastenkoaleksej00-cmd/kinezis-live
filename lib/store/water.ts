"use client";

import { createLocalStore } from "./localStore";

export interface WaterEvent {
  /** Epoch ms */
  at: number;
  /** Signed ml: positive for additions, negative for corrections */
  ml: number;
}

export interface WaterState {
  /** Daily goal in ml (per device until the account syncs it) */
  goal: number;
  /** Step used by + and −, in ml */
  portion: number;
  /** ml per local day, YYYY-MM-DD */
  days: Record<string, number>;
  /** Today's changes with timestamps (pruned when the day changes); used for undo and the rapid-intake check */
  events: WaterEvent[];
}

export const waterPortions = [50, 100, 150, 250, 330, 500] as const;
export const defaultWater: WaterState = { goal: 2000, portion: 250, days: {}, events: [] };
/** Owner decision: the tracker never counts more than 3 L a day, and the goal cannot exceed it */
export const MAX_DAY = 3000;
export const MAX_GOAL = 3000;

/** Local calendar day, not UTC: a glass at 23:30 belongs to today. */
export function localDay(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export const waterStore = createLocalStore<WaterState>("kl_water", defaultWater);

function prune(days: Record<string, number>): Record<string, number> {
  const keys = Object.keys(days).sort().slice(-60);
  return Object.fromEntries(keys.map((k) => [k, days[k]]));
}

/** Normalises older stored shapes and drops events from previous days, so days never mix. */
function current(): WaterState {
  const raw = waterStore.read() as Partial<WaterState> & { lastAdds?: number[] };
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const events = (Array.isArray(raw.events) ? raw.events : []).filter((e) => typeof e.at === "number" && e.at >= startOfDay.getTime());
  const days = Object.fromEntries(Object.entries(raw.days ?? {}).map(([k, v]) => [k, Math.min(MAX_DAY, v)]));
  return { goal: Math.min(MAX_GOAL, raw.goal ?? defaultWater.goal), portion: raw.portion ?? defaultWater.portion, days, events };
}

function setToday(ml: number, event: WaterEvent | null): void {
  const s = current();
  const key = localDay();
  const next = Math.min(MAX_DAY, Math.max(0, Math.round(ml)));
  const events = event ? [...s.events.slice(-49), event] : s.events;
  waterStore.write({ ...s, days: prune({ ...s.days, [key]: next }), events });
}

export function todayMl(s: WaterState): number {
  return s.days[localDay()] ?? 0;
}

export function addWater(ml: number): void {
  const s = current();
  const today = todayMl(s);
  const applied = Math.min(MAX_DAY - today, ml);
  if (applied <= 0) return;
  setToday(today + applied, { at: Date.now(), ml: applied });
}

/** Subtracts one step; stops at zero and records the correction so undo stays consistent */
export function removeWater(ml: number): void {
  const s = current();
  const today = todayMl(s);
  const applied = Math.min(today, ml);
  if (applied <= 0) return;
  setToday(today - applied, { at: Date.now(), ml: -applied });
}

/** Reverts the most recent change (addition or correction) */
export function undoWater(): void {
  const s = current();
  const last = s.events[s.events.length - 1];
  if (!last) return;
  const key = localDay();
  const next = Math.min(MAX_DAY, Math.max(0, (s.days[key] ?? 0) - last.ml));
  waterStore.write({ ...s, days: prune({ ...s.days, [key]: next }), events: s.events.slice(0, -1) });
}

/** Manual correction of the day total; the difference is recorded as one event */
export function setTodayTotal(ml: number): void {
  const s = current();
  const today = todayMl(s);
  const next = Math.min(MAX_DAY, Math.max(0, Math.round(ml)));
  if (next === today) return;
  setToday(next, { at: Date.now(), ml: next - today });
}

export function setWaterGoal(goal: number): void {
  const s = current();
  waterStore.write({ ...s, goal: Math.min(MAX_GOAL, Math.max(200, Math.round(goal))) });
}

export function setWaterPortion(portion: number): void {
  const s = current();
  waterStore.write({ ...s, portion });
}

/** ml added within the last `minutes` (corrections excluded) */
export function recentIntake(s: WaterState, minutes: number, now = Date.now()): number {
  const since = now - minutes * 60000;
  return s.events.filter((e) => e.ml > 0 && e.at >= since).reduce((n, e) => n + e.ml, 0);
}

/** Merge account rows into the local store: the larger value wins per day. */
export function mergeWaterDays(rows: Array<{ day: string; ml: number; goal_ml: number }>): void {
  const s = current();
  const days = { ...s.days };
  for (const r of rows) days[r.day] = Math.min(MAX_DAY, Math.max(days[r.day] ?? 0, r.ml));
  const latest = [...rows].sort((a, b) => (a.day < b.day ? 1 : -1))[0];
  waterStore.write({ ...s, days: prune(days), goal: Math.min(MAX_GOAL, latest ? latest.goal_ml : s.goal) });
}
