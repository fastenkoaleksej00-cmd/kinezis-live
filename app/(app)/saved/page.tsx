import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { SavedCourses, type SavedCourseData } from "@/components/courses/SavedCourses";
import { SavedEmpty } from "@/components/feed/SavedEmpty";
import { SavedPosts, type SavedPostData } from "@/components/feed/SavedPosts";
import { SavedWorkouts } from "@/components/library/SavedWorkouts";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { pick, toCardData } from "@/lib/content/localize";
import { countLessons, listCourses } from "@/lib/content/courses";
import { listPosts } from "@/lib/content/posts";
import { listWorkouts } from "@/lib/content/workouts";

export default async function SavedPage() {
  const t = await getTranslations("saved");
  const tf = await getTranslations("feed");
  const tff = await getTranslations("faceFitness");
  const locale = await getLocale();
  const format = await getFormatter();
  const [allWorkouts, allPosts] = await Promise.all([listWorkouts(), listPosts()]);
  const workouts = allWorkouts.map((w) => toCardData(w, locale));
  const posts: SavedPostData[] = allPosts.map((p) => ({
    id: p.id,
    title: p.title ? pick(p.title, locale) : pick(p.body, locale).slice(0, 80),
    kind: tf(`kinds.${p.kind}`),
    date: format.dateTime(new Date(p.publishedAt), { day: "numeric", month: "long" }),
  }));

  const courses: SavedCourseData[] = (await listCourses()).map((c) => ({
    id: c.id,
    slug: c.slug,
    title: pick(c.title, locale),
    meta: `${tff("modules", { count: c.modules.length })} · ${tff("lessons", { count: countLessons(c) })}`,
  }));

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal delay={0.06} className="space-y-8">
        <SavedEmpty />
        <SavedWorkouts workouts={workouts} />
        <SavedCourses courses={courses} />
        <SavedPosts posts={posts} />
      </Reveal>
    </Container>
  );
}
