import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { KeyRound } from "lucide-react";
import { ResetForm } from "@/components/auth/PasswordForms";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { getSessionUser } from "@/lib/supabase/server";

/** Landing page of the recovery link. Without a session the link was invalid or expired. */
export default async function ResetPage() {
  const t = await getTranslations("auth");
  const user = await getSessionUser();
  return (
    <Container as="section" className="max-w-[480px] space-y-6 py-6 sm:py-10">
      <Reveal>
        <SectionHeading as="h1" title={t("resetTitle")} lead={user ? t("resetLead") : undefined} />
      </Reveal>
      <Reveal delay={0.06}>
        {user ? (
          <ResetForm />
        ) : (
          <EmptyState
            icon={KeyRound}
            title={t("errors.expired")}
            body={t("resetExpiredBody")}
            action={
              <Link href="/auth/forgot" className={buttonStyles("primary", "md")}>
                {t("requestNew")}
              </Link>
            }
          />
        )}
      </Reveal>
    </Container>
  );
}
