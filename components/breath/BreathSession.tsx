"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Square, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cycleSeconds } from "@/lib/breath/practices";
import type { Practice } from "@/lib/breath/types";
import { pick } from "@/lib/content/localize";
import type { Locale } from "@/i18n/config";
import { logBreathSession } from "@/lib/profile/actions";
import { cn } from "@/lib/utils";

interface BreathSessionProps {
  practice: Practice;
  minutes: number;
  /** Compact layout for the Home widget */
  compact?: boolean;
  signedIn: boolean;
  autoStart?: boolean;
  onFinished?: () => void;
}

type Status = "idle" | "running" | "paused" | "done";

/**
 * Breathing timer with a circle that follows the real phase durations.
 * The circle scale animates with a CSS transition whose duration equals the phase, so the pace is honest.
 * Optional sound: a soft tone at each phase change (Web Audio, off by default). No sensors, no measurements.
 */
export function BreathSession({ practice, minutes, compact = false, signedIn, autoStart = false, onFinished }: BreathSessionProps) {
  const t = useTranslations("breath");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const total = minutes * 60;
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [phaseLeft, setPhaseLeft] = useState(practice.pattern[0].seconds);
  const [sound, setSound] = useState(false);
  const [reduce, setReduce] = useState(false);
  const audio = useRef<AudioContext | null>(null);
  const tick = useRef<number | null>(null);
  const started = useRef<number>(0);
  const pausedAt = useRef<number>(0);
  const logged = useRef(false);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.dataset.reduceMotion === "true");
  }, []);

  const beep = useCallback(
    (kind: "inhale" | "exhale" | "hold" | "rest") => {
      if (!sound) return;
      try {
        audio.current ??= new AudioContext();
        const ctx = audio.current;
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = kind === "inhale" ? 528 : kind === "exhale" ? 396 : 440;
        g.gain.value = 0.0001;
        o.connect(g).connect(ctx.destination);
        const now = ctx.currentTime;
        g.gain.exponentialRampToValueAtTime(0.08, now + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
        o.start(now);
        o.stop(now + 0.55);
      } catch {
        // audio unavailable: silent
      }
    },
    [sound],
  );

  // Phase schedule derived from elapsed time, so pauses and resumes stay exact
  const cycle = cycleSeconds(practice);
  const phaseAt = useCallback(
    (sec: number) => {
      let into = sec % cycle;
      for (let i = 0; i < practice.pattern.length; i++) {
        const ph = practice.pattern[i];
        if (into < ph.seconds) return { index: i, left: ph.seconds - into };
        into -= ph.seconds;
      }
      return { index: 0, left: practice.pattern[0].seconds };
    },
    [cycle, practice.pattern],
  );

  const stopTimer = () => {
    if (tick.current) cancelAnimationFrame(tick.current);
    tick.current = null;
  };

  const run = useCallback(() => {
    const loop = () => {
      const sec = (performance.now() - started.current) / 1000;
      if (sec >= total) {
        setElapsed(total);
        setStatus("done");
        stopTimer();
        return;
      }
      setElapsed(sec);
      const { index, left } = phaseAt(sec);
      setPhaseIndex((prev) => {
        if (prev !== index) beep(practice.pattern[index].kind);
        return index;
      });
      setPhaseLeft(left);
      tick.current = requestAnimationFrame(loop);
    };
    tick.current = requestAnimationFrame(loop);
  }, [beep, phaseAt, practice.pattern, total]);

  const start = () => {
    started.current = performance.now();
    logged.current = false;
    setElapsed(0);
    setPhaseIndex(0);
    setStatus("running");
    beep(practice.pattern[0].kind);
    run();
  };
  const pause = () => {
    pausedAt.current = performance.now();
    stopTimer();
    setStatus("paused");
  };
  const resume = () => {
    started.current += performance.now() - pausedAt.current;
    setStatus("running");
    run();
  };
  const stop = () => {
    stopTimer();
    setStatus(elapsed >= 30 ? "done" : "idle");
    if (elapsed < 30) setElapsed(0);
  };

  useEffect(() => () => stopTimer(), []);
  useEffect(() => {
    if (autoStart && status === "idle") start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  // Log a finished session once (signed-in only); 'done' also triggers the summary
  useEffect(() => {
    if (status !== "done" || logged.current) return;
    logged.current = true;
    onFinished?.();
    if (!signedIn) return;
    void logBreathSession(practice.id, pick(practice.title, locale), elapsed / 60)
      .then((ok) => {
        if (ok) router.refresh();
      })
      .catch(() => undefined);
  }, [status, signedIn, practice, locale, elapsed, router, onFinished]);

  const phase = practice.pattern[phaseIndex];
  const active = status === "running";
  const expanded = active && phase.kind === "inhale";
  const held = active && (phase.kind === "hold" || phase.kind === "rest");
  const scale = reduce ? 1 : expanded ? 1 : held ? (practice.pattern[phaseIndex - 1]?.kind === "inhale" ? 1 : 0.62) : 0.62;
  const remaining = Math.max(0, total - elapsed);
  const mm = Math.floor(remaining / 60);
  const ss = String(Math.floor(remaining % 60)).padStart(2, "0");
  const progress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;
  const size = compact ? 168 : 260;

  return (
    <div className={cn("flex flex-col items-center", compact ? "gap-3" : "gap-5")}>
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <span className="absolute inset-0 rounded-full" style={{ background: "radial-gradient(circle, var(--color-mint-soft) 0%, transparent 70%)" }} aria-hidden />
        <span
          className="absolute rounded-full"
          aria-hidden
          style={{
            width: size * 0.78,
            height: size * 0.78,
            background: "linear-gradient(160deg, var(--color-mint) 0%, var(--color-mint-deep) 100%)",
            boxShadow: "0 24px 60px -24px rgba(47,143,126,0.6), 0 1px 0 rgba(255,255,255,0.5) inset",
            transform: `scale(${scale})`,
            transition: active && !reduce ? `transform ${phase.seconds}s cubic-bezier(0.45, 0, 0.25, 1)` : "transform 0.6s var(--ease-out-expo)",
            opacity: status === "idle" ? 0.85 : 1,
          }}
        />
        <div className="relative text-center text-white">
          <p className={cn("font-extrabold tracking-wide drop-shadow-sm", compact ? "text-lg" : "text-2xl")}>
            {status === "idle" ? t("ready") : status === "done" ? t("done") : t(`phases.${phase.kind}`)}
          </p>
          {active || status === "paused" ? <p className={cn("tabular-nums opacity-90", compact ? "text-sm" : "text-base")}>{Math.ceil(phaseLeft)}</p> : null}
        </div>
      </div>

      {practice.cue && active ? <p className="text-steel text-center text-sm">{pick(practice.cue, locale)}</p> : null}

      <div className="flex items-center gap-3">
        <span className="text-ink text-lg font-bold tabular-nums">
          {mm}:{ss}
        </span>
        <span className="bg-bone-2 h-1.5 w-28 overflow-hidden rounded-full">
          <span className="bg-mint-deep block h-full rounded-full transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </span>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {status === "idle" || status === "done" ? (
          <Button size={compact ? "md" : "lg"} onClick={start}>
            <Play className="h-4 w-4" fill="currentColor" aria-hidden />
            {status === "done" ? t("again") : t("start")}
          </Button>
        ) : null}
        {status === "running" ? (
          <Button size={compact ? "md" : "lg"} variant="secondary" onClick={pause}>
            <Pause className="h-4 w-4" fill="currentColor" aria-hidden />
            {t("pause")}
          </Button>
        ) : null}
        {status === "paused" ? (
          <Button size={compact ? "md" : "lg"} onClick={resume}>
            <Play className="h-4 w-4" fill="currentColor" aria-hidden />
            {t("resume")}
          </Button>
        ) : null}
        {status === "running" || status === "paused" ? (
          <Button size={compact ? "md" : "lg"} variant="ghost" onClick={stop}>
            <Square className="h-4 w-4" aria-hidden />
            {t("stop")}
          </Button>
        ) : null}
        <button type="button" onClick={() => setSound((s) => !s)} aria-pressed={sound} aria-label={t("sound")} className="border-ink/10 text-ink inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70">
          {sound ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
        </button>
      </div>

      {status === "done" ? (
        <div className="pop-in bg-mint-soft text-mint-deep w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold">
          {t("summary", { minutes: Math.max(1, Math.round(elapsed / 60)) })}
          {signedIn ? "" : ` ${t("summaryGuest")}`}
        </div>
      ) : null}
      <p className="text-steel text-center text-xs">{t("safety")}</p>
    </div>
  );
}
