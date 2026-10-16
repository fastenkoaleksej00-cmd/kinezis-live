import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Activity, Flower2, Infinity as InfinityIcon, Lock, MoveHorizontal, PersonStanding, Play, RotateCw, type LucideIcon } from "lucide-react";
import { Cover } from "@/components/ui/Cover";
import type { CategoryId, CoverTone, WorkoutCardData } from "@/lib/content/types";
import { workoutKey } from "@/lib/store/keys";
import { SaveButton } from "./SaveButton";

interface WorkoutCardProps {
  workout: WorkoutCardData;
}

/** One look per category so the grid reads calmly; real posters appear on the session page, not in lists. */
const categoryStyle: Record<CategoryId, { tone: CoverTone; icon: LucideIcon }> = {
  kinesiotherapy: { tone: "deep", icon: Activity },
  yoga: { tone: "mint", icon: Flower2 },
  pilates: { tone: "deep", icon: InfinityIcon },
  stretching: { tone: "mint", icon: MoveHorizontal },
  mobility: { tone: "mint", icon: RotateCw },
  back: { tone: "deep", icon: PersonStanding },
};

/**
 * Portrait card with a fixed layout on every card: category top-left, bookmark top-right,
 * title and details at the bottom over a soft dark scrim, play button bottom-right.
 */
export async function WorkoutCard({ workout }: WorkoutCardProps) {
  const t = await getTranslations("library");
  const tc = await getTranslations("common");
  const tp = await getTranslations("premium");
  const { tone, icon: Icon } = categoryStyle[workout.category];

  return (
    <Link href={`/library/${workout.slug}`} className="group block">
      <Cover tone={tone} ratio="aspect-[4/5]">
        <Icon className="pointer-events-none absolute top-1/2 left-1/2 h-20 w-20 -translate-x-1/2 -translate-y-[70%] text-white/20 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" strokeWidth={1.2} aria-hidden />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/5 bg-linear-to-t from-[#0b1a1f]/80 via-[#0b1a1f]/35 to-transparent" aria-hidden />

        <div className="absolute inset-x-3 top-3 z-20 flex items-start justify-between gap-2">
          <span className="truncate rounded-full border border-white/40 bg-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur-md">{t(`categories.${workout.category}`)}</span>
          <SaveButton itemKey={workoutKey(workout.id)} look="glass" />
        </div>

        <div className="relative flex h-full flex-col justify-end p-3.5">
          <h3 className="line-clamp-2 text-[15px] leading-snug font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">{workout.title}</h3>
          <div className="mt-1.5 flex items-end justify-between gap-2">
            <div className="min-w-0 text-[11px] leading-tight font-medium text-white/85">
              <p className="truncate">
                {tc("minutes", { count: workout.durationMin })} · {t(`levels.${workout.level}`)}
              </p>
              {workout.authorName || workout.youtube || workout.access === "premium" ? (
                <p className="mt-0.5 flex items-center gap-1.5 truncate">
                  {workout.access === "premium" ? (
                    <span className="inline-flex items-center gap-0.5 font-semibold">
                      <Lock className="h-3 w-3" strokeWidth={2.2} aria-hidden />
                      {tp("badge")}
                    </span>
                  ) : null}
                  {workout.youtube ? <span className="font-semibold">YouTube</span> : null}
                  {workout.authorName ? <span className="truncate opacity-90">{workout.authorName}</span> : null}
                </p>
              ) : null}
            </div>
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/15 text-white backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5">
              <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
            </span>
          </div>
        </div>
      </Cover>
    </Link>
  );
}
