"use client";

import { useCallback } from "react";
import { createLocalStore } from "./localStore";

/** Saved item ids, e.g. "workout:w-morning-flow". Posts and courses will use their own prefixes. */
const store = createLocalStore<string[]>("kl_favorites", []);

export function useFavorites() {
  const ids = store.useStore();

  const has = useCallback((key: string) => ids.includes(key), [ids]);

  const toggle = useCallback((key: string) => {
    const current = store.read();
    const next = current.includes(key) ? current.filter((k) => k !== key) : [key, ...current];
    store.write(next);
  }, []);

  return { ids, has, toggle };
}
