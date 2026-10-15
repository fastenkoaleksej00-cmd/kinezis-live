import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listCourses } from "@/lib/content/courses";

/** Programmes: ordered sequences of sessions by any trainer (courses with kind = "program"). */
export default async function ProgramsPage() {
  const t = await getTranslations("programs");
  const programs = (await listCourses()).filter((c) => c.kind === "program");

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      {programs.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          illustration="sessions"
          title={t("emptyTitle")}
          body={t("emptyBody")}
          action={
            <Link href="/library" className={buttonStyles("secondary", "md")}>
              {t("toLibrary")}
            </Link>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {programs.map((c, i) => (
            <Reveal key={c.id} delay={0.05 * (i + 1)}>
              <CourseCard course={c} />
            </Reveal>
          ))}
        </div>
      )}
      <Reveal delay={0.1}>
        <p className="text-steel text-xs">{t("disclaimer")}</p>
      </Reveal>
    </Container>
  );
}
