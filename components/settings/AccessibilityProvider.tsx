"use client";

import { useEffect, useSyncExternalStore } from "react";

export type TextSize = "normal" | "large" | "xl";
export type Theme = "system" | "light" | "dark";

interface A11y {
  textSize: TextSize;
  reduceMotion: boolean;
  theme: Theme;
}

const KEY = "kl_a11y";
const fallback: A11y = { textSize: "normal", reduceMotion: false, theme: "system" };
const listeners = new Set<() => void>();
let cached: A11y = fallback;
let cachedRaw: string | null | undefined;

function read(): A11y {
  if (typeof window === "undefined") return fallback;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return fallback;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cached = raw ? { ...fallback, ...(JSON.parse(raw) as Partial<A11y>) } : fallback;
    } catch {
      cached = fallback;
    }
  }
  return cached;
}

export function writeA11y(next: A11y): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // private mode: keep in memory
  }
  cachedRaw = JSON.stringify(next);
  cached = next;
  apply(next);
  listeners.forEach((l) => l());
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return theme;
}

function apply(a: A11y) {
  const el = document.documentElement;
  el.dataset.textSize = a.textSize;
  if (a.reduceMotion) el.dataset.reduceMotion = "true";
  else delete el.dataset.reduceMotion;
  const resolved = resolveTheme(a.theme);
  el.dataset.theme = resolved;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolved === "dark" ? "#0d171c" : "#f5f8f8");
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Per-device accessibility settings (text size, reduced motion). Stored locally, applied as data attributes. */
export function useA11y(): A11y {
  return useSyncExternalStore(subscribe, read, () => fallback);
}

/** Mounted once in the root layout; applies the stored settings on load. */
export function AccessibilityProvider() {
  useEffect(() => {
    apply(read());
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (read().theme === "system") apply(read());
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return null;
}
