import { getTranslations } from "next-intl/server";
import { CourseForm } from "@/components/admin/CourseForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listAuthorRows } from "@/lib/admin/queries";

export default async function NewCoursePage() {
  const t = await getTranslations("admin");
  const authors = await listAuthorRows();
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("newCourse")} />
      <CourseForm authors={authors} />
    </div>
  );
}
