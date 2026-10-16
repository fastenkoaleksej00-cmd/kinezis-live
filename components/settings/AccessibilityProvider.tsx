"use client";

import { useEffect, useSyncExternalStore } from "react";

export type TextSize = "normal" | "large" | "xl";
export type Theme = "system" | "light" | "mint" | "dark" | "glass" | "cyber" | "neomint" | "pearl" | "aurora";
/** Skins sit on a base theme: Web3 Glass on light, Cyber Dark on dark. They change colours, surfaces and glow only. */
const skinBase: Partial<Record<Theme, "light" | "dark">> = { glass: "light", cyber: "dark", neomint: "dark", pearl: "light", aurora: "dark" };

interface A11y {
  textSize: TextSize;
  reduceMotion: boolean;
  theme: Theme;
}

const KEY = "kl_a11y";
const fallback: A11y = { textSize: "normal", reduceMotion: false, theme: "mint" };
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

function resolveTheme(theme: Theme): "light" | "mint" | "dark" {
  if (theme === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  const base = skinBase[theme];
  if (base) return base;
  return theme === "light" || theme === "dark" ? theme : "mint";
}

function skinOf(theme: Theme): "glass" | "cyber" | "neomint" | "pearl" | "aurora" | undefined {
  return theme === "glass" || theme === "cyber" || theme === "neomint" || theme === "pearl" || theme === "aurora" ? theme : undefined;
}

function apply(a: A11y) {
  const el = document.documentElement;
  // Cross-fade colours when the theme changes (no flash of a whole new picture)
  if (el.dataset.theme && (el.dataset.theme !== resolveTheme(a.theme) || el.dataset.skin !== skinOf(a.theme)) && !a.reduceMotion) {
    el.classList.add("theme-transition");
    window.setTimeout(() => el.classList.remove("theme-transition"), 450);
  }
  el.dataset.textSize = a.textSize;
  if (a.reduceMotion) el.dataset.reduceMotion = "true";
  else delete el.dataset.reduceMotion;
  const resolved = resolveTheme(a.theme);
  const skin = skinOf(a.theme);
  el.dataset.theme = resolved;
  if (skin) el.dataset.skin = skin;
  else delete el.dataset.skin;
  const color = skin === "aurora" ? "#070b1f" : skin === "pearl" ? "#f1fbf8" : skin === "neomint" ? "#03110e" : skin === "cyber" ? "#070a12" : skin === "glass" ? "#e8edfb" : resolved === "dark" ? "#0d171c" : resolved === "mint" ? "#eef7f4" : "#f5f8f8";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", color);
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
