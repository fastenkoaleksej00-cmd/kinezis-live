"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { categoryIds, durationBuckets, equipmentIds, goals, levels, type WorkoutFilters } from "@/lib/content/types";
import { regionIds } from "@/lib/body/regions";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  filters: WorkoutFilters;
  /** Trainers with at least one published session */
  authors?: Array<{ id: string; name: string }>;
}

type Draft = Pick<WorkoutFilters, "duration" | "goal" | "level" | "author" | "equipment" | "region" | "language">;

/** Category chips in a scroll row, plus a bottom sheet for duration, goal and level. Filters live in the URL. */
export function FilterBar({ filters, authors = [] }: FilterBarProps) {
  const t = useTranslations("library");
  const tb = useTranslations("body");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>({ duration: filters.duration, goal: filters.goal, level: filters.level, author: filters.author, equipment: filters.equipment, region: filters.region, language: filters.language });

  const activeCount = [filters.duration, filters.goal, filters.level, filters.author, filters.equipment, filters.region, filters.language].filter(Boolean).length;

  function push(next: WorkoutFilters) {
    const q = new URLSearchParams(params.toString());
    for (const key of ["category", "duration", "goal", "level", "author", "equipment", "region", "source"] as const) {
      const v = next[key];
      if (v) q.set(key, v);
      else q.delete(key);
    }
    if (next.language) q.set("lang", next.language);
    else q.delete("lang");
    const qs = q.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function openSheet() {
    setDraft({ duration: filters.duration, goal: filters.goal, level: filters.level, author: filters.author, equipment: filters.equipment, region: filters.region, language: filters.language });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const groups = [
    { key: "duration" as const, title: t("filters.duration"), options: durationBuckets, label: (v: string) => t(`durations.${v as (typeof durationBuckets)[number]}`) },
    { key: "goal" as const, title: t("filters.goal"), options: goals, label: (v: string) => t(`goals.${v as (typeof goals)[number]}`) },
    { key: "level" as const, title: t("filters.level"), options: levels, label: (v: string) => t(`levels.${v as (typeof levels)[number]}`) },
    ...(authors.length > 1 ? [{ key: "author" as const, title: t("filters.author"), options: authors.map((a) => a.id), label: (v: string) => authors.find((a) => a.id === v)?.name ?? v }] : []),
    { key: "equipment" as const, title: t("filters.equipment"), options: equipmentIds, label: (v: string) => t(`equipment.${v as (typeof equipmentIds)[number]}`) },
    { key: "region" as const, title: t("filters.region"), options: regionIds, label: (v: string) => tb(`regions.${v as (typeof regionIds)[number]}`) },
    { key: "language" as const, title: t("filters.language"), options: ["ru", "uk", "en", "de"] as const, label: (v: string) => t(`videoLanguages.${v as "ru"}`) },
  ];

  return (
    <div className="space-y-3">
      <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <Chip active={!filters.category} onClick={() => push({ ...filters, category: undefined })}>
          {t("all")}
        </Chip>
        {categoryIds.map((c) => (
          <Chip key={c} active={filters.category === c} onClick={() => push({ ...filters, category: c })}>
            {t(`categories.${c}`)}
          </Chip>
        ))}
        <button
          type="button"
          onClick={openSheet}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={cn(
            "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-[background-color,border-color] duration-300",
            activeCount > 0 ? "border-accent/50 bg-accent-soft text-accent" : "border-ink/10 text-ink bg-white/70 hover:bg-white",
          )}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.9} aria-hidden />
          {t("filters.title")}
          {activeCount > 0 ? <span className="bg-accent inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] text-white">{activeCount}</span> : null}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="overlay"
            className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm md:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={t("filters.title")}
              className="pb-safe w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-[var(--shadow-card)] md:rounded-3xl"
              initial={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { y: 40, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-ink text-lg font-bold">{t("filters.title")}</h2>
                <button type="button" onClick={() => setOpen(false)} aria-label={t("filters.close")} className="text-ink hover:bg-frost inline-flex h-9 w-9 items-center justify-center rounded-full">
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </div>
              <div className="space-y-5">
                {groups.map((g) => (
                  <fieldset key={g.key}>
                    <legend className="eyebrow mb-2.5">{g.title}</legend>
                    <div className="flex flex-wrap gap-2">
                      <Chip active={!draft[g.key]} onClick={() => setDraft({ ...draft, [g.key]: undefined })}>
                        {t("filters.any")}
                      </Chip>
                      {g.options.map((o) => (
                        <Chip key={o} active={draft[g.key] === o} onClick={() => setDraft({ ...draft, [g.key]: o })}>
                          {g.label(o)}
                        </Chip>
                      ))}
                    </div>
                  </fieldset>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => {
                    setDraft({});
                    push({ category: filters.category });
                    setOpen(false);
                  }}
                >
                  {t("filters.reset")}
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => {
                    push({ ...filters, ...draft });
                    setOpen(false);
                  }}
                >
                  {t("filters.apply")}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
