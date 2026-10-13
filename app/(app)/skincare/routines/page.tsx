import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ChevronRight, ListChecks } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick } from "@/lib/content/localize";
import { listRoutines } from "@/lib/content/skincare";

export default async function SkincareRoutinesPage() {
  const t = await getTranslations("skincare");
  const locale = await getLocale();
  const items = await listRoutines();

  return (
    <Container as="section" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/skincare" className={buttonStyles("ghost", "sm", "-ml-3 mb-2")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
        <SectionHeading as="h1" title={t("routines.title")} lead={t("routines.body")} />
      </Reveal>
      <Reveal delay={0.06}>
        {items.length === 0 ? (
          <EmptyState icon={ListChecks} title={t("routines.emptyTitle")} body={t("routines.emptyBody")} />
        ) : (
          <ul className="card divide-ink/8 divide-y overflow-hidden">
            {items.map((r) => (
              <li key={r.id}>
                <Link href={`/skincare/routines/${r.slug}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                  <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    <ListChecks className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="text-ink block truncate font-semibold">{pick(r.title, locale)}</span>
                    <span className="text-steel block text-xs">
                      {t(`times.${r.time}`)} · {t("stepsCount", { count: r.steps.length })}
                    </span>
                  </span>
                  <ChevronRight className="text-steel h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </Container>
  );
}
