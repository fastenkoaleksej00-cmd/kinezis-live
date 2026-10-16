import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Target } from "lucide-react";
import { ActivityRing } from "@/components/health/ActivityRing";
import { CountUp } from "@/components/ui/CountUp";
import type { ActivityStats } from "@/lib/health/stats";
import type { ActivityEntry, Measurement, UserProfile } from "@/lib/profile/types";

interface GoalWidgetProps {
  profile: UserProfile;
  stats: ActivityStats;
  log: ActivityEntry[];
  measurements: Measurement[];
}

/** "My goal" on Home: one ring for the goal the member chose. Numbers come only from their own entries. */
export async function GoalWidget({ profile, stats, log, measurements }: GoalWidgetProps) {
  const t = await getTranslations("goal");
  const goal = profile.primaryGoal;

  if (!goal) {
    return (
      <Link href="/health/calculator" className="card flex items-center gap-4 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
        <span className="bg-mint-soft text-mint-deep inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
          <Target className="h-5 w-5" strokeWidth={1.8} aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-ink block font-bold">{t("pickTitle")}</span>
          <span className="text-steel block text-sm">{t("pickBody")}</span>
        </span>
        <ArrowRight className="text-steel h-4 w-4" aria-hidden />
      </Link>
    );
  }

  let value = 0;
  let big = "0";
  let small = "";
  let note = "";
  const thisWeek = stats.weeks[stats.weeks.length - 1]?.count ?? 0;

  if (goal === "sessions") {
    value = thisWeek / profile.weeklySessionsTarget;
    big = String(thisWeek);
    small = `/ ${profile.weeklySessionsTarget}`;
    note = t("notes.sessions", { count: Math.max(0, profile.weeklySessionsTarget - thisWeek) });
  } else if (goal === "minutes") {
    value = stats.weekMinutes / profile.weeklyMinutesTarget;
    big = String(stats.weekMinutes);
    small = `/ ${profile.weeklyMinutesTarget}`;
    note = t("notes.minutes", { count: Math.max(0, profile.weeklyMinutesTarget - stats.weekMinutes) });
  } else if (goal === "breath") {
    const monday = new Date();
    monday.setHours(0, 0, 0, 0);
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const days = new Set(log.filter((e) => e.itemType === "breath" && new Date(e.completedAt) >= monday).map((e) => e.completedAt.slice(0, 10)));
    value = days.size / 7;
    big = String(days.size);
    small = "/ 7";
    note = days.size >= 7 ? t("notes.breathDone") : t("notes.breath");
  } else {
    const withWeight = measurements.filter((m) => m.weightKg !== null);
    const first = withWeight[0]?.weightKg ?? null;
    const last = withWeight[withWeight.length - 1]?.weightKg ?? null;
    const target = profile.targetWeightKg;
    if (first === null || last === null || target === null) {
      value = 0;
      big = "—";
      note = t("notes.weightNeeds");
    } else {
      const total = first - target;
      const done = first - last;
      value = total === 0 ? 1 : Math.max(0, Math.min(1, done / total));
      big = String(last);
      small = `→ ${target} kg`;
      const left = Math.round(Math.abs(last - target) * 10) / 10;
      note = left === 0 ? t("notes.weightDone") : t("notes.weight", { kg: left });
    }
  }

  return (
    <Link href="/health/calculator" className="card flex items-center gap-4 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 sm:p-5">
      <ActivityRing
        value={value}
        size={84}
        stroke={10}
        label={t(`types.${goal}`)}
        center={
          <span className="text-center leading-none">
            <span className="text-ink block text-lg font-extrabold">{Number.isFinite(Number(big)) && big !== "—" ? <CountUp value={Number(big)} /> : big}</span>
            {small ? <span className="text-steel mt-0.5 block text-[0.6875rem] font-semibold">{small}</span> : null}
          </span>
        }
      />
      <span className="min-w-0 flex-1">
        <span className="eyebrow mb-1 block">{t("eyebrow")}</span>
        <span className="text-ink block font-bold">{t(`types.${goal}`)}</span>
        <span className="text-steel block text-sm">{note}</span>
        {goal === "weight" ? <span className="text-steel mt-1 block text-xs">{t("approx")}</span> : null}
      </span>
      <ArrowRight className="text-steel h-4 w-4 shrink-0" aria-hidden />
    </Link>
  );
}
