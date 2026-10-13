import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { LessonForm } from "@/components/admin/LessonForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { getCourseRow, listModuleRows } from "@/lib/admin/queries";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NewLessonPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const [course, modules] = await Promise.all([getCourseRow(id), listModuleRows(id)]);
  if (!course) notFound();
  const t = await getTranslations("admin");
  const moduleId = typeof sp.module === "string" ? sp.module : undefined;

  return (
    <div className="space-y-5">
      <Link href={`/admin/courses/${id}`} className={buttonStyles("ghost", "sm", "-ml-3")}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {course.title.en}
      </Link>
      <SectionHeading as="h1" title={t("newLesson")} />
      <LessonForm courseId={id} modules={modules} defaultModuleId={moduleId} />
    </div>
  );
}
