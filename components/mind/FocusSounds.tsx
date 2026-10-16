"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { CloudRain, Music2, Pause, Play, Waves, Wind } from "lucide-react";
import { useAudio } from "@/components/audio/AudioProvider";
import type { Locale } from "@/i18n/config";
import { musicTracks, natureTracks } from "@/lib/audio/catalog";
import { pick } from "@/lib/content/localize";
import { cn } from "@/lib/utils";

const icons = { rain: CloudRain, sea: Waves, wind: Wind } as const;
const timers = [10, 25, 45, 0] as const;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Nature sounds (loop) and calm music (playlist) through the app-wide player, with a sleep timer and volume. */
export function FocusSounds() {
  const t = useTranslations("mind.sounds");
  const locale = useLocale() as Locale;
  const { current, playing, volume, stopAt, play, toggle, setVolume, setTimer } = useAudio();
  const [minutes, setMinutes] = useState<(typeof timers)[number]>(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!stopAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [stopAt]);

  const start = (id: string, queue?: string[]) => {
    if (current?.id === id) return toggle();
    play(id, queue);
    setTimer(minutes);
  };
  const musicIds = musicTracks.map((m) => m.id);
  const credits = [...natureTracks, ...musicTracks].filter((x) => x.credit);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="eyebrow">{t("natureTitle")}</h2>
        <div className="grid grid-cols-3 gap-2">
          {natureTracks.map((n) => {
            const Icon = icons[n.id as keyof typeof icons] ?? Waves;
            const on = current?.id === n.id;
            return (
              <button key={n.id} type="button" aria-pressed={on && playing} onClick={() => start(n.id)} className={cn("card flex flex-col items-center gap-2 px-2 py-4 text-center transition-[transform,box-shadow] duration-300 active:scale-95", on && "ring-accent ring-2")}>
                <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-2xl", on ? "bg-mint-soft text-mint-deep" : "bg-accent-soft text-accent")}>
                  <Icon className={cn("h-5 w-5", on && playing && "breath-pulse")} strokeWidth={1.8} aria-hidden />
                </span>
                <span className="text-ink text-sm font-semibold">{pick(n.title, locale)}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="eyebrow">{t("musicTitle")}</h2>
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {musicTracks.map((m) => {
            const on = current?.id === m.id;
            return (
              <li key={m.id}>
                <button type="button" onClick={() => start(m.id, [m.id, ...musicIds.filter((id) => id !== m.id)])} className="hover:bg-frost/60 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors">
                  <span className={cn("inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full", on ? "bg-linear-to-b from-ink-2 to-ink text-white" : "bg-mint-soft text-mint-deep")}>
                    {on && playing ? <Pause className="h-4 w-4" fill="currentColor" aria-hidden /> : on ? <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden /> : <Music2 className="h-4 w-4" aria-hidden />}
                  </span>
                  <span className="text-ink min-w-0 flex-1 truncate text-sm font-semibold">{pick(m.title, locale)}</span>
                  <span className="text-steel text-xs tabular-nums">{fmt(m.duration)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="eyebrow">{t("timerTitle")}</h2>
        <div className="flex flex-wrap gap-2">
          {timers.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={minutes === m}
              onClick={() => {
                setMinutes(m);
                if (current) setTimer(m);
              }}
              className={cn("inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors", minutes === m ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}
            >
              {m === 0 ? t("noTimer") : t("timer", { count: m })}
            </button>
          ))}
        </div>
        {stopAt ? <p className="text-steel text-sm tabular-nums">{t("stopsIn", { time: fmt(Math.max(0, (stopAt - now) / 1000)) })}</p> : null}
        <label className="block max-w-xs">
          <span className="text-steel mb-1 block text-xs font-semibold">{t("volume")}</span>
          <input type="range" min={0.05} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} className="accent-accent w-full" />
        </label>
      </section>

      <p className="text-steel text-xs">{t("note")}</p>
      {credits.length > 0 ? <p className="text-steel text-xs">{t("credits", { list: credits.map((c) => `${pick(c.title, locale)}: ${c.credit}`).join(" · ") })}</p> : null}
    </div>
  );
}
