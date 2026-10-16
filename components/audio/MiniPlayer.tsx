"use client";

import { useLocale, useTranslations } from "next-intl";
import { Music2, Pause, Play, SkipForward, Waves, X } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { useAudio } from "./AudioProvider";

/** Small floating bar while something plays: above the tab bar on phones, bottom-right on larger screens. */
export function MiniPlayer() {
  const t = useTranslations("audio");
  const locale = useLocale() as Locale;
  const { current, playing, toggle, next, stop } = useAudio();
  if (!current) return null;
  const Icon = current.kind === "music" ? Music2 : Waves;
  return (
    <div className="glass pop-in fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-3 rounded-2xl px-3 py-2 shadow-[var(--shadow-card)] md:inset-x-auto md:right-6 md:bottom-6 md:w-80" role="region" aria-label={t("player")}>
      <span className="bg-mint-soft text-mint-deep inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
        <Icon className={playing ? "breath-pulse h-4 w-4" : "h-4 w-4"} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block truncate text-sm font-semibold">{pick(current.title, locale)}</span>
        <span className="text-steel block truncate text-[11px]">{current.kind === "music" ? t("music") : t("nature")}</span>
      </span>
      <button type="button" onClick={toggle} aria-label={playing ? t("pause") : t("play")} className="bg-linear-to-b from-ink-2 to-ink inline-flex h-9 w-9 items-center justify-center rounded-full text-white">
        {playing ? <Pause className="h-4 w-4" fill="currentColor" aria-hidden /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />}
      </button>
      {current.kind === "music" ? (
        <button type="button" onClick={next} aria-label={t("next")} className="text-ink inline-flex h-9 w-9 items-center justify-center rounded-full">
          <SkipForward className="h-4 w-4" aria-hidden />
        </button>
      ) : null}
      <button type="button" onClick={stop} aria-label={t("close")} className="text-steel hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full">
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
