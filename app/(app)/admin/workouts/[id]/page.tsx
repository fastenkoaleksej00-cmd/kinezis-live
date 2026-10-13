import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { WorkoutForm } from "@/components/admin/WorkoutForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getWorkoutRow, listAuthorRows } from "@/lib/admin/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWorkoutPage({ params }: PageProps) {
  const { id } = await params;
  const [workout, authors] = await Promise.all([getWorkoutRow(id), listAuthorRows()]);
  if (!workout) notFound();
  const t = await getTranslations("admin");
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("editWorkout")} lead={workout.title.en} />
      <WorkoutForm workout={workout} authors={authors} />
    </div>
  );
}
