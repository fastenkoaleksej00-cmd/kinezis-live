"use client";

import { useEffect, useState } from "react";

/** Counts from 0 to `value` on mount and on change (about 0.9 s, ease-out). Static when reduced motion is on. */
export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reduceMotion === "true";
    if (reduce) {
      setShown(value);
      return;
    }
    const from = shown;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const e = 1 - Math.pow(1 - t, 3);
      setShown(from + (value - from) * e);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return <>{shown.toFixed(decimals)}</>;
}
