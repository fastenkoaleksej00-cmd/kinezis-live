"use client";

import { useTranslations } from "next-intl";
import { useLessons } from "@/lib/store/lessons";

interface CourseProgressProps {
  lessonIds: string[];
}

/** "3 of 8 lessons done" with a bar, from local lesson state. */
export function CourseProgress({ lessonIds }: CourseProgressProps) {
  const t = useTranslations("faceFitness");
  const { doneCount } = useLessons();
  const done = doneCount(lessonIds);
  const total = lessonIds.length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="card px-5 py-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink font-semibold">{t("progress", { done, total })}</span>
        <span className="text-steel tabular-nums">{percent}%</span>
      </div>
      <div className="bg-bone-2 mt-2.5 h-1.5 overflow-hidden rounded-full">
        <div className="bg-mint-deep h-full rounded-full transition-[width] duration-500 ease-[var(--ease-out-expo)]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
