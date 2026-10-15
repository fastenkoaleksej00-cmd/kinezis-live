import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Award, ChevronRight, HeartPulse, History, LogOut, MessageCircle, Pencil, Settings, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { signOut } from "@/lib/auth/actions";
import { countMyUnread } from "@/lib/chat/queries";
import { computeActivityStats } from "@/lib/health/stats";
import { getMyProfile, listActivity } from "@/lib/profile/queries";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { getSessionUser } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const t = await getTranslations("profile");
  const ta = await getTranslations("auth");
  const tc = await getTranslations("common");
  const th = await getTranslations("health");
  const tl = await getTranslations("library");
  const tpe = await getTranslations("profileEdit");
  const sp = await searchParams;
  const [user, profile, log, unread] = await Promise.all([getSessionUser(), getMyProfile(), listActivity(), countMyUnread()]);
  const tch = await getTranslations("chat");
  const configured = getSupabaseEnv() !== null;
  const stats = computeActivityStats(log);
  const isStaff = Boolean(user && (user.role === "trainer" || user.role === "admin"));

  const badges = [
    { key: "first", earned: stats.sessions >= 1 },
    { key: "five", earned: stats.sessions >= 5 },
    { key: "twenty", earned: stats.sessions >= 20 },
    { key: "streak3", earned: stats.bestStreak >= 3 },
    { key: "streak7", earned: stats.bestStreak >= 7 },
    { key: "hour", earned: stats.totalMinutes >= 60 },
  ] as const;

  const interestLabel = (i: string) =>
    i in { kinesiotherapy: 1, yoga: 1, pilates: 1, stretching: 1, mobility: 1, back: 1 } ? tl(`categories.${i as "yoga"}`) : tpe(`interests.${i as "face"}`);

  const rows = [
    { href: "/health", icon: HeartPulse, title: t("health"), body: t("healthHint"), tone: "mint" },
    { href: "/profile/activity", icon: History, title: t("activity"), body: t("activityHint"), tone: "accent" },
    { href: "/premium", icon: Sparkles, title: t("subscription"), body: user && user.plan !== "free" ? t(`plans.${user.plan}`) : t("subscriptionFree"), tone: "mint" },
  ] as const;

  const bannerClass = profile?.bannerPreset === "mint" ? "cover cover-mint" : profile?.bannerPreset === "light" ? "cover cover-light" : "cover";

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" title={t("title")} />
      </Reveal>
      {sp.saved ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("savedNotice")}</p> : null}

      <Reveal delay={0.06}>
        <div className="card overflow-hidden">
          <div className={cn("relative h-32 sm:h-40", !profile?.bannerSrc && bannerClass)}>
            {profile?.bannerSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.bannerSrc} alt="" className="h-full w-full object-cover" style={{ objectPosition: `50% ${profile.bannerPosition}%` }} />
            ) : null}
            {user ? (
              <Link href="/profile/edit" className="absolute top-3 right-3 z-10 inline-flex h-9 items-center gap-2 rounded-full border border-white/40 bg-ink/50 px-3 text-xs font-semibold text-white backdrop-blur-md">
                <Pencil className="h-3.5 w-3.5" aria-hidden />
                {t("edit")}
              </Link>
            ) : null}
          </div>
          <div className="px-5 pb-5">
            <div className="-mt-9 flex items-end gap-4">
              <span className="section-deep text-frost inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white text-2xl font-bold shadow-[var(--shadow-card)]">
                {profile?.avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarSrc} alt="" className="h-full w-full object-cover" />
                ) : user?.displayName ? (
                  user.displayName.slice(0, 1).toUpperCase()
                ) : (
                  <UserRound className="h-7 w-7" strokeWidth={1.6} aria-hidden />
                )}
              </span>
            </div>
            <div className="mt-3 min-w-0">
              <p className="text-ink truncate text-xl font-extrabold">{user ? (user.displayName ?? user.email) : t("guest")}</p>
              <p className="text-steel truncate text-sm">{user ? `${user.email ?? ""} · ${t(`roles.${user.role}`)}` : configured ? t("guestSignInHint") : t("guestHint")}</p>
              {profile?.bio ? <p className="text-text mt-3 text-[15px] leading-relaxed">{profile.bio}</p> : null}
              {profile && (profile.fitnessGoal || profile.interests.length > 0) ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {profile.fitnessGoal ? <li className="bg-mint-soft text-mint-deep rounded-full px-3 py-1 text-xs font-semibold">{th(`goals.${profile.fitnessGoal}`)}</li> : null}
                  {profile.interests.map((i) => (
                    <li key={i} className="bg-frost text-steel rounded-full px-3 py-1 text-xs font-semibold">
                      {interestLabel(i)}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            {!user && configured ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href="/auth/sign-in" className={buttonStyles("primary", "md")}>
                  {ta("signIn")}
                </Link>
                <Link href="/auth/sign-up" className={buttonStyles("secondary", "md")}>
                  {ta("createAccount")}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </Reveal>

      {user ? (
        <Reveal delay={0.1} as="section" className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: t("stats.sessions"), value: String(stats.sessions) },
              { label: t("stats.streak"), value: String(stats.currentStreak) },
              { label: t("stats.minutes"), value: String(stats.totalMinutes) },
            ].map((s) => (
              <Link key={s.label} href="/profile/activity" className="card px-4 py-3.5 transition-[transform] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
                <p className="text-ink text-2xl font-extrabold">{s.value}</p>
                <p className="text-steel text-xs">{s.label}</p>
              </Link>
            ))}
          </div>
          {stats.sessions === 0 ? <p className="text-steel text-xs">{t("noStats")}</p> : null}
          <div className="card p-4">
            <p className="eyebrow mb-3">{t("achievements")}</p>
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {badges.map((b) => (
                <li key={b.key} className={cn("flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center", b.earned ? "bg-mint-soft" : "bg-bone")}>
                  <Award className={cn("h-5 w-5", b.earned ? "text-mint-deep" : "text-mist-2")} strokeWidth={1.9} aria-hidden />
                  <span className={cn("text-[11px] leading-tight font-semibold", b.earned ? "text-ink" : "text-steel")}>{t(`badges.${b.key}`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={0.14}>
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {rows.map(({ href, icon: Icon, title, body, tone }) => (
            <li key={href}>
              <Link href={href} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                <span className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full", tone === "mint" ? "bg-mint-soft text-mint-deep" : "bg-accent-soft text-accent")}>
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-ink font-semibold">{title}</p>
                  <p className="text-steel text-sm">{body}</p>
                </div>
                <ChevronRight className="text-steel h-4 w-4" aria-hidden />
              </Link>
            </li>
          ))}
          <li>
            <Link href="/messages" className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
              <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink font-semibold">{tch("title")}</p>
                <p className="text-steel text-sm">{unread > 0 ? tch("unreadCount", { count: unread }) : tch("lead")}</p>
              </div>
              {unread > 0 ? <span className="bg-accent inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white">{unread}</span> : null}
              <ChevronRight className="text-steel h-4 w-4" aria-hidden />
            </Link>
          </li>
          {isStaff ? (
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
        <Reveal delay={0.18} className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-steel text-xs">{t("syncNote")}</p>
          <form action={signOut}>
            <button type="submit" className={buttonStyles("ghost", "sm")}>
              <LogOut className="h-4 w-4" aria-hidden />
              {ta("signOut")}
            </button>
          </form>
        </Reveal>
      ) : null}
    </Container>
  );
}
