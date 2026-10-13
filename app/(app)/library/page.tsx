import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { Film } from "lucide-react";
import { FilterBar } from "@/components/library/FilterBar";
import { WorkoutCard } from "@/components/library/WorkoutCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { toCardData } from "@/lib/content/localize";
import { listWorkouts, parseFilters } from "@/lib/content/workouts";

interface LibraryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const t = await getTranslations("library");
  const locale = await getLocale();
  const filters = parseFilters(await searchParams);
  const [filtered, all] = await Promise.all([listWorkouts(filters), listWorkouts()]);
  const workouts = filtered.map((w) => toCardData(w, locale));
  const hasSample = all.some((w) => w.sample);

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      </Reveal>

      <Suspense fallback={null}>
        <FilterBar filters={filters} />
      </Suspense>

      {workouts.length === 0 ? (
        <EmptyState
          icon={Film}
          title={t("noResults")}
          body={t("noResultsBody")}
          action={
            <Link href="/library" className={buttonStyles("secondary", "md")}>
              {t("filters.reset")}
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {workouts.map((w, i) => (
            <Reveal key={w.id} delay={Math.min(i, 6) * 0.05}>
              <WorkoutCard workout={w} />
            </Reveal>
          ))}
        </div>
      )}

      {hasSample ? <p className="text-steel text-center text-xs">{t("sampleNote")}</p> : null}
    </Container>
  );
}
