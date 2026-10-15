"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Wind } from "lucide-react";
import { SaveButton } from "@/components/library/SaveButton";
import { useFavorites } from "@/lib/store/favorites";
import { breathKey } from "@/lib/store/keys";

export interface SavedPracticeData {
  id: string;
  title: string;
  meta: string;
}

export function SavedPractices({ practices }: { practices: SavedPracticeData[] }) {
  const t = useTranslations("saved");
  const { ids } = useFavorites();
  const saved = ids.map((key) => practices.find((p) => breathKey(p.id) === key)).filter((p): p is SavedPracticeData => Boolean(p));
  if (saved.length === 0) return null;
  return (
    <section className="space-y-3">
      <p className="eyebrow">{t("sectionBreath")}</p>
      <ul className="card divide-ink/8 divide-y overflow-hidden">
        {saved.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-3.5">
            <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <Wind className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            </span>
            <Link href={`/breathe/${p.id}`} className="group min-w-0 flex-1">
              <span className="text-ink group-hover:text-accent block truncate font-semibold transition-colors">{p.title}</span>
              <span className="text-steel block text-xs">{p.meta}</span>
            </Link>
            <SaveButton itemKey={breathKey(p.id)} look="solid" />
            <Link href={`/breathe/${p.id}`} aria-label={p.title} className="text-steel hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
