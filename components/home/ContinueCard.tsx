"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import type { WorkoutCardData } from "@/lib/content/types";
import { formatTime } from "@/lib/format";
import { useLastInProgress } from "@/lib/store/progress";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface ContinueCardProps {
  workouts: WorkoutCardData[];
}

/** Shows the last unfinished session with a progress bar, or an honest empty line. */
export function ContinueCard({ workouts }: ContinueCardProps) {
  const t = useTranslations("home");
  const tc = useTranslations("common");
  const last = useLastInProgress();
  const workout = last ? workouts.find((w) => w.id === last.id) : undefined;

  if (!last || !workout) {
    return <p className="card text-steel px-5 py-4 text-sm">{t("continueEmpty")}</p>;
  }

  const percent = last.entry.duration > 0 ? Math.min(100, Math.round((last.entry.position / last.entry.duration) * 100)) : 0;

  return (
    <Link href={`/library/${workout.slug}/watch`} className="card group flex items-center gap-4 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
      <span className={`cover ${workout.coverTone === "mint" ? "cover-mint" : workout.coverTone === "light" ? "cover-light" : ""} relative h-16 w-16 shrink-0 rounded-2xl`}>
        <span className="absolute inset-0 z-10 flex items-center justify-center text-white">
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden />
        </span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block truncate font-semibold">{workout.title}</span>
        <span className="text-steel mt-0.5 block text-xs">
          {t("resumeAt", { time: formatTime(last.entry.position) })} · {tc("minutes", { count: workout.durationMin })}
        </span>
        <ProgressBar percent={percent} className="mt-2" />
      </span>
    </Link>
  );
}
