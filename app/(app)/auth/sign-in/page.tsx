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
  const callbackFailed = params.error === "callback";

  return (
    <Container as="section" className="max-w-[480px] space-y-6 py-6 sm:py-10">
      <Reveal>
        <SectionHeading as="h1" title={t("signInTitle")} lead={t("signInLead")} />
      </Reveal>
      {callbackFailed ? (
        <Reveal delay={0.03}>
          <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">{t("errors.callback")}</p>
        </Reveal>
      ) : null}
      <Reveal delay={0.06}>
        {configured ? <AuthForm mode="signIn" /> : <EmptyState icon={UserRound} title={t("errors.notConfigured")} body={t("notConfiguredBody")} />}
      </Reveal>
    </Container>
  );
}
