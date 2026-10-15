import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Wind } from "lucide-react";
import { EvidenceBadge } from "@/components/breath/EvidenceBadge";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { evidenceById } from "@/lib/breath/evidence";
import { cycleSeconds, listPractices } from "@/lib/breath/practices";
import { breathCategories, breathGoals } from "@/lib/breath/types";
import { pick } from "@/lib/content/localize";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Library of breathing practices, filterable by goal; evidence level on every card. */
export default async function BreathePage({ searchParams }: PageProps) {
  const t = await getTranslations("breath");
  const locale = (await getLocale()) as Locale;
  const sp = await searchParams;
  const goal = typeof sp.goal === "string" && (breathGoals as readonly string[]).includes(sp.goal) ? sp.goal : undefined;
  const items = listPractices({ goal });

  return (
    <Container as="section" className="max-w-[860px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal delay={0.04}>
        <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href="/breathe" scroll={false} className={cn("inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors", !goal ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white")}>
            {t("allGoals")}
          </Link>
          {breathGoals.map((g) => (
            <Link key={g} href={`/breathe?goal=${g}`} scroll={false} className={cn("inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors", goal === g ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white")}>
              {t(`goals.${g}`)}
            </Link>
          ))}
        </div>
      </Reveal>

      {breathCategories
        .filter((c) => items.some((p) => p.category === c))
        .map((c, ci) => (
          <Reveal key={c} delay={0.08 + ci * 0.04} as="section" className="space-y-3">
            <h2 className="eyebrow">{t(`categories.${c}`)}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {items
                .filter((p) => p.category === c)
                .map((p) => (
                  <Link key={p.id} href={`/breathe/${p.id}`} className="card group flex items-start gap-4 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
                    <span className="bg-mint-soft text-mint-deep inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
                      <Wind className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-ink block font-bold">{pick(p.title, locale)}</span>
                      <span className="text-steel mt-0.5 block text-sm">{pick(p.purpose, locale)}</span>
                      <span className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-steel text-xs">{t("pace", { seconds: Math.round(cycleSeconds(p)), breaths: Math.round(60 / cycleSeconds(p)) })}</span>
                        <EvidenceBadge level={evidenceById[p.evidence].level} />
                      </span>
                    </span>
                  </Link>
                ))}
            </div>
          </Reveal>
        ))}

      <Reveal delay={0.3} as="section" className="card p-5">
        <h2 className="text-ink text-base font-bold">{t("rehabTitle")}</h2>
        <p className="text-steel mt-1 text-sm">{t("rehabBody")}</p>
      </Reveal>
      <Reveal delay={0.32}>
        <p className="text-steel text-xs">{t("libraryDisclaimer")}</p>
      </Reveal>
    </Container>
  );
}
