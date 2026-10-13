import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { RoutineForm } from "@/components/admin/SkincareForms";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRoutineRow } from "@/lib/admin/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: PageProps) {
  const { id } = await params;
  const row = await getRoutineRow(id);
  if (!row) notFound();
  const t = await getTranslations("admin");
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("editRoutine")} lead={row.title.en} />
      <RoutineForm routine={row} />
    </div>
  );
}
