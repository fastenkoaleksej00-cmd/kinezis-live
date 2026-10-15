import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowUpRight, Calculator, HeartPulse, Scale, Watch, Wind } from "lucide-react";
import { WaterWidget } from "@/components/home/WaterWidget";
import { SourceBadge, type DataSource } from "@/components/health/SourceBadge";
import { HealthProfileForm, MeasurementForm, MeasurementRow } from "@/components/health/HealthForms";
import { LineChart } from "@/components/health/LineChart";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { ageFromBirthDate, bmi, computeActivityStats, filterByPeriod, latestWeight, type Period } from "@/lib/health/stats";
import { getMyProfile, listActivity, listMeasurements } from "@/lib/profile/queries";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const periods: Period[] = ["week", "month", "quarter", "year"];

/** Private health dashboard. Only the owner can read these rows (RLS); nothing here is shown to other users. */
export default async function HealthPage({ searchParams }: PageProps) {
  const t = await getTranslations("health");
  const tn = await getTranslations("nav");
  const format = await getFormatter();
  const sp = await searchParams;
  const period: Period = periods.includes(sp.period as Period) ? (sp.period as Period) : "month";
  const [profile, measurements, log] = await Promise.all([getMyProfile(), listMeasurements(), listActivity()]);

  if (!profile) {
    return (
      <Container as="section" className="max-w-[720px] space-y-6 py-6 sm:py-8">
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
        <EmptyState
          icon={HeartPulse}
          title={t("signedOutTitle")}
          body={t("signedOutBody")}
          action={
            <Link href="/auth/sign-in" className={buttonStyles("primary", "md")}>
              {t("signIn")}
            </Link>
          }
        />
      </Container>
    );
  }

  const latest = latestWeight(measurements);
  const index = bmi(latest?.weightKg ?? null, profile.heightCm);
  const age = ageFromBirthDate(profile.birthDate);
  const inPeriod = filterByPeriod(measurements, period);
  const weightPoints = inPeriod.filter((m) => m.weightKg !== null).map((m) => ({ date: m.measuredOn, value: m.weightKg as number }));
  const waistPoints = inPeriod.filter((m) => m.waistCm !== null).map((m) => ({ date: m.measuredOn, value: m.waistCm as number }));
  const dateLabel = (iso: string) => format.dateTime(new Date(iso), { day: "numeric", month: "short", year: "numeric" });
  const stats = computeActivityStats(log);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMinutes = log.filter((e) => e.completedAt.slice(0, 10) === todayKey).reduce((n, e) => n + (e.durationMin ?? 0), 0);
  const cards: Array<{ label: string; value: string; sub: string; source: DataSource }> = [
    { label: t("cards.weight"), value: latest?.weightKg !== undefined && latest?.weightKg !== null ? `${latest.weightKg} kg` : "—", sub: latest ? dateLabel(latest.measuredOn) : t("cards.noData"), source: latest ? "manual" : "none" },
    { label: t("cards.height"), value: profile.heightCm ? `${profile.heightCm} cm` : "—", sub: profile.heightCm ? "" : t("cards.noData"), source: profile.heightCm ? "manual" : "none" },
    { label: t("cards.targetWeight"), value: profile.targetWeightKg ? `${profile.targetWeightKg} kg` : "—", sub: profile.targetWeightKg ? (latest?.weightKg ? t("cards.toGo", { kg: Math.round(Math.abs(latest.weightKg - profile.targetWeightKg) * 10) / 10 }) : "") : t("cards.setGoal"), source: profile.targetWeightKg ? "manual" : "none" },
    { label: t("cards.bmi"), value: index !== null ? String(index) : "—", sub: index !== null ? t("cards.bmiNote") : t("cards.bmiNeeds"), source: index !== null ? "calculated" : "none" },
    { label: t("cards.today"), value: `${todayMinutes} min`, sub: t("cards.todaySub"), source: "app" },
    { label: t("cards.week"), value: `${stats.weekMinutes} min`, sub: t("cards.weekSub", { count: stats.weeks[stats.weeks.length - 1]?.count ?? 0 }), source: "app" },
    { label: t("cards.streak"), value: `${stats.currentStreak}`, sub: t("cards.streakSub"), source: "app" },
    { label: t("cards.age"), value: age !== null ? String(age) : "—", sub: age !== null ? "" : t("fields.optional"), source: age !== null ? "manual" : "none" },
  ];

  return (
    <Container as="section" className="max-w-[860px] space-y-8 py-4 sm:py-8">
      <Reveal>
        <Link href="/profile" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("profile")}
        </Link>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>

      <Reveal delay={0.05} as="section" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => (
          <div key={c.label} className="card px-4 py-3.5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-steel text-[11px] font-semibold tracking-[0.12em] uppercase">{c.label}</p>
              <SourceBadge source={c.source} />
            </div>
            <p className="text-ink mt-1 text-2xl font-extrabold">{c.value}</p>
            {c.sub ? <p className="text-steel mt-0.5 text-xs">{c.sub}</p> : null}
          </div>
        ))}
      </Reveal>

      <Reveal delay={0.06} as="section" className="grid gap-3 sm:grid-cols-2">
        <WaterWidget id="water" variant="full" />
        <Link href="/health/connect" className="card group flex flex-col justify-between gap-4 p-5 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
          <div className="flex items-start justify-between gap-3">
            <span className="bg-[#fde8ea] text-[#b9344a] inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Watch className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 transition-colors" aria-hidden />
          </div>
          <div>
            <p className="text-ink font-bold">{t("connectTitle")}</p>
            <p className="text-steel mt-1 text-sm">{t("connectBody")}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {(["steps", "distance", "heartRate", "sleep"] as const).map((k) => (
                <li key={k} className="bg-bone-2 text-steel inline-flex h-6 items-center rounded-full px-2.5 text-[11px] font-semibold">
                  {t(`pending.${k}`)}
                </li>
              ))}
            </ul>
            <p className="text-steel mt-3 text-xs">{t("connectStatus")}</p>
          </div>
        </Link>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="text-steel text-xs">{t("disclaimer")}</p>
      </Reveal>

      <Reveal delay={0.09}>
        <Link href="/health/calculator" className="card group flex items-center gap-4 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
          <span className="bg-mint-soft text-mint-deep inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
            <Calculator className="h-5 w-5" strokeWidth={1.8} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-ink block font-bold">{t("calculatorTitle")}</span>
            <span className="text-steel block text-sm">{t("calculatorBody")}</span>
          </span>
          <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 transition-colors" aria-hidden />
        </Link>
      </Reveal>

      <Reveal delay={0.095}>
        <Link href="/breathe" className="card group flex items-center gap-4 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
          <span className="bg-mint-soft text-mint-deep inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
            <Wind className="h-5 w-5" strokeWidth={1.8} aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="text-ink block font-bold">{t("breatheTitle")}</span>
            <span className="text-steel block text-sm">{t("breatheBody")}</span>
          </span>
          <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 transition-colors" aria-hidden />
        </Link>
      </Reveal>

      <Reveal delay={0.1} as="section" className="space-y-3">
        <SectionHeading title={t("profileTitle")} lead={t("profileLead")} />
        <HealthProfileForm profile={profile} />
      </Reveal>

      <Reveal delay={0.14} as="section" className="space-y-3">
        <SectionHeading title={t("measurementsTitle")} lead={t("measurementsLead")} />
        <MeasurementForm />
      </Reveal>

      <Reveal delay={0.18} as="section" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-ink text-xl font-bold">{t("chartsTitle")}</h2>
          <div className="scroll-row flex gap-2 overflow-x-auto">
            {periods.map((p) => (
              <Link
                key={p}
                href={`/health?period=${p}`}
                scroll={false}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors",
                  p === period ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white",
                )}
              >
                {t(`periods.${p}`)}
              </Link>
            ))}
          </div>
        </div>

        {measurements.length === 0 ? (
          <EmptyState icon={Scale} illustration="measurements" title={t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          <div className="space-y-4">
            <div className="card p-4 sm:p-5">
              <p className="eyebrow mb-3">{t("fields.weight")} · kg</p>
              {weightPoints.length >= 2 ? <LineChart points={weightPoints} unit="kg" label={t("chartWeightLabel")} /> : <p className="text-steel text-sm">{t("notEnough", { count: 2 })}</p>}
            </div>
            {waistPoints.length > 0 ? (
              <div className="card p-4 sm:p-5">
                <p className="eyebrow mb-3">{t("fields.waist")} · cm</p>
                {waistPoints.length >= 2 ? <LineChart points={waistPoints} unit="cm" label={t("chartWaistLabel")} color="#3f8f80" /> : <p className="text-steel text-sm">{t("notEnough", { count: 2 })}</p>}
              </div>
            ) : null}
            <ul className="card divide-ink/8 divide-y overflow-hidden">
              {[...measurements].reverse().map((m) => (
                <MeasurementRow key={m.id} m={m} dateLabel={dateLabel(m.measuredOn)} />
              ))}
            </ul>
          </div>
        )}
      </Reveal>

    </Container>
  );
}
