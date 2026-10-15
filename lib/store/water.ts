"use client";

import { createLocalStore } from "./localStore";

export interface WaterState {
  /** Daily goal in ml (per device until the account syncs it) */
  goal: number;
  /** Preferred portion in ml */
  portion: number;
  /** ml per local day, YYYY-MM-DD */
  days: Record<string, number>;
  /** Last additions today, so one tap can undo */
  lastAdds: number[];
}

export const waterPortions = [150, 250, 330, 500] as const;
export const defaultWater: WaterState = { goal: 2000, portion: 250, days: {}, lastAdds: [] };

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

export function addWater(ml: number): void {
  const s = waterStore.read();
  const key = localDay();
  const next = Math.min(20000, (s.days[key] ?? 0) + ml);
  waterStore.write({ ...s, days: prune({ ...s.days, [key]: next }), lastAdds: [...s.lastAdds.slice(-9), ml] });
}

export function undoWater(): void {
  const s = waterStore.read();
  const last = s.lastAdds[s.lastAdds.length - 1];
  if (!last) return;
  const key = localDay();
  waterStore.write({ ...s, days: { ...s.days, [key]: Math.max(0, (s.days[key] ?? 0) - last) }, lastAdds: s.lastAdds.slice(0, -1) });
}

export function setWaterGoal(goal: number): void {
  const s = waterStore.read();
  waterStore.write({ ...s, goal: Math.min(10000, Math.max(200, Math.round(goal))) });
}

export function setWaterPortion(portion: number): void {
  const s = waterStore.read();
  waterStore.write({ ...s, portion });
}

/** Merge account rows into the local store: the larger value wins per day. */
export function mergeWaterDays(rows: Array<{ day: string; ml: number; goal_ml: number }>): void {
  const s = waterStore.read();
  const days = { ...s.days };
  for (const r of rows) days[r.day] = Math.max(days[r.day] ?? 0, r.ml);
  const latest = rows.sort((a, b) => (a.day < b.day ? 1 : -1))[0];
  waterStore.write({ ...s, days: prune(days), goal: latest ? latest.goal_ml : s.goal });
}
