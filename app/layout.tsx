import type { Metadata, Viewport } from "next";
import { Caveat, Manrope } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { OnboardingGate } from "@/components/onboarding/OnboardingGate";
import { AccessibilityProvider } from "@/components/settings/AccessibilityProvider";
import { getSiteUrl } from "@/lib/utils";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

/** Handwritten accent, used sparingly for short notes */
const caveat = Caveat({
  subsets: ["latin", "cyrillic"],
  weight: ["500"],
  variable: "--font-caveat",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("brand");
  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: t("name"),
      template: `%s · ${t("name")}`,
    },
    description: t("tagline"),
    applicationName: t("name"),
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: t("name"),
    },
    robots: { index: false, follow: false },
    // Legal pages override this with index: true in their own metadata
  };
}

export const viewport: Viewport = {
  themeColor: "#F5F8F8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${manrope.variable} ${caveat.variable}`}>
      <body className="font-sans">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var a=JSON.parse(localStorage.getItem("kl_a11y")||"{}");var d=document.documentElement;if(a.textSize)d.dataset.textSize=a.textSize;if(a.reduceMotion)d.dataset.reduceMotion="true";var t=a.theme||"system";if(t==="system"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}d.dataset.theme=t;}catch(e){}`,
          }}
        />
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
        <AccessibilityProvider />
        <NextIntlClientProvider>
          <OnboardingGate />
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
