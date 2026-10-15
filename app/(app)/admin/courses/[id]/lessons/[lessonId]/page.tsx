import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { LessonForm } from "@/components/admin/LessonForm";
import { listWorkouts } from "@/lib/content/workouts";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { getCourseRow, getLessonRow, listModuleRows } from "@/lib/admin/queries";

interface PageProps {
  params: Promise<{ id: string; lessonId: string }>;
}

export default async function EditLessonPage({ params }: PageProps) {
  const { id, lessonId } = await params;
  const [course, modules, lesson] = await Promise.all([getCourseRow(id), listModuleRows(id), getLessonRow(lessonId)]);
  if (!course || !lesson) notFound();
  const t = await getTranslations("admin");

  return (
    <div className="space-y-5">
      <Link href={`/admin/courses/${id}`} className={buttonStyles("ghost", "sm", "-ml-3")}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {course.title.en}
      </Link>
      <SectionHeading as="h1" title={t("editLesson")} lead={lesson.title.en} />
      <LessonForm courseId={id} modules={modules} lesson={lesson} workouts={(await listWorkouts()).filter((w) => !w.sample).map((w) => ({ id: w.id, title: w.title.en }))} />
    </div>
  );
}
