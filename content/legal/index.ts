import type { Locale } from "@/i18n/config";
import { privacyDe, termsDe } from "./de";
import { privacyEn, termsEn } from "./en";
import { privacyRu, termsRu } from "./ru";
import type { LegalDocument } from "./types";
import { privacyUk, termsUk } from "./uk";

const privacy: Record<Locale, LegalDocument> = { en: privacyEn, uk: privacyUk, de: privacyDe, ru: privacyRu };
const terms: Record<Locale, LegalDocument> = { en: termsEn, uk: termsUk, de: termsDe, ru: termsRu };

export function getPrivacy(locale: Locale): LegalDocument {
  return privacy[locale] ?? privacyEn;
}

export function getTerms(locale: Locale): LegalDocument {
  return terms[locale] ?? termsEn;
}

/** Contact shown under both documents. Set NEXT_PUBLIC_CONTACT_EMAIL; until then an honest placeholder is shown. */
export function getContactEmail(): string | null {
  const v = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim();
  return v && v.includes("@") ? v : null;
}
