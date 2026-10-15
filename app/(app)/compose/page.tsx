import Link from "next/link";
import { redirect } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Composer } from "@/components/compose/Composer";
import { MemberComposer } from "@/components/compose/MemberComposer";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listAuthorRows } from "@/lib/admin/queries";
import { getSessionUser, isStaff } from "@/lib/supabase/server";

/** Quick publish screen behind the "+" button. Staff get the trainer composer, members the community one. */
export default async function ComposePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/sign-in");
  const staff = isStaff(user);
  const t = await getTranslations("compose");
  const tn = await getTranslations("nav");
  const locale = await getLocale();
  const authors = staff ? await listAuthorRows() : [];

  return (
    <Container as="section" className="max-w-[640px] space-y-5 py-4 sm:py-8">
      <Reveal>
        <Link href="/" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("home")}
        </Link>
        <SectionHeading as="h1" title={t("title")} lead={staff ? t("lead") : t("memberLead")} />
      </Reveal>
      <Reveal delay={0.06}>
        {staff ? <Composer authors={authors} defaultLanguage={locale === "en" ? "en" : locale} /> : <MemberComposer userId={user.id} defaultLanguage={locale} />}
      </Reveal>
    </Container>
  );
}
