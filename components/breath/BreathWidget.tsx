"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { ArrowRight, Wind } from "lucide-react";
import { practiceById } from "@/lib/breath/practices";
import { cn } from "@/lib/utils";
import { BreathSession } from "./BreathSession";

/** Home widget: one-tap calm breathing with 1 / 3 / 5 minutes; links to the full library. */
export function BreathWidget({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("breath");
  const [minutes, setMinutes] = useState(3);
  const practice = practiceById.calm;

  return (
    <section className="card relative overflow-hidden p-4 sm:p-5">
      <div className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--color-mint-soft)_0%,transparent_70%)]" aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1 inline-flex items-center gap-2">
            <Wind className="h-3.5 w-3.5" aria-hidden />
            {t("widgetEyebrow")}
          </p>
          <h2 className="text-ink text-lg font-bold">{t("widgetTitle")}</h2>
          <p className="text-steel mt-1 text-sm">{t("widgetBody")}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          {[1, 3, 5].map((m) => (
            <button key={m} type="button" aria-pressed={minutes === m} onClick={() => setMinutes(m)} className={cn("inline-flex h-8 min-w-9 items-center justify-center rounded-full px-2 text-xs font-semibold transition-colors", minutes === m ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
              {m}′
            </button>
          ))}
        </div>
      </div>
      <div className="relative mt-4">
        <BreathSession key={minutes} practice={practice} minutes={minutes} compact signedIn={signedIn} />
      </div>
      <Link href="/breathe" className="text-accent relative mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        {t("widgetLink")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}
