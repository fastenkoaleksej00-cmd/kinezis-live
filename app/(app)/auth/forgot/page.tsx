import { getTranslations } from "next-intl/server";
import { ForgotForm } from "@/components/auth/PasswordForms";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function ForgotPage() {
  const t = await getTranslations("auth");
  return (
    <Container as="section" className="max-w-[480px] space-y-6 py-6 sm:py-10">
      <Reveal>
        <SectionHeading as="h1" title={t("forgotTitle")} lead={t("forgotLead")} />
      </Reveal>
      <Reveal delay={0.06}>
        <ForgotForm />
      </Reveal>
    </Container>
  );
}
