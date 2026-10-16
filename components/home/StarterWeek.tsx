"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Sprout, X } from "lucide-react";
import { createLocalStore } from "@/lib/store/localStore";
import { cn } from "@/lib/utils";

/** A gentle first week built only from what already exists in the app. Progress is per device. */
const days = [
  { key: "breath", href: "/breathe/diaphragm-basics" },
  { key: "yoga", href: "/programs" },
  { key: "body", href: "/body" },
  { key: "break", href: "/mind/break" },
  { key: "pilates", href: "/library?category=pilates" },
  { key: "community", href: "/community" },
  { key: "evening", href: "/mind/evening" },
] as const;

const store = createLocalStore<{ done: number[]; hidden: boolean }>("kl_starter", { done: [], hidden: false });

export function StarterWeek() {
  const t = useTranslations("starter");
  const s = store.useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted || s.hidden || s.done.length >= days.length) return null;
  const current = days.findIndex((_, i) => !s.done.includes(i));
  const day = days[current];

  return (
    <section className="card relative overflow-hidden p-4 sm:p-5">
      <button type="button" onClick={() => store.write({ ...s, hidden: true })} aria-label={t("hide")} className="text-steel hover:text-ink absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full">
        <X className="h-4 w-4" aria-hidden />
      </button>
      <p className="eyebrow mb-1 inline-flex items-center gap-2">
        <Sprout className="h-3.5 w-3.5" aria-hidden />
        {t("eyebrow")}
      </p>
      <h2 className="text-ink pr-8 text-lg font-bold">{t("dayTitle", { n: current + 1, title: t(`days.${day.key}.title`) })}</h2>
      <p className="text-steel mt-1 text-sm">{t(`days.${day.key}.body`)}</p>
      <ol className="mt-3 flex gap-1.5" aria-label={t("progress", { done: s.done.length, total: days.length })}>
        {days.map((d, i) => (
          <li key={d.key} className={cn("h-1.5 flex-1 rounded-full", s.done.includes(i) ? "bg-mint-deep" : i === current ? "bg-accent" : "bg-bone-2")} />
        ))}
      </ol>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link href={day.href} className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white">
          {t("open")}
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
        <button type="button" onClick={() => store.write({ ...s, done: [...s.done, current] })} className="border-ink/10 text-ink inline-flex h-10 items-center gap-1.5 rounded-full border bg-white/70 px-4 text-sm font-semibold">
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          {t("done")}
        </button>
      </div>
    </section>
  );
}
