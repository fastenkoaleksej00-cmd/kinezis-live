"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2, VolumeX } from "lucide-react";
import { BodySilhouette } from "@/components/body/BodySilhouette";
import { ActivityRing } from "@/components/health/ActivityRing";
import { Button } from "@/components/ui/Button";
import type { RegionId } from "@/lib/body/regions";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import type { TimedStep } from "@/lib/mind/content";
import { cn } from "@/lib/utils";

interface StepTimerProps {
  steps: TimedStep[];
  locale: Locale;
  /** Body-region labels; when given, a silhouette highlights the current step's area */
  bodyLabels?: Record<RegionId, string>;
  onFinished?: (elapsedSec: number) => void;
  compact?: boolean;
}

type Status = "idle" | "running" | "paused" | "done";
const BACK: RegionId[] = ["upperBack", "spine", "lowerBack"];

/**
 * Guided sequence: one cue at a time with its own length, overall ring, pause/stop and an optional soft chime
 * at each change. Time comes from performance.now(), so pausing and resuming stay exact.
 */
export function StepTimer({ steps, locale, bodyLabels, onFinished, compact = false }: StepTimerProps) {
  const t = useTranslations("mind.timer");
  const total = steps.reduce((n, s) => n + s.seconds, 0);
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [sound, setSound] = useState(false);
  const started = useRef(0);
  const pausedAt = useRef(0);
  const raf = useRef<number | null>(null);
  const lastIndex = useRef(-1);
  const audio = useRef<AudioContext | null>(null);
  const finished = useRef(false);

  const indexAt = useCallback(
    (sec: number) => {
      let acc = 0;
      for (let i = 0; i < steps.length; i++) {
        acc += steps[i].seconds;
        if (sec < acc) return { index: i, left: acc - sec };
      }
      return { index: steps.length - 1, left: 0 };
    },
    [steps],
  );

  const chime = useCallback(() => {
    if (!sound) return;
    try {
      audio.current ??= new AudioContext();
      const ctx = audio.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = "sine";
      o.frequency.value = 660;
      g.gain.value = 0.0001;
      o.connect(g).connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.exponentialRampToValueAtTime(0.07, now + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      o.start(now);
      o.stop(now + 1.25);
    } catch {
      // no audio: silent
    }
  }, [sound]);

  const stopLoop = () => {
    if (raf.current) cancelAnimationFrame(raf.current);
    raf.current = null;
  };

  const loop = useCallback(() => {
    const sec = (performance.now() - started.current) / 1000;
    if (sec >= total) {
      setElapsed(total);
      setStatus("done");
      stopLoop();
      return;
    }
    setElapsed(sec);
    const { index } = indexAt(sec);
    if (index !== lastIndex.current) {
      if (lastIndex.current >= 0) chime();
      lastIndex.current = index;
    }
    raf.current = requestAnimationFrame(loop);
  }, [chime, indexAt, total]);

  const start = () => {
    started.current = performance.now();
    lastIndex.current = -1;
    finished.current = false;
    setElapsed(0);
    setStatus("running");
    raf.current = requestAnimationFrame(loop);
  };
  const pause = () => {
    pausedAt.current = performance.now();
    stopLoop();
    setStatus("paused");
  };
  const resume = () => {
    started.current += performance.now() - pausedAt.current;
    setStatus("running");
    raf.current = requestAnimationFrame(loop);
  };
  const stop = () => {
    stopLoop();
    if (elapsed >= 30) setStatus("done");
    else {
      setStatus("idle");
      setElapsed(0);
    }
  };

  useEffect(() => () => stopLoop(), []);
  useEffect(() => {
    if (status === "done" && !finished.current) {
      finished.current = true;
      onFinished?.(elapsed);
    }
  }, [status, elapsed, onFinished]);

  const { index, left } = indexAt(elapsed);
  const step = steps[index];
  const active = status === "running" || status === "paused";
  const remaining = Math.max(0, total - elapsed);
  const clock = `${Math.floor(remaining / 60)}:${String(Math.floor(remaining % 60)).padStart(2, "0")}`;
  const region = active ? (step.region ?? null) : null;

  return (
    <div className={cn("grid items-center gap-5", bodyLabels ? "sm:grid-cols-[minmax(0,1fr)_200px]" : "")}>
      <div className="flex flex-col items-center gap-4 text-center">
        <ActivityRing
          value={total > 0 ? elapsed / total : 0}
          size={compact ? 140 : 180}
          stroke={compact ? 10 : 12}
          label={t("progress")}
          center={
            <span className="leading-none">
              <span className="text-ink block text-2xl font-extrabold tabular-nums">{clock}</span>
              <span className="text-steel mt-1 block text-[11px] font-semibold">{active ? t("step", { n: index + 1, total: steps.length }) : status === "done" ? t("done") : t("ready")}</span>
            </span>
          }
        />
        <p key={active ? index : status} className="fade-in text-ink min-h-[3.5rem] max-w-md text-lg leading-snug font-semibold" aria-live="polite">
          {active ? pick(step.text, locale) : status === "done" ? t("doneBody") : pick(steps[0].text, locale)}
        </p>
        {active ? <p className="text-steel text-xs tabular-nums">{t("stepLeft", { s: Math.ceil(left) })}</p> : null}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {status === "idle" || status === "done" ? (
            <Button size="lg" onClick={start}>
              <Play className="h-4 w-4" fill="currentColor" aria-hidden />
              {status === "done" ? t("again") : t("start")}
            </Button>
          ) : null}
          {status === "running" ? (
            <Button size="lg" variant="secondary" onClick={pause}>
              <Pause className="h-4 w-4" fill="currentColor" aria-hidden />
              {t("pause")}
            </Button>
          ) : null}
          {status === "paused" ? (
            <Button size="lg" onClick={resume}>
              <Play className="h-4 w-4" fill="currentColor" aria-hidden />
              {t("resume")}
            </Button>
          ) : null}
          {active ? (
            <Button size="lg" variant="ghost" onClick={stop}>
              <Square className="h-4 w-4" aria-hidden />
              {t("stop")}
            </Button>
          ) : null}
          <button type="button" onClick={() => setSound((v) => !v)} aria-pressed={sound} aria-label={t("chime")} className="border-ink/10 text-ink inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70">
            {sound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>
      {bodyLabels ? (
        <div className="mx-auto h-[300px] w-[180px] sm:h-[340px] sm:w-[200px]" aria-hidden>
          <BodySilhouette selected={region} view={region && BACK.includes(region) ? "back" : "front"} onSelect={() => undefined} labels={bodyLabels} />
        </div>
      ) : null}
    </div>
  );
}
