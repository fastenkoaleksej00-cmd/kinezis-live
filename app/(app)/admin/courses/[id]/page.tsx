import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CourseForm } from "@/components/admin/CourseForm";
import { ModuleEditor } from "@/components/admin/ModuleEditor";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getCourseRow, listAuthorRows, listLessonRows, listModuleRows } from "@/lib/admin/queries";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function EditCoursePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const [course, authors, modules] = await Promise.all([getCourseRow(id), listAuthorRows(), listModuleRows(id)]);
  if (!course) notFound();
  const lessons = await listLessonRows(modules.map((m) => m.id));
  const t = await getTranslations("admin");

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <SectionHeading as="h1" title={t("editCourse")} lead={course.title.en} />
        {sp.saved ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("savedNotice")}</p> : null}
        {sp.deleted ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm font-semibold">{t("deletedNotice")}</p> : null}
        <CourseForm course={course} authors={authors} />
      </div>
      <ModuleEditor courseId={course.id} modules={modules} lessons={lessons} />
    </div>
  );
}
