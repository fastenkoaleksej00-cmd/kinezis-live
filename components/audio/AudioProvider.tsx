"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { trackById, type Track } from "@/lib/audio/catalog";
import { pick } from "@/lib/content/localize";

interface AudioApi {
  current: Track | null;
  playing: boolean;
  volume: number;
  /** Epoch ms when the sleep timer stops playback, or 0 */
  stopAt: number;
  play: (id: string, queue?: string[]) => void;
  toggle: () => void;
  next: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  setTimer: (minutes: number) => void;
}

const Ctx = createContext<AudioApi | null>(null);

export function useAudio(): AudioApi {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAudio outside AudioProvider");
  return v;
}

/**
 * One audio element for the whole app, so music keeps playing across screens.
 * Volume and fades go through a Web Audio gain node (iOS ignores element.volume).
 * Nature sounds loop; music plays the queue in order and wraps. Lock-screen controls via Media Session.
 */
export function AudioProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Locale;
  const el = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const gain = useRef<GainNode | null>(null);
  const queue = useRef<string[]>([]);
  const timer = useRef<number | null>(null);
  const [current, setCurrent] = useState<Track | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVol] = useState(0.6);
  const [stopAt, setStopAt] = useState(0);

  const ensure = useCallback(() => {
    if (el.current) return el.current;
    const a = new Audio();
    a.preload = "none";
    a.crossOrigin = "anonymous";
    el.current = a;
    try {
      const c = new AudioContext();
      const g = c.createGain();
      g.gain.value = 0;
      c.createMediaElementSource(a).connect(g).connect(c.destination);
      ctx.current = c;
      gain.current = g;
    } catch {
      // No Web Audio: element plays at full volume
    }
    return a;
  }, []);

  const ramp = useCallback((to: number, seconds: number) => {
    const c = ctx.current;
    const g = gain.current;
    if (!c || !g) return;
    const now = c.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(to, now + seconds);
  }, []);

  const load = useCallback(
    (id: string) => {
      const t = trackById[id];
      if (!t) return;
      const a = ensure();
      a.src = t.file;
      a.loop = t.kind === "nature";
      setCurrent(t);
      void ctx.current?.resume();
      if (gain.current) gain.current.gain.value = 0;
      void a
        .play()
        .then(() => {
          setPlaying(true);
          ramp(volume, 1.5);
        })
        .catch(() => setPlaying(false));
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({ title: pick(t.title, locale), artist: t.credit ?? "KINEZIS LIVE", album: "KINEZIS LIVE" });
      }
    },
    [ensure, locale, ramp, volume],
  );

  const stop = useCallback(() => {
    const a = el.current;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setStopAt(0);
    if (!a) return;
    ramp(0, 1.2);
    window.setTimeout(() => {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }, ctx.current ? 1250 : 0);
    setPlaying(false);
    setCurrent(null);
  }, [ramp]);

  const play = useCallback(
    (id: string, q?: string[]) => {
      queue.current = q && q.length > 0 ? q : [id];
      load(id);
    },
    [load],
  );

  const next = useCallback(() => {
    if (!current) return;
    const q = queue.current;
    const i = q.indexOf(current.id);
    load(q[(i + 1) % q.length]);
  }, [current, load]);

  const toggle = useCallback(() => {
    const a = el.current;
    if (!a || !current) return;
    if (a.paused) {
      void ctx.current?.resume();
      void a.play().then(() => {
        setPlaying(true);
        ramp(volume, 0.6);
      });
    } else {
      ramp(0, 0.4);
      window.setTimeout(() => a.pause(), ctx.current ? 420 : 0);
      setPlaying(false);
    }
  }, [current, ramp, volume]);

  const setVolume = useCallback(
    (v: number) => {
      setVol(v);
      if (gain.current && playing) ramp(v, 0.15);
      else if (!gain.current && el.current) el.current.volume = v;
    },
    [playing, ramp],
  );

  const setTimer = useCallback(
    (minutes: number) => {
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = null;
      if (minutes <= 0) return setStopAt(0);
      const at = Date.now() + minutes * 60000;
      setStopAt(at);
      timer.current = window.setTimeout(stop, minutes * 60000);
    },
    [stop],
  );

  // Music queue advances when a track ends
  useEffect(() => {
    const a = el.current;
    if (!a) return;
    const onEnded = () => next();
    a.addEventListener("ended", onEnded);
    return () => a.removeEventListener("ended", onEnded);
  }, [next, current]);

  useEffect(() => {
    if (!("mediaSession" in navigator)) return;
    navigator.mediaSession.setActionHandler("play", () => toggle());
    navigator.mediaSession.setActionHandler("pause", () => toggle());
    navigator.mediaSession.setActionHandler("nexttrack", current?.kind === "music" ? () => next() : null);
    navigator.mediaSession.playbackState = playing ? "playing" : "paused";
  }, [toggle, next, current, playing]);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
      el.current?.pause();
      void ctx.current?.close();
    },
    [],
  );

  const api = useMemo(() => ({ current, playing, volume, stopAt, play, toggle, next, stop, setVolume, setTimer }), [current, playing, volume, stopAt, play, toggle, next, stop, setVolume, setTimer]);
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
