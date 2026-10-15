import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowLeft, Flame, History, Timer, Trophy } from "lucide-react";
import { ActivityCalendar } from "@/components/health/ActivityCalendar";
import { BarChart } from "@/components/health/BarChart";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { computeActivityStats } from "@/lib/health/stats";
import { deleteActivity } from "@/lib/profile/actions";
import { getMyProfile, listActivity } from "@/lib/profile/queries";

/** History of completed sessions, streaks, 12-week calendar and weekly consistency. Real log rows only. */
export default async function ActivityPage() {
  const t = await getTranslations("activity");
  const th = await getTranslations("health");
  const tn = await getTranslations("nav");
  const format = await getFormatter();
  const [profile, log] = await Promise.all([getMyProfile(), listActivity()]);

  if (!profile) {
    return (
      <Container as="section" className="max-w-[720px] space-y-6 py-6 sm:py-8">
        <SectionHeading as="h1" title={t("title")} />
        <EmptyState icon={History} title={th("signedOutTitle")} body={th("signedOutBody")} action={<Link href="/auth/sign-in" className={buttonStyles("primary", "md")}>{th("signIn")}</Link>} />
      </Container>
    );
  }

  const stats = computeActivityStats(log);
  const goalLabel = profile.fitnessGoal ? th(`goals.${profile.fitnessGoal}`) : null;

  return (
    <Container as="section" className="max-w-[860px] space-y-8 py-4 sm:py-8">
      <Reveal>
        <Link href="/profile" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("profile")}
        </Link>
        <SectionHeading as="h1" title={t("title")} lead={goalLabel ? t("leadWithGoal", { goal: goalLabel }) : t("lead")} />
      </Reveal>

      <Reveal delay={0.05} as="section" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { icon: History, label: t("cards.sessions"), value: String(stats.sessions) },
          { icon: Flame, label: t("cards.streak"), value: t("days", { count: stats.currentStreak }) },
          { icon: Trophy, label: t("cards.bestStreak"), value: t("days", { count: stats.bestStreak }) },
          { icon: Timer, label: t("cards.minutes"), value: String(stats.totalMinutes) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="card px-4 py-3.5">
            <Icon className="text-accent h-4 w-4" strokeWidth={2} aria-hidden />
            <p className="text-ink mt-2 text-2xl font-extrabold">{value}</p>
            <p className="text-steel text-xs">{label}</p>
          </div>
        ))}
      </Reveal>

      {log.length === 0 ? (
        <Reveal delay={0.1}>
          <EmptyState icon={History} title={t("emptyTitle")} body={t("emptyBody")} action={<Link href="/library" className={buttonStyles("primary", "md")}>{tn("library")}</Link>} />
        </Reveal>
      ) : (
        <>
          <Reveal delay={0.1} as="section" className="card space-y-3 p-4 sm:p-5">
            <p className="eyebrow">{t("calendar")}</p>
            <ActivityCalendar activeDays={stats.activeDays} weeks={12} label={t("calendar")} />
          </Reveal>
          <Reveal delay={0.14} as="section" className="card space-y-3 p-4 sm:p-5">
            <p className="eyebrow">{t("weekly")}</p>
            <BarChart bars={stats.weeks.map((w) => ({ label: format.dateTime(new Date(w.start), { day: "numeric", month: "short" }), value: w.count }))} ariaLabel={t("weekly")} />
          </Reveal>
          <Reveal delay={0.18} as="section" className="space-y-3">
            <SectionHeading title={t("history")} />
            <ul className="card divide-ink/8 divide-y overflow-hidden">
              {log.slice(0, 60).map((e) => (
                <li key={e.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="min-w-0 flex-1">
                    <span className="text-ink block truncate text-sm font-semibold">{e.title ?? e.itemId}</span>
                    <span className="text-steel block text-xs">
                      {format.dateTime(new Date(e.completedAt), { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
                      {e.durationMin ? ` · ${e.durationMin} min` : ""}
                    </span>
                  </span>
                  <form action={deleteActivity}>
                    <input type="hidden" name="id" value={e.id} />
                    <button type="submit" className="text-steel text-xs font-semibold hover:text-[#8a2f2f]">
                      {t("remove")}
                    </button>
                  </form>
                </li>
              ))}
            </ul>
          </Reveal>
        </>
      )}
      <Reveal delay={0.22}>
        <p className="text-steel text-xs">{t("note")}</p>
      </Reveal>
    </Container>
  );
}
