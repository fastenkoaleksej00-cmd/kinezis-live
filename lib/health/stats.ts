import type { ActivityEntry, Measurement } from "@/lib/profile/types";

export interface ActivityStats {
  sessions: number;
  totalMinutes: number;
  longestMin: number;
  currentStreak: number;
  bestStreak: number;
  /** ISO dates (YYYY-MM-DD) with at least one session, newest first */
  activeDays: string[];
  weeks: Array<{ start: string; count: number }>;
  /** Minutes logged in the current calendar week (Mon–Sun) */
  weekMinutes: number;
}

const dayKey = (iso: string) => iso.slice(0, 10);

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

/** Pure, deterministic numbers from the log. No estimates, nothing invented. */
export function computeActivityStats(log: ActivityEntry[], today = new Date()): ActivityStats {
  const days = new Set(log.map((e) => dayKey(e.completedAt)));
  const sorted = [...days].sort().reverse();
  const totalMinutes = log.reduce((n, e) => n + (e.durationMin ?? 0), 0);
  const longestMin = log.reduce((m, e) => Math.max(m, e.durationMin ?? 0), 0);

  const todayKey = dayKey(today.toISOString());
  let cursor = days.has(todayKey) ? today : addDays(today, -1);
  let currentStreak = 0;
  while (days.has(dayKey(cursor.toISOString()))) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let bestStreak = 0;
  let run = 0;
  let prev: Date | null = null;
  for (const k of [...days].sort()) {
    const d = new Date(`${k}T00:00:00Z`);
    run = prev && addDays(prev, 1).toISOString().slice(0, 10) === k ? run + 1 : 1;
    bestStreak = Math.max(bestStreak, run);
    prev = d;
  }

  // Last 12 weeks, Monday-based
  const weeks: ActivityStats["weeks"] = [];
  const monday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const offset = (monday.getUTCDay() + 6) % 7;
  monday.setUTCDate(monday.getUTCDate() - offset);
  for (let w = 11; w >= 0; w--) {
    const start = addDays(monday, -7 * w);
    const end = addDays(start, 7);
    const count = log.filter((e) => {
      const t = new Date(e.completedAt).getTime();
      return t >= start.getTime() && t < end.getTime();
    }).length;
    weeks.push({ start: start.toISOString().slice(0, 10), count });
  }

  const weekStart = addDays(monday, 0).getTime();
  const weekMinutes = log.filter((e) => new Date(e.completedAt).getTime() >= weekStart).reduce((n, e) => n + (e.durationMin ?? 0), 0);

  return { sessions: log.length, totalMinutes, longestMin, currentStreak, bestStreak, activeDays: sorted, weeks, weekMinutes };
}

export type Period = "week" | "month" | "quarter" | "year";

export function filterByPeriod<T extends { measuredOn: string }>(items: T[], period: Period, today = new Date()): T[] {
  const days = period === "week" ? 7 : period === "month" ? 30 : period === "quarter" ? 90 : 365;
  const from = addDays(today, -days).toISOString().slice(0, 10);
  return items.filter((i) => i.measuredOn >= from);
}

/** Body mass index, rounded to one decimal. An orientation only, shown with a disclaimer. */
export function bmi(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm) return null;
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

export function latestWeight(ms: Measurement[]): Measurement | undefined {
  return [...ms].reverse().find((m) => m.weightKg !== null);
}

export function ageFromBirthDate(birthDate: string | null, today = new Date()): number | null {
  if (!birthDate) return null;
  const b = new Date(birthDate);
  let age = today.getUTCFullYear() - b.getUTCFullYear();
  const m = today.getUTCMonth() - b.getUTCMonth();
  if (m < 0 || (m === 0 && today.getUTCDate() < b.getUTCDate())) age -= 1;
  return age >= 0 && age < 130 ? age : null;
}
