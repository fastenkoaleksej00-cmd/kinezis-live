import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { LessonDoneButton } from "@/components/courses/LessonDoneButton";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { Container } from "@/components/ui/Container";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { getCourse, getLesson } from "@/lib/content/courses";
import { pick } from "@/lib/content/localize";

interface LessonPageProps {
  params: Promise<{ slug: string; lesson: string }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lesson: lessonSlug } = await params;
  const course = await getCourse(slug);
  if (!course) notFound();
  const found = getLesson(course, lessonSlug);
  if (!found) notFound();
  const { lesson, next, prev } = found;

  const locale = await getLocale();
  const t = await getTranslations("faceFitness");
  const title = pick(lesson.title, locale);

  return (
    <div className="section-deep relative -mb-24 min-h-dvh pb-28 text-white md:-mb-10 md:pb-12">
      <div className="grid-bg-dark pointer-events-none absolute inset-0" aria-hidden />
      <Container as="section" className="relative space-y-6 py-4 sm:py-8">
        <Link href={`/face-fitness/${course.slug}`} className="text-mist inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold backdrop-blur-md transition-colors hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {pick(course.title, locale)}
        </Link>

        <VideoPlayer workoutId={lesson.id} source={lesson.video} title={title} />

        <div>
          <p className="text-mint text-[11px] font-semibold tracking-[0.3em] uppercase">{t("lesson")}</p>
          <h1 className="text-frost mt-1.5 text-2xl leading-tight font-extrabold sm:text-3xl">{title}</h1>
          {lesson.summary ? <p className="text-mist mt-3 max-w-2xl text-[15px] leading-relaxed">{pick(lesson.summary, locale)}</p> : null}
        </div>

        {lesson.routine && lesson.routine.length > 0 ? (
          <section className="glass-dark rounded-3xl p-5">
            <h2 className="text-frost text-base font-bold">{t("routine")}</h2>
            <ol className="mt-3 space-y-2.5">
              {lesson.routine.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="bg-mint/20 text-mint inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold">{i + 1}</span>
                  <span className="text-mist">{pick(step, locale)}</span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        {lesson.recommendations ? (
          <section className="glass-dark rounded-3xl p-5">
            <h2 className="text-frost text-base font-bold">{t("recommendations")}</h2>
            <p className="text-mist mt-2 text-sm leading-relaxed">{pick(lesson.recommendations, locale)}</p>
          </section>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <LessonDoneButton lessonId={lesson.id} />
          <div className="flex gap-2">
            {prev ? (
              <Link href={`/face-fitness/${course.slug}/${prev.slug}`} className={buttonStyles("secondary", "md")}>
                <ArrowLeft className="h-4 w-4" aria-hidden />
                {t("prevLesson")}
              </Link>
            ) : null}
            {next ? (
              <Link href={`/face-fitness/${course.slug}/${next.slug}`} className={buttonStyles("light", "md")}>
                {t("nextLesson")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            ) : null}
          </div>
        </div>
      </Container>
    </div>
  );
}
