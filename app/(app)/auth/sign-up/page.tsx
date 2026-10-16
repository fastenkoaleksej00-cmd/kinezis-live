import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AuthForm } from "@/components/auth/AuthForm";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/supabase/server";
import { UserRound } from "lucide-react";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Page({ searchParams }: PageProps) {
  const t = await getTranslations("auth");
  if (await getSessionUser()) redirect("/profile");
  const configured = getSupabaseEnv() !== null;
  const params = await searchParams;
  const errorCode = params.error === "callback" || params.error === "oauth" || params.error === "notConfigured" ? params.error : null;
  const googleEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE === "true";
  const passwordUpdated = params.password === "updated";

  return (
    <Container as="section" className="max-w-[480px] space-y-6 py-6 sm:py-10">
      <Reveal>
        <SectionHeading as="h1" title={t("signUpTitle")} lead={t("signUpLead")} />
      </Reveal>
      {errorCode ? (
        <Reveal delay={0.03}>
          <p role="alert" className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">{t(`errors.${errorCode}`)}</p>
        </Reveal>
      ) : null}
      {passwordUpdated ? (
        <Reveal delay={0.03}>
          <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("passwordUpdated")}</p>
        </Reveal>
      ) : null}
      <Reveal delay={0.06}>
        {configured ? <AuthForm mode="signUp" googleEnabled={googleEnabled} /> : <EmptyState icon={UserRound} title={t("errors.notConfigured")} body={t("notConfiguredBody")} />}
      </Reveal>
    </Container>
  );
}
