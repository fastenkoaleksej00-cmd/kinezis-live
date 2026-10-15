"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight, PersonStanding } from "lucide-react";
import { regionIds, regionKey, type RegionId } from "@/lib/body/regions";
import { useFavorites } from "@/lib/store/favorites";
import { SaveButton } from "@/components/library/SaveButton";

/** "My areas": saved body regions, linking back to the map with that region preselected. */
export function SavedRegions() {
  const t = useTranslations("body");
  const ts = useTranslations("saved");
  const { ids } = useFavorites();
  const saved = regionIds.filter((id) => ids.includes(regionKey(id)));
  if (saved.length === 0) return null;
  return (
    <section className="space-y-3">
      <p className="eyebrow">{ts("sectionAreas")}</p>
      <ul className="card divide-ink/8 divide-y overflow-hidden">
        {saved.map((id: RegionId) => (
          <li key={id} className="flex items-center gap-3 px-4 py-3.5">
            <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <PersonStanding className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            </span>
            <Link href={`/body?region=${id}`} className="group min-w-0 flex-1">
              <span className="text-ink group-hover:text-accent block truncate font-semibold transition-colors">{t(`regions.${id}`)}</span>
              <span className="text-steel block text-xs">{t(`info.${id}`)}</span>
            </Link>
            <SaveButton itemKey={regionKey(id)} look="solid" />
            <Link href={`/body?region=${id}`} aria-label={t(`regions.${id}`)} className="text-steel hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
