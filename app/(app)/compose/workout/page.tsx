import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { WorkoutComposer } from "@/components/compose/WorkoutComposer";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listAuthorRows } from "@/lib/admin/queries";
import { getSessionUser, isStaff } from "@/lib/supabase/server";

/** Trainer-only: publish a workout video in one screen. Non-staff are sent to their profile (and the server action checks again). */
export default async function ComposeWorkoutPage() {
  const user = await getSessionUser();
  if (!isStaff(user)) redirect("/profile");
  const t = await getTranslations("workoutCompose");
  const tn = await getTranslations("nav");
  const locale = await getLocale();
  const authors = await listAuthorRows();
  const isAdmin = (await getSessionUser())?.role === "admin";
  return (
    <Container as="section" className="max-w-[680px] space-y-5 py-4 sm:py-8">
      <Reveal>
        <Link href="/" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("home")}
        </Link>
        <SectionHeading as="h1" title={t("pageTitle")} lead={t("pageLead")} />
      </Reveal>
      <Reveal delay={0.06}>
        <WorkoutComposer authors={authors} defaultLanguage={locale} isAdmin={isAdmin} />
      </Reveal>
    </Container>
  );
}
