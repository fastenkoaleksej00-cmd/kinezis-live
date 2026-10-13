import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronRight, History, LogOut, MessageCircle, Settings, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { signOut } from "@/lib/auth/actions";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const ta = await getTranslations("auth");
  const tc = await getTranslations("common");
  const user = await getSessionUser();
  const configured = getSupabaseEnv() !== null;

  const rows = [
    { icon: History, title: t("history"), body: t("historyEmpty") },
    { icon: Sparkles, title: t("subscription"), body: t("subscriptionFree") },
    { icon: MessageCircle, title: t("support"), body: t("supportHint") },
  ];

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" title={t("title")} />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="section-deep relative overflow-hidden rounded-3xl p-5 text-white sm:p-6">
          <div className="grid-bg-dark pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative flex items-center gap-4">
            <span className="glass-dark text-frost inline-flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold">
              {user?.displayName ? user.displayName.slice(0, 1).toUpperCase() : <UserRound className="h-6 w-6" strokeWidth={1.6} aria-hidden />}
            </span>
            <div className="min-w-0">
              <p className="text-frost truncate text-lg font-bold">{user ? (user.displayName ?? user.email) : t("guest")}</p>
              <p className="text-mist truncate text-sm">
                {user ? `${user.email ?? ""} · ${t(`roles.${user.role}`)}` : configured ? t("guestSignInHint") : t("guestHint")}
              </p>
            </div>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-2">
            {user ? (
              <form action={signOut}>
                <button type="submit" className="text-mist inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold backdrop-blur-md transition-colors hover:text-white">
                  <LogOut className="h-4 w-4" aria-hidden />
                  {ta("signOut")}
                </button>
              </form>
            ) : configured ? (
              <>
                <Link href="/auth/sign-in" className={buttonStyles("light", "md")}>
                  {ta("signIn")}
                </Link>
                <Link href="/auth/sign-up" className="text-mist inline-flex h-11 items-center rounded-full border border-white/25 bg-white/10 px-5 text-[15px] font-semibold backdrop-blur-md transition-colors hover:text-white">
                  {ta("createAccount")}
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {rows.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-4 px-5 py-4">
              <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink font-semibold">{title}</p>
                <p className="text-steel text-sm">{body}</p>
              </div>
            </li>
          ))}
          {user && (user.role === "trainer" || user.role === "admin") ? (
            <li>
              <Link href="/admin" className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <ShieldCheck className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                </span>
                <p className="text-ink flex-1 font-semibold">{t("adminPanel")}</p>
                <ChevronRight className="text-steel h-4 w-4" aria-hidden />
              </Link>
            </li>
          ) : null}
          <li>
            <Link href="/profile/settings" className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
              <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
              </span>
              <p className="text-ink flex-1 font-semibold">{tc("settings")}</p>
              <ChevronRight className="text-steel h-4 w-4" aria-hidden />
            </Link>
          </li>
        </ul>
      </Reveal>

      {user ? (
        <Reveal delay={0.14}>
          <p className="text-steel text-center text-xs">{t("syncNote")}</p>
        </Reveal>
      ) : null}
    </Container>
  );
}
