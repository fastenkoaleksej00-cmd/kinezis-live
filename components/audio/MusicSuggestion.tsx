"use client";

import { useLocale, useTranslations } from "next-intl";
import { Music2, Pause, Waves } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { trackById } from "@/lib/audio/catalog";
import { useAudio } from "./AudioProvider";

/** "Play calm music without words" before or during a session; keeps playing while the member watches. */
export function MusicSuggestion({ trackIds, variant = "music" }: { trackIds: string[]; variant?: "music" | "nature" }) {
  const t = useTranslations("audio");
  const locale = useLocale() as Locale;
  const { current, playing, play, stop } = useAudio();
  if (trackIds.length === 0) return null;
  const active = current && trackIds.includes(current.id);
  const Icon = variant === "music" ? Music2 : Waves;
  return (
    <div className="card flex items-center gap-3 px-4 py-3">
      <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
        <Icon className={active && playing ? "breath-pulse h-5 w-5" : "h-5 w-5"} strokeWidth={1.8} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block text-sm font-semibold">{active ? pick(current.title, locale) : variant === "music" ? t("suggestMusic") : t("suggestNature")}</span>
        <span className="text-steel block text-xs">{variant === "music" ? t("suggestMusicHint") : t("suggestNatureHint")}</span>
      </span>
      {active ? (
        <button type="button" onClick={stop} className="border-ink/10 text-ink inline-flex h-9 items-center gap-1.5 rounded-full border bg-white/70 px-3 text-xs font-semibold">
          <Pause className="h-3.5 w-3.5" aria-hidden />
          {t("stop")}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            const start = trackIds[Math.floor(Math.random() * trackIds.length)];
            play(start, trackIds.length > 1 ? [start, ...trackIds.filter((id) => id !== start)] : undefined);
          }}
          className="bg-linear-to-b from-ink-2 to-ink inline-flex h-9 items-center rounded-full px-4 text-xs font-semibold text-white"
        >
          {t("play")}
        </button>
      )}
    </div>
  );
}

export function trackTitle(id: string, locale: Locale): string {
  const tr = trackById[id];
  return tr ? pick(tr.title, locale) : id;
}
