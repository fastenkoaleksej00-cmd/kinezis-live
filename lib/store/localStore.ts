"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny localStorage-backed store with a React hook. Used for favourites and
 * watch progress until accounts arrive (stage 5), when the same API will sync
 * to the database. Server snapshot is the fallback, so SSR never touches storage.
 */
export function createLocalStore<T>(key: string, fallback: T) {
  const listeners = new Set<() => void>();
  let cachedRaw: string | null | undefined;
  let cachedValue: T = fallback;

  function read(): T {
    if (typeof window === "undefined") return fallback;
    let raw: string | null = null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return fallback;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      try {
        cachedValue = raw ? (JSON.parse(raw) as T) : fallback;
      } catch {
        cachedValue = fallback;
      }
    }
    return cachedValue;
  }

  function write(next: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // Storage may be unavailable (private mode); keep the in-memory value
    }
    cachedRaw = JSON.stringify(next);
    cachedValue = next;
    listeners.forEach((l) => l());
  }

  function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  function useStore(): T {
    return useSyncExternalStore(subscribe, read, () => fallback);
  }

  return { read, write, subscribe, useStore };
}
