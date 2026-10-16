import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ShieldCheck, UserRoundCheck } from "lucide-react";
import { TrainerApplicationForm } from "@/components/trainer/TrainerApplicationForm";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { getSessionUser } from "@/lib/supabase/server";
import { getMyApplication } from "@/lib/trainers/queries";

/** "Become a trainer": status of the member's application and the form. Approval is manual; nothing is auto-verified. */
export default async function TrainerApplyPage() {
  const t = await getTranslations("trainers.apply");
  const tn = await getTranslations("nav");
  const [user, application] = await Promise.all([getSessionUser(), getMyApplication()]);

  return (
    <Container as="section" className="max-w-[760px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/profile" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("profile")}
        </Link>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      {!user ? (
        <EmptyState
          icon={UserRoundCheck}
          title={t("signedOutTitle")}
          body={t("signedOutBody")}
          action={
            <Link href="/auth/sign-in" className={buttonStyles("primary", "md")}>
              {t("signIn")}
            </Link>
          }
        />
      ) : user.role !== "user" ? (
        <Reveal delay={0.05}>
          <div className="card flex items-start gap-4 p-5">
            <span className="bg-mint-soft text-mint-deep inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <div className="text-sm">
              <p className="text-ink font-semibold">{t("alreadyTrainer")}</p>
              <Link href="/admin" className="text-accent mt-1 inline-block font-semibold hover:underline">
                {t("openCabinet")}
              </Link>
            </div>
          </div>
        </Reveal>
      ) : (
        <>
          {application && application.status !== "draft" ? (
            <Reveal delay={0.05}>
              <div className={`rounded-2xl px-4 py-3 text-sm ${application.status === "rejected" ? "bg-danger-soft text-danger" : "bg-accent-soft text-accent"}`}>
                <p className="font-semibold">{t(`status.${application.status}`)}</p>
                <p className="mt-0.5">{t(`statusBody.${application.status}`)}</p>
                {application.status === "rejected" && application.adminNote ? <p className="mt-1 text-xs">{t("adminNote")}: {application.adminNote}</p> : null}
              </div>
            </Reveal>
          ) : null}
          <Reveal delay={0.08}>
            <TrainerApplicationForm userId={user.id} application={application} />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-steel text-xs">{t("privacyNote")}</p>
          </Reveal>
        </>
      )}
    </Container>
  );
}
