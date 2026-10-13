"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLessons } from "@/lib/store/lessons";

interface LessonDoneButtonProps {
  lessonId: string;
}

/** Manual completion toggle. Later the player can mark lessons done automatically. */
export function LessonDoneButton({ lessonId }: LessonDoneButtonProps) {
  const t = useTranslations("faceFitness");
  const { isDone, setDone } = useLessons();
  const done = isDone(lessonId);

  return (
    <Button variant={done ? "secondary" : "primary"} size="lg" aria-pressed={done} onClick={() => setDone(lessonId, !done)} className="w-full sm:w-auto">
      <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
      {done ? t("markUndone") : t("markDone")}
    </Button>
  );
}
