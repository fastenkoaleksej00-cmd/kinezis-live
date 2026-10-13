import { getTranslations } from "next-intl/server";
import { CourseCard } from "@/components/courses/CourseCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listCourses } from "@/lib/content/courses";

export default async function FaceFitnessPage() {
  const t = await getTranslations("faceFitness");
  const courses = await listCourses();

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((c, i) => (
          <Reveal key={c.id} delay={0.05 * (i + 1)}>
            <CourseCard course={c} />
          </Reveal>
        ))}
      </div>
      {courses.some((c) => c.sample) ? (
        <Reveal delay={0.12}>
          <p className="text-steel text-center text-xs">{t("sampleNote")}</p>
        </Reveal>
      ) : null}
    </Container>
  );
}
