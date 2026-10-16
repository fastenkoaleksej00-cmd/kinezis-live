import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ActivityRing } from "@/components/health/ActivityRing";
import { CountUp } from "@/components/ui/CountUp";
import type { ActivityStats } from "@/lib/health/stats";

interface TodayRingsProps {
  stats: ActivityStats;
  /** Personal weekly targets from the profile (defaults 3 sessions / 60 minutes) */
  sessionsTarget: number;
  minutesTarget: number;
}

export async function TodayRings({ stats, sessionsTarget, minutesTarget }: TodayRingsProps) {
  const t = await getTranslations("home.rings");
  const thisWeek = stats.weeks[stats.weeks.length - 1]?.count ?? 0;
  const weekMinutes = stats.weekMinutes;
  const rings = [
    { key: "sessions", value: thisWeek / sessionsTarget, color: "var(--color-mint-deep)", big: `${thisWeek}`, small: `/ ${sessionsTarget}` },
    { key: "minutes", value: weekMinutes / minutesTarget, color: "var(--color-accent)", big: `${weekMinutes}`, small: `/ ${minutesTarget}` },
    { key: "streak", value: Math.min(1, stats.currentStreak / 7), color: "#e8a24a", big: `${stats.currentStreak}`, small: t("days") },
  ] as const;

  return (
    <Link href="/profile/activity" className="card block p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="eyebrow">{t("title")}</p>
        <span className="text-steel text-xs">{t("open")}</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {rings.map((r) => (
          <div key={r.key} className="flex flex-col items-center gap-2">
            <ActivityRing
              value={r.value}
              size={88}
              stroke={10}
              color={r.color}
              label={t(r.key)}
              center={
                <span className="text-center leading-none">
                  <span className="text-ink block text-xl font-extrabold"><CountUp value={Number(r.big)} /></span>
                  <span className="text-steel mt-0.5 block text-[0.6875rem] font-semibold">{r.small}</span>
                </span>
              }
            />
            <span className="text-steel text-xs font-semibold">{t(r.key)}</span>
          </div>
        ))}
      </div>
    </Link>
  );
}
