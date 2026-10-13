"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { SaveButton } from "@/components/library/SaveButton";
import { useFavorites } from "@/lib/store/favorites";
import { courseKey } from "@/lib/store/keys";

export interface SavedCourseData {
  id: string;
  slug: string;
  title: string;
  meta: string;
}

interface SavedCoursesProps {
  courses: SavedCourseData[];
}

export function SavedCourses({ courses }: SavedCoursesProps) {
  const t = useTranslations("saved");
  const { ids } = useFavorites();
  const saved = ids.map((key) => courses.find((c) => courseKey(c.id) === key)).filter((c): c is SavedCourseData => Boolean(c));
  if (saved.length === 0) return null;

  return (
    <section className="space-y-3">
      <p className="eyebrow">{t("sectionCourses")}</p>
      <ul className="card divide-ink/8 divide-y overflow-hidden">
        {saved.map((c) => (
          <li key={c.id} className="flex items-center gap-3 px-4 py-3.5">
            <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <BookOpen className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            </span>
            <Link href={`/face-fitness/${c.slug}`} className="group min-w-0 flex-1">
              <span className="text-ink group-hover:text-accent block truncate font-semibold transition-colors">{c.title}</span>
              <span className="text-steel block text-xs">{c.meta}</span>
            </Link>
            <SaveButton itemKey={courseKey(c.id)} look="solid" />
            <Link href={`/face-fitness/${c.slug}`} aria-label={c.title} className="text-steel hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
