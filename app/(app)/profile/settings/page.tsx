import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";

export default async function SettingsPage() {
  const t = await getTranslations("settings");
  const tc = await getTranslations("common");

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <Link href="/profile" className={buttonStyles("ghost", "sm", "-ml-3 mb-2")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tc("back")}
        </Link>
        <SectionHeading as="h1" title={t("title")} />
      </Reveal>

      <Reveal delay={0.06} as="section" className="card space-y-4 p-5">
        <div>
          <h2 className="text-ink text-base font-bold">{t("language")}</h2>
          <p className="text-steel mt-1 text-sm">{t("languageHint")}</p>
        </div>
        <LanguageSwitcher />
      </Reveal>
    </Container>
  );
}
