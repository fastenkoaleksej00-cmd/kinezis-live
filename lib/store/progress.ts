"use client";

import { useCallback } from "react";
import { createLocalStore } from "./localStore";

export interface ProgressEntry {
  /** Seconds watched up to */
  position: number;
  /** Total length in seconds, when known */
  duration: number;
  updatedAt: string;
  completed: boolean;
}

type ProgressMap = Record<string, ProgressEntry>;

export const progressStore = createLocalStore<ProgressMap>("kl_progress", {});

/** Treat the last 5% as finished so a session does not resume at the credits. */
const COMPLETE_RATIO = 0.95;

export function useProgress() {
  const all = progressStore.useStore();

  const get = useCallback((id: string): ProgressEntry | undefined => all[id], [all]);

  const update = useCallback((id: string, position: number, duration: number) => {
    const completed = duration > 0 && position / duration >= COMPLETE_RATIO;
    const current = progressStore.read();
    progressStore.write({
      ...current,
      [id]: { position, duration, completed, updatedAt: new Date().toISOString() },
    });
  }, []);

  return { all, get, update };
}

/** Most recently touched, unfinished session. */
export function useLastInProgress(): { id: string; entry: ProgressEntry } | null {
  const all = progressStore.useStore();
  let best: { id: string; entry: ProgressEntry } | null = null;
  for (const [id, entry] of Object.entries(all)) {
    if (entry.completed || entry.position < 5) continue;
    if (!best || entry.updatedAt > best.entry.updatedAt) best = { id, entry };
  }
  return best;
}
