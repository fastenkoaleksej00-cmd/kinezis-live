"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check, ChevronRight, Play } from "lucide-react";
import { useLessons } from "@/lib/store/lessons";
import { cn } from "@/lib/utils";

interface LessonRowProps {
  href: string;
  lessonId: string;
  number: string;
  title: string;
  durationMin?: number;
  hasVideo: boolean;
}

export function LessonRow({ href, lessonId, number, title, durationMin, hasVideo }: LessonRowProps) {
  const tc = useTranslations("common");
  const t = useTranslations("faceFitness");
  const { isDone } = useLessons();
  const done = isDone(lessonId);

  return (
    <Link href={href} className="hover:bg-frost/60 flex items-center gap-3 px-4 py-3.5 transition-colors">
      <span
        className={cn(
          "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          done ? "bg-mint-deep text-white" : "bg-mint-soft text-mint-deep",
        )}
      >
        {done ? <Check className="h-4 w-4" strokeWidth={3} aria-hidden /> : number}
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block truncate text-sm font-semibold">{title}</span>
        <span className="text-steel block text-xs">
          {durationMin ? `${tc("minutes", { count: durationMin })} · ` : ""}
          {hasVideo ? t("hasVideo") : t("videoPending")}
        </span>
      </span>
      {hasVideo ? <Play className="text-steel h-4 w-4" fill="currentColor" aria-hidden /> : null}
      <ChevronRight className="text-steel h-4 w-4" aria-hidden />
    </Link>
  );
}
