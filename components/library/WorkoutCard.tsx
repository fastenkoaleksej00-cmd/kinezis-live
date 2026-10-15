import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Play } from "lucide-react";
import { Cover } from "@/components/ui/Cover";
import type { WorkoutCardData } from "@/lib/content/types";
import { workoutKey } from "@/lib/store/keys";
import { LockBadge } from "@/components/premium/LockBadge";
import { SaveButton } from "./SaveButton";

interface WorkoutCardProps {
  workout: WorkoutCardData;
}

/** Portrait card: cover, category label, duration and level, bookmark. Opens the detail page. */
export async function WorkoutCard({ workout }: WorkoutCardProps) {
  const t = await getTranslations("library");
  const tc = await getTranslations("common");
  const tp = await getTranslations("premium");
  const light = workout.coverTone === "light" && !workout.poster;

  return (
    <Link href={`/library/${workout.slug}`} className="group block">
      <Cover tone={workout.coverTone} ratio="aspect-[4/5]" label={t(`categories.${workout.category}`)} imageSrc={workout.poster}>
        <div className="absolute top-3 right-3 z-20">
          <SaveButton itemKey={workoutKey(workout.id)} look="glass" />
        </div>
        {workout.access === "premium" ? <LockBadge label={tp("badge")} /> : null}
        <div className="flex h-full flex-col justify-end p-4">
          <span
            className={
              light
                ? "text-ink mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5"
                : "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5"
            }
          >
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
          </span>
          <h3 className={light ? "text-ink text-[15px] leading-snug font-bold" : "text-frost text-[15px] leading-snug font-bold"}>{workout.title}</h3>
          <p className={light ? "text-steel mt-1 text-xs font-medium" : "text-mist mt-1 text-xs font-medium"}>
            {tc("minutes", { count: workout.durationMin })} · {t(`levels.${workout.level}`)}
            {workout.authorName ? <span className="block truncate opacity-90">{workout.authorName}</span> : null}
          </p>
        </div>
      </Cover>
    </Link>
  );
}
