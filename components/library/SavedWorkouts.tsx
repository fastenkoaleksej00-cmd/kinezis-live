"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Play } from "lucide-react";
import { Cover } from "@/components/ui/Cover";
import type { WorkoutCardData } from "@/lib/content/types";
import { useFavorites } from "@/lib/store/favorites";
import { workoutKey } from "@/lib/store/keys";
import { SaveButton } from "./SaveButton";

interface SavedWorkoutsProps {
  workouts: WorkoutCardData[];
}

/** Client list: the server passes all cards, the browser keeps only the bookmarked ones. Renders nothing when empty. */
export function SavedWorkouts({ workouts }: SavedWorkoutsProps) {
  const t = useTranslations("saved");
  const tl = useTranslations("library");
  const tc = useTranslations("common");
  const { ids } = useFavorites();
  const saved = ids.map((key) => workouts.find((w) => workoutKey(w.id) === key)).filter((w): w is WorkoutCardData => Boolean(w));

  if (saved.length === 0) return null;

  return (
    <section className="space-y-3">
      <p className="eyebrow">{t("sectionWorkouts")}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {saved.map((w) => {
          const light = w.coverTone === "light";
          return (
            <Link key={w.id} href={`/library/${w.slug}`} className="group block">
              <Cover tone={w.coverTone} ratio="aspect-[4/5]" label={tl(`categories.${w.category}`)}>
                <div className="absolute top-3 right-3 z-20">
                  <SaveButton itemKey={workoutKey(w.id)} look="glass" />
                </div>
                <div className="flex h-full flex-col justify-end p-4">
                  <span className={light ? "text-ink mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85" : "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-md"}>
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
                  </span>
                  <h3 className={light ? "text-ink text-[15px] leading-snug font-bold" : "text-frost text-[15px] leading-snug font-bold"}>{w.title}</h3>
                  <p className={light ? "text-steel mt-1 text-xs font-medium" : "text-mist mt-1 text-xs font-medium"}>
                    {tc("minutes", { count: w.durationMin })} · {tl(`levels.${w.level}`)}
                  </p>
                </div>
              </Cover>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
