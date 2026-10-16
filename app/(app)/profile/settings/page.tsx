import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Bell, FileText, KeyRound, Languages, ShieldCheck, Type } from "lucide-react";
import { AccessibilitySettings } from "@/components/settings/AccessibilitySettings";
import { TipsSettings } from "@/components/onboarding/FeatureTip";
import { AccountForms } from "@/components/settings/AccountForms";
import { LanguageSwitcher } from "@/components/settings/LanguageSwitcher";
import { PreferencesForm } from "@/components/settings/PreferencesForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { signOut } from "@/lib/auth/actions";
import { SignOutForm } from "@/components/auth/SignOutForm";
import { getMyProfile } from "@/lib/profile/queries";
import { getSessionUser } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Full settings screen: language, notifications and reminders, privacy, accessibility, account. */
export default async function SettingsPage({ searchParams }: PageProps) {
  const t = await getTranslations("settings");
  const ta = await getTranslations("auth");
  const tc = await getTranslations("common");
  const tlg = await getTranslations("legal");
  const sp = await searchParams;
  const [user, profile] = await Promise.all([getSessionUser(), getMyProfile()]);

  const sections = [
    { href: "#language", icon: Languages, label: t("language") },
    { href: "#notifications", icon: Bell, label: t("notifications.title") },
    { href: "#privacy", icon: ShieldCheck, label: t("privacy.title") },
    { href: "#accessibility", icon: Type, label: t("accessibility.title") },
    { href: "#account", icon: KeyRound, label: t("account.title") },
  ];

  return (
    <Container as="section" className="max-w-[760px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/profile" className={buttonStyles("ghost", "sm", "-ml-3 mb-2")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tc("back")}
        </Link>
        <SectionHeading as="h1" title={t("title")} />
      </Reveal>

      <Reveal delay={0.04}>
        <nav aria-label={t("title")} className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {sections.map(({ href, icon: Icon, label }) => (
            <a key={href} href={href} className="border-ink/10 text-ink inline-flex h-9 shrink-0 items-center gap-2 rounded-full border bg-white/70 px-4 text-sm font-semibold hover:bg-white">
              <Icon className="h-4 w-4" strokeWidth={1.9} aria-hidden />
              {label}
            </a>
          ))}
        </nav>
      </Reveal>

      {sp.error === "delete" ? <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">{t("account.errors.generic")}</p> : null}

      <Reveal delay={0.06} as="section" id="language" className="card space-y-4 p-5">
        <div>
          <h2 className="text-ink text-base font-bold">{t("language")}</h2>
          <p className="text-steel mt-1 text-sm">{t("languageHint")}</p>
        </div>
        <LanguageSwitcher />
      </Reveal>

      {profile ? (
        <Reveal delay={0.1}>
          <PreferencesForm profile={profile} />
        </Reveal>
      ) : (
        <Reveal delay={0.1}>
          <p className="card text-steel px-5 py-4 text-sm">{t("signedOutNote")}</p>
        </Reveal>
      )}

      <Reveal delay={0.14}>
        <AccessibilitySettings />
      </Reveal>

      <Reveal delay={0.16} as="section" id="legal" className="card divide-ink/8 divide-y overflow-hidden">
        <TipsSettings />
        {[
          { href: "/welcome", label: t("showIntro") },
          { href: "/privacy", label: tlg("privacy") },
          { href: "/terms", label: tlg("terms") },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
            <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
              <FileText className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="text-ink flex-1 font-semibold">{l.label}</span>
          </Link>
        ))}
      </Reveal>

      <Reveal delay={0.18} as="section" id="account" className="space-y-4">
        <h2 className="text-ink text-xl font-bold">{t("account.title")}</h2>
        {user ? (
          <>
            <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
              <span className="min-w-0 flex-1">
                <span className="text-ink block font-semibold">{t("account.exportTitle")}</span>
                <span className="text-steel block text-sm">{t("account.exportBody")}</span>
              </span>
              <a href="/api/export" download className={buttonStyles("secondary", "md")}>
                {t("account.exportButton")}
              </a>
            </div>
            <AccountForms email={user.email} />
            <SignOutForm action={signOut} className="card flex items-center justify-between gap-4 p-5">
              <span className="text-steel text-sm">{t("account.signOutHint")}</span>
              <button type="submit" className={buttonStyles("secondary", "md")}>
                {ta("signOut")}
              </button>
            </SignOutForm>
          </>
        ) : (
          <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
            <span className="text-steel text-sm">{t("signedOutNote")}</span>
            <Link href="/auth/sign-in" className={buttonStyles("primary", "md")}>
              {ta("signIn")}
            </Link>
          </div>
        )}
      </Reveal>
    </Container>
  );
}
