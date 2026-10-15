import { getLocale, getTranslations } from "next-intl/server";
import { LegalDocument } from "@/components/legal/LegalDocument";
import { getPrivacy } from "@/content/legal";
import type { Locale } from "@/i18n/config";

export async function generateMetadata() {
  const locale = (await getLocale()) as Locale;
  return { title: getPrivacy(locale).title, robots: { index: true, follow: true } };
}

export default async function PrivacyPage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("legal");
  return <LegalDocument doc={getPrivacy(locale)} other={{ href: "/terms", label: t("terms") }} />;
}
