"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { Film, Maximize2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { VideoSource } from "@/lib/content/types";
import { formatTime } from "@/lib/format";
import { useProgress } from "@/lib/store/progress";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  workoutId: string;
  source: VideoSource;
  title: string;
}

const SAVE_EVERY_SECONDS = 5;

/**
 * HTML5 player with brand controls. Resumes from the saved position and stores
 * progress every few seconds. With no source it shows an honest "not connected" state.
 */
export function VideoPlayer({ workoutId, source, title }: VideoPlayerProps) {
  const t = useTranslations("player");
  const { get, update } = useProgress();
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastSaved = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [resumedFrom, setResumedFrom] = useState<number | null>(null);

  const save = useCallback(
    (force = false) => {
      const v = videoRef.current;
      if (!v || !v.duration) return;
      if (!force && Math.abs(v.currentTime - lastSaved.current) < SAVE_EVERY_SECONDS) return;
      lastSaved.current = v.currentTime;
      update(workoutId, v.currentTime, v.duration);
    },
    [update, workoutId],
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      setDuration(v.duration);
      const saved = get(workoutId);
      if (saved && !saved.completed && saved.position > 5 && saved.position < v.duration - 5) {
        v.currentTime = saved.position;
        setResumedFrom(saved.position);
        window.setTimeout(() => setResumedFrom(null), 3500);
      }
    };
    const onTime = () => {
      setTime(v.currentTime);
      save();
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => {
      setPlaying(false);
      save(true);
    };
    const onEnded = () => {
      setPlaying(false);
      update(workoutId, v.duration, v.duration);
    };
    v.addEventListener("loadedmetadata", onMeta);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("ended", onEnded);
    return () => {
      v.removeEventListener("loadedmetadata", onMeta);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("ended", onEnded);
    };
    // `get` changes whenever progress is saved; the listeners only need the initial snapshot
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workoutId, save, update]);

  if (!source) {
    return (
      <div className="glass-dark flex aspect-video flex-col items-center justify-center rounded-3xl p-6 text-center text-white">
        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/10">
          <Film className="h-5 w-5" strokeWidth={1.75} aria-hidden />
        </span>
        <p className="text-frost font-semibold">{t("noVideoTitle")}</p>
        <p className="text-mist mt-1.5 max-w-sm text-sm">{t("noVideoBody")}</p>
      </div>
    );
  }

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) void v.play();
    else v.pause();
  };
  const seek = (value: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = value;
    setTime(value);
  };
  const fullscreen = () => {
    const el = wrapRef.current;
    if (!el) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void el.requestFullscreen?.();
  };
  const progress = duration > 0 ? (time / duration) * 100 : 0;

  return (
    <div ref={wrapRef} className="group relative overflow-hidden rounded-3xl bg-black shadow-[var(--shadow-dark)]">
      <video
        ref={videoRef}
        src={source.src}
        poster={source.poster}
        playsInline
        preload="metadata"
        muted={muted}
        onClick={toggle}
        className="aspect-video w-full"
        aria-label={title}
      />

      {resumedFrom !== null ? (
        <p className="glass-dark absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white">{t("resumedFrom", { time: formatTime(resumedFrom) })}</p>
      ) : null}

      {!playing ? (
        <button type="button" onClick={toggle} aria-label={t("play")} className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md transition-transform duration-300 hover:scale-105">
            <Play className="ml-1 h-6 w-6" fill="currentColor" aria-hidden />
          </span>
        </button>
      ) : null}

      <div className={cn("absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-3 pt-10 transition-opacity duration-300 sm:p-4", playing && "opacity-0 group-hover:opacity-100 focus-within:opacity-100")}>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={time}
          onChange={(e) => seek(Number(e.target.value))}
          aria-label={t("seek")}
          className="accent-glow h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/25"
          style={{ background: `linear-gradient(90deg, #8edcf0 ${progress}%, rgba(255,255,255,0.25) ${progress}%)` }}
        />
        <div className="mt-2 flex items-center gap-2 text-white">
          <button type="button" onClick={toggle} aria-label={playing ? t("pause") : t("play")} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15">
            {playing ? <Pause className="h-[18px] w-[18px]" fill="currentColor" aria-hidden /> : <Play className="ml-0.5 h-[18px] w-[18px]" fill="currentColor" aria-hidden />}
          </button>
          <span className="text-xs font-semibold tabular-nums">
            {formatTime(time)} / {formatTime(duration)}
          </span>
          <span className="flex-1" />
          <button type="button" onClick={() => setMuted((m) => !m)} aria-label={muted ? t("unmute") : t("mute")} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15">
            {muted ? <VolumeX className="h-[18px] w-[18px]" aria-hidden /> : <Volume2 className="h-[18px] w-[18px]" aria-hidden />}
          </button>
          <button type="button" onClick={fullscreen} aria-label={t("fullscreen")} className="inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-white/15">
            <Maximize2 className="h-[18px] w-[18px]" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}
