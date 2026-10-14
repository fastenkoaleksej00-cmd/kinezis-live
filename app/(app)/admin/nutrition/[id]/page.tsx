import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { MealPlanForm } from "@/components/admin/MealPlanForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getMealPlanRow, listAuthorRows } from "@/lib/admin/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditMealPlanPage({ params }: PageProps) {
  const { id } = await params;
  const [plan, authors] = await Promise.all([getMealPlanRow(id), listAuthorRows()]);
  if (!plan) notFound();
  const t = await getTranslations("admin");
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("editMealPlan")} lead={plan.title.en} />
      <MealPlanForm plan={plan} authors={authors} />
    </div>
  );
}
