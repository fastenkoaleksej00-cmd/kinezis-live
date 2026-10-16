"use client";

import { createElement, useEffect, useRef, useState } from "react";

type RevealTag = "div" | "section" | "li" | "article";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Delay in seconds */
  delay?: number;
  /** Vertical offset in px */
  y?: number;
  as?: RevealTag;
  id?: string;
}

/**
 * One IntersectionObserver for the whole page instead of one per block (a long feed had ~200).
 * Each element registers a callback; it fires once and unregisters.
 */
const callbacks = new WeakMap<Element, () => void>();
let shared: IntersectionObserver | null = null;

function observe(el: Element, onShow: () => void): () => void {
  if (typeof IntersectionObserver === "undefined") {
    onShow();
    return () => undefined;
  }
  shared ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        callbacks.get(entry.target)?.();
        callbacks.delete(entry.target);
        shared?.unobserve(entry.target);
      }
    },
    { rootMargin: "-10% 0px -6% 0px" },
  );
  callbacks.set(el, onShow);
  shared.observe(el);
  return () => {
    callbacks.delete(el);
    shared?.unobserve(el);
  };
}

function prefersReduced(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reduceMotion === "true";
}

/** Soft appear-on-scroll via CSS transitions. Respects prefers-reduced-motion and the in-app setting. */
export function Reveal({ children, className, delay = 0, y = 24, as = "div", id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);
  const [reduce, setReduce] = useState(false);

  useEffect(() => {
    const r = prefersReduced();
    setReduce(r);
    const el = ref.current;
    if (r || !el) {
      setShown(true);
      return;
    }
    return observe(el, () => setShown(true));
  }, []);

  const style: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : `translateY(${y}px)`,
    transition: reduce ? "none" : `opacity 0.8s var(--ease-out-expo) ${delay}s, transform 0.8s var(--ease-out-expo) ${delay}s`,
    willChange: shown ? "auto" : "opacity, transform",
  };

  return createElement(as, { ref, className, style, id, "data-reveal": "" }, children);
}
