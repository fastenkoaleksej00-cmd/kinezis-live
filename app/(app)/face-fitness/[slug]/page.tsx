import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { CourseProgress } from "@/components/courses/CourseProgress";
import { LessonRow } from "@/components/courses/LessonRow";
import { SaveButton } from "@/components/library/SaveButton";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { countLessons, flatLessons, getCourse } from "@/lib/content/courses";
import { pick } from "@/lib/content/localize";
import { getAuthor } from "@/lib/content/workouts";
import { courseKey } from "@/lib/store/keys";

interface CoursePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  const locale = await getLocale();
  return { title: pick(course.title, locale) };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const locale = await getLocale();
  const t = await getTranslations("faceFitness");
  const tl = await getTranslations("library");
  const author = getAuthor(course.authorId);
  const light = course.coverTone === "light";
  const lessonIds = flatLessons(course).map((l) => l.id);

  return (
    <Container as="article" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/face-fitness" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
        <Cover tone={course.coverTone} ratio="aspect-[4/3] sm:aspect-[21/9]" label={course.sample ? t("sample") : undefined}>
          <div className="absolute top-3 right-3 z-20">
            <SaveButton itemKey={courseKey(course.id)} look="glass" size="md" />
          </div>
          <div className="flex h-full flex-col justify-end p-5 sm:p-7">
            <h1 className={light ? "text-ink text-2xl leading-tight font-extrabold sm:text-4xl" : "text-frost text-2xl leading-tight font-extrabold sm:text-4xl"}>{pick(course.title, locale)}</h1>
            <p className={light ? "text-steel mt-2 text-sm font-medium" : "text-mist mt-2 text-sm font-medium"}>
              {t("modules", { count: course.modules.length })} · {t("lessons", { count: countLessons(course) })} · {tl(`levels.${course.level}`)} · {author?.name}
            </p>
          </div>
        </Cover>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="card text-text px-5 py-4 text-[15px] leading-relaxed">{pick(course.description, locale)}</p>
      </Reveal>

      <Reveal delay={0.14}>
        <CourseProgress lessonIds={lessonIds} />
      </Reveal>

      <div className="space-y-5">
        {course.modules.map((m, mi) => (
          <Reveal key={m.id} delay={0.18 + mi * 0.05} as="section" className="space-y-2.5">
            <p className="eyebrow">{pick(m.title, locale)}</p>
            <ul className="card divide-ink/8 divide-y overflow-hidden">
              {m.lessons.map((l, li) => (
                <li key={l.id}>
                  <LessonRow
                    href={`/face-fitness/${course.slug}/${l.slug}`}
                    lessonId={l.id}
                    number={`${mi + 1}.${li + 1}`}
                    title={pick(l.title, locale)}
                    durationMin={l.durationMin}
                    hasVideo={l.video !== null}
                  />
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
