import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { SaveButton } from "@/components/library/SaveButton";
import { LockBadge } from "@/components/premium/LockBadge";
import { Cover } from "@/components/ui/Cover";
import { countLessons } from "@/lib/content/courses";
import { pick } from "@/lib/content/localize";
import type { Course } from "@/lib/content/types";
import { courseKey } from "@/lib/store/keys";

interface CourseCardProps {
  course: Course;
}

export async function CourseCard({ course }: CourseCardProps) {
  const locale = await getLocale();
  const t = await getTranslations("faceFitness");
  const tl = await getTranslations("library");
  const tp = await getTranslations("premium");
  const light = course.coverTone === "light";
  const lessons = countLessons(course);

  return (
    <Link href={`/face-fitness/${course.slug}`} className="group block">
      <Cover tone={course.coverTone} ratio="aspect-[16/10]" label={course.sample ? t("sample") : undefined}>
        <div className="absolute top-3 right-3 z-20">
          <SaveButton itemKey={courseKey(course.id)} look="glass" />
        </div>
        {course.access === "premium" ? <LockBadge label={tp("badge")} /> : null}
        <div className="flex h-full flex-col justify-end p-5">
          <span className={light ? "text-ink mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85" : "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-md"}>
            <BookOpen className="h-4 w-4" strokeWidth={1.9} aria-hidden />
          </span>
          <h3 className={light ? "text-ink text-lg leading-snug font-bold" : "text-frost text-lg leading-snug font-bold"}>{pick(course.title, locale)}</h3>
          <p className={light ? "text-steel mt-1 text-xs font-medium" : "text-mist mt-1 text-xs font-medium"}>
            {t("modules", { count: course.modules.length })} · {t("lessons", { count: lessons })} · {tl(`levels.${course.level}`)}
          </p>
        </div>
      </Cover>
    </Link>
  );
}
