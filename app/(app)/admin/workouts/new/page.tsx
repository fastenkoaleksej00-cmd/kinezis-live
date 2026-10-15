import { getSessionUser } from "@/lib/supabase/server";
import { getTranslations } from "next-intl/server";
import { WorkoutForm } from "@/components/admin/WorkoutForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listAuthorRows } from "@/lib/admin/queries";

export default async function NewWorkoutPage() {
  const t = await getTranslations("admin");
  const authors = await listAuthorRows();
  const isAdmin = (await getSessionUser())?.role === "admin";
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("newWorkout")} />
      <WorkoutForm authors={authors} isAdmin={isAdmin} />
    </div>
  );
}
