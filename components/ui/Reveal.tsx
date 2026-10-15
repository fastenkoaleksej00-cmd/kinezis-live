"use client";

import { createElement, useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

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

/** Soft appear-on-scroll via CSS transitions. Respects prefers-reduced-motion. */
export function Reveal({ children, className, delay = 0, y = 24, as = "div", id }: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -6% 0px" });
  const reduce = useReducedMotion();
  const shown = inView || reduce === true;

  const style: React.CSSProperties = {
    opacity: shown ? 1 : 0,
    transform: shown ? "none" : `translateY(${y}px)`,
    transition: reduce
      ? "none"
      : `opacity 0.8s var(--ease-out-expo) ${delay}s, transform 0.8s var(--ease-out-expo) ${delay}s`,
    willChange: shown ? "auto" : "opacity, transform",
  };

  return createElement(as, { ref, className, style, id, "data-reveal": "" }, children);
}
