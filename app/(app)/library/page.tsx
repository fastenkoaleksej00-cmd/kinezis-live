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
import { listAuthors, listWorkouts, parseFilters } from "@/lib/content/workouts";
import { BookOpen } from "lucide-react";

interface LibraryPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const t = await getTranslations("library");
  const locale = await getLocale();
  const filters = parseFilters(await searchParams);
  const [filtered, all, authors] = await Promise.all([listWorkouts(filters), listWorkouts(), listAuthors()]);
  const nameOf = (id: string) => authors.find((a) => a.id === id)?.name;
  const workouts = filtered.map((w) => toCardData(w, locale, nameOf(w.authorId)));
  const authorOptions = authors.filter((a) => all.some((w) => w.authorId === a.id)).map((a) => ({ id: a.id, name: a.name }));
  const hasSample = all.some((w) => w.sample);

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      </Reveal>

      <Suspense fallback={null}>
        <FilterBar filters={filters} authors={authorOptions} />
      </Suspense>
      <Reveal delay={0.04}>
        <Link href="/programs" className="card group flex items-center gap-4 px-4 py-3 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
          <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
            <BookOpen className="h-5 w-5" strokeWidth={1.8} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-ink block text-sm font-bold">{t("programsTitle")}</span>
            <span className="text-steel block text-xs">{t("programsBody")}</span>
          </span>
        </Link>
      </Reveal>

      {workouts.length === 0 ? (
        <EmptyState
          icon={Film}
          illustration="search"
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
