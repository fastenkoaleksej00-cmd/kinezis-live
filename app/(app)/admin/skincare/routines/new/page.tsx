import { getTranslations } from "next-intl/server";
import { RoutineForm } from "@/components/admin/SkincareForms";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function NewPage() {
  const t = await getTranslations("admin");
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("newRoutine")} />
      <RoutineForm />
    </div>
  );
}
