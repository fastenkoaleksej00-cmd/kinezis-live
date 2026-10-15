"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { CloudRain, Pause, Play, Waves, Wind } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Kind = "rain" | "waves" | "deep";
const kinds: Array<{ id: Kind; icon: typeof Wind }> = [
  { id: "rain", icon: CloudRain },
  { id: "waves", icon: Waves },
  { id: "deep", icon: Wind },
];
const timers = [10, 25, 45, 0] as const;

/**
 * Sound generated in the browser with Web Audio (no files, works offline): filtered noise shaped into
 * rain, slow waves or a deep brown hum. Stops itself when the timer ends, with a gentle fade.
 */
export function FocusSounds() {
  const t = useTranslations("mind.sounds");
  const [kind, setKind] = useState<Kind>("rain");
  const [minutes, setMinutes] = useState<(typeof timers)[number]>(25);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [left, setLeft] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const nodes = useRef<AudioNode[]>([]);
  const endAt = useRef(0);
  const tick = useRef<number | null>(null);

  function teardown() {
    for (const n of nodes.current) {
      try {
        (n as AudioScheduledSourceNode).stop?.();
      } catch {
        // already stopped
      }
      n.disconnect();
    }
    nodes.current = [];
    if (tick.current) window.clearInterval(tick.current);
    tick.current = null;
  }

  function noiseBuffer(ctx: AudioContext, brown: boolean): AudioBuffer {
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const white = Math.random() * 2 - 1;
      if (brown) {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else data[i] = white * 0.5;
    }
    return buf;
  }

  function start(k: Kind) {
    teardown();
    const ctx = (ctxRef.current ??= new AudioContext());
    void ctx.resume();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    gain.connect(ctx.destination);
    master.current = gain;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx, k !== "rain");
    src.loop = true;
    const filter = ctx.createBiquadFilter();
    if (k === "rain") {
      filter.type = "bandpass";
      filter.frequency.value = 2500;
      filter.Q.value = 0.6;
    } else {
      filter.type = "lowpass";
      filter.frequency.value = k === "waves" ? 900 : 380;
    }
    src.connect(filter);
    const shaped = ctx.createGain();
    filter.connect(shaped).connect(gain);
    const extra: AudioNode[] = [];
    if (k === "waves") {
      // Slow swell, about one wave every 8 seconds
      shaped.gain.value = 0.55;
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 0.12;
      const depth = ctx.createGain();
      depth.gain.value = 0.45;
      lfo.connect(depth).connect(shaped.gain);
      lfo.start();
      extra.push(lfo, depth);
    }
    src.start();
    nodes.current = [src, filter, shaped, ...extra, gain];
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume * 0.6), now + 1.5);
    endAt.current = minutes > 0 ? Date.now() + minutes * 60000 : 0;
    setLeft(minutes * 60);
    tick.current = window.setInterval(() => {
      if (!endAt.current) return;
      const remain = Math.max(0, Math.round((endAt.current - Date.now()) / 1000));
      setLeft(remain);
      if (remain <= 0) stop();
    }, 1000);
    setPlaying(true);
  }

  function stop() {
    const ctx = ctxRef.current;
    const gain = master.current;
    if (ctx && gain) {
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(Math.max(0.0002, gain.gain.value), now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      window.setTimeout(teardown, 1300);
    } else teardown();
    if (tick.current) window.clearInterval(tick.current);
    tick.current = null;
    setPlaying(false);
  }

  useEffect(() => {
    const ctx = ctxRef.current;
    if (playing && ctx && master.current) master.current.gain.setTargetAtTime(Math.max(0.0002, volume * 0.6), ctx.currentTime, 0.2);
  }, [volume, playing]);

  useEffect(
    () => () => {
      teardown();
      void ctxRef.current?.close();
    },
    [],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2">
        {kinds.map(({ id, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={kind === id}
            onClick={() => {
              setKind(id);
              if (playing) start(id);
            }}
            className={cn("card flex flex-col items-center gap-2 px-2 py-4 text-center transition-[transform,box-shadow] duration-300 active:scale-95", kind === id && "ring-accent ring-2")}
          >
            <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl", kind === id ? "bg-mint-soft text-mint-deep" : "bg-accent-soft text-accent")}>
              <Icon className={cn("h-5 w-5", playing && kind === id && "breath-pulse")} strokeWidth={1.8} aria-hidden />
            </span>
            <span className="text-ink text-sm font-semibold">{t(`kinds.${id}`)}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {timers.map((m) => (
          <button key={m} type="button" aria-pressed={minutes === m} onClick={() => setMinutes(m)} disabled={playing} className={cn("inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors disabled:opacity-50", minutes === m ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
            {m === 0 ? t("noTimer") : t("timer", { count: m })}
          </button>
        ))}
      </div>
      <label className="mx-auto block max-w-xs">
        <span className="text-steel mb-1 block text-center text-xs font-semibold">{t("volume")}</span>
        <input type="range" min={0.05} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="accent-accent w-full" />
      </label>
      <div className="flex flex-col items-center gap-2">
        {playing ? (
          <Button size="lg" variant="secondary" onClick={stop}>
            <Pause className="h-4 w-4" fill="currentColor" aria-hidden />
            {t("stop")}
          </Button>
        ) : (
          <Button size="lg" onClick={() => start(kind)}>
            <Play className="h-4 w-4" fill="currentColor" aria-hidden />
            {t("play")}
          </Button>
        )}
        {playing && minutes > 0 ? (
          <p className="text-steel text-sm tabular-nums">
            {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
          </p>
        ) : null}
      </div>
      <p className="text-steel text-center text-xs">{t("note")}</p>
    </div>
  );
}
