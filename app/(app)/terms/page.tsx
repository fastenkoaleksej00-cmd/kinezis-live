import { getLocale, getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getTerms } from "@/content/legal";
import type { Locale } from "@/i18n/config";

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  return { title: getTerms(locale).title, robots: { index: true, follow: true } };
}

export default async function TermsPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("legal");
  return <LegalDocument doc={getTerms(locale)} other={{ href: "/privacy", label: t("privacy") }} />;
}
