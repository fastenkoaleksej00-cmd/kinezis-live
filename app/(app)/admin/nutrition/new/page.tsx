import { getTranslations } from "next-intl/server";
import { MealPlanForm } from "@/components/admin/MealPlanForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listAuthorRows } from "@/lib/admin/queries";

export default async function NewMealPlanPage() {
  const t = await getTranslations("admin");
  const authors = await listAuthorRows();
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("newMealPlan")} />
      <MealPlanForm authors={authors} />
    </div>
  );
}
