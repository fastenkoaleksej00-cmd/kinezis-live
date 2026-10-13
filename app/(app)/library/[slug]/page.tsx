import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Clock, Play, Signal, Target, UserRound } from "lucide-react";
import { workoutKey } from "@/lib/store/keys";
import { SaveButton } from "@/components/library/SaveButton";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick } from "@/lib/content/localize";
import { getAuthor, getWorkout } from "@/lib/content/workouts";

interface WorkoutPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: WorkoutPageProps) {
  const { slug } = await params;
  const workout = getWorkout(slug);
  if (!workout) return {};
  const locale = await getLocale();
  return { title: pick(workout.title, locale) };
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { slug } = await params;
  const workout = getWorkout(slug);
  if (!workout) notFound();

  const locale = await getLocale();
  const t = await getTranslations("library");
  const tc = await getTranslations("common");
  const author = getAuthor(workout.authorId);
  const light = workout.coverTone === "light";

  const facts = [
    { icon: Clock, label: t("filters.duration"), value: tc("minutes", { count: workout.durationMin }) },
    { icon: Signal, label: t("filters.level"), value: t(`levels.${workout.level}`) },
    { icon: Target, label: t("filters.goal"), value: workout.goals.map((g) => t(`goals.${g}`)).join(", ") },
    { icon: UserRound, label: t("trainer"), value: author?.name ?? "—" },
  ];

  return (
    <Container as="article" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/library" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
        <Cover tone={workout.coverTone} ratio="aspect-[4/3] sm:aspect-[21/9]" label={t(`categories.${workout.category}`)}>
          <div className="absolute top-3 right-3 z-20">
            <SaveButton itemKey={workoutKey(workout.id)} look="glass" size="md" />
          </div>
          <div className="flex h-full flex-col justify-end p-5 sm:p-7">
            <h1 className={light ? "text-ink text-2xl leading-tight font-extrabold sm:text-4xl" : "text-frost text-2xl leading-tight font-extrabold sm:text-4xl"}>
              {pick(workout.title, locale)}
            </h1>
            <p className={light ? "text-steel mt-2 text-sm font-medium" : "text-mist mt-2 text-sm font-medium"}>
              {tc("minutes", { count: workout.durationMin })} · {t(`levels.${workout.level}`)}
            </p>
          </div>
        </Cover>
      </Reveal>

      <Reveal delay={0.1} className="flex flex-wrap gap-3">
        <Link href={`/library/${workout.slug}/watch`} className={buttonStyles("primary", "lg", "flex-1 sm:flex-none")}>
          <Play className="h-4 w-4" fill="currentColor" aria-hidden />
          {t("start")}
        </Link>
        <SaveButton itemKey={workoutKey(workout.id)} look="solid" size="md" withLabel />
      </Reveal>

      <Reveal delay={0.14} as="section" className="grid gap-3 sm:grid-cols-2">
        <p className="card text-text px-5 py-4 text-[15px] leading-relaxed sm:col-span-2">{pick(workout.description, locale)}</p>
        {facts.map(({ icon: Icon, label, value }) => (
          <div key={label} className="card flex items-center gap-3 px-4 py-3.5">
            <span className="bg-accent-soft text-accent inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="text-steel block text-[11px] font-semibold tracking-[0.12em] uppercase">{label}</span>
              <span className="text-ink block truncate text-sm font-semibold">{value}</span>
            </span>
          </div>
        ))}
      </Reveal>
    </Container>
  );
}
