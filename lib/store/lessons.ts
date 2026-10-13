"use client";

import { useCallback } from "react";
import { createLocalStore } from "./localStore";

interface LessonState {
  completed: boolean;
  at: string;
}

type LessonMap = Record<string, LessonState>;

/** Completed lessons, locally for now. Keyed by lesson id. */
export const lessonsStore = createLocalStore<LessonMap>("kl_lessons", {});

export function useLessons() {
  const all = lessonsStore.useStore();
  const isDone = useCallback((id: string) => Boolean(all[id]?.completed), [all]);
  const setDone = useCallback((id: string, completed: boolean) => {
    const current = lessonsStore.read();
    lessonsStore.write({ ...current, [id]: { completed, at: new Date().toISOString() } });
  }, []);
  const doneCount = useCallback((ids: string[]) => ids.filter((id) => all[id]?.completed).length, [all]);
  return { all, isDone, setDone, doneCount };
}
