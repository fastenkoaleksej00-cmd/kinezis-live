"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { AlertTriangle, Calculator } from "lucide-react";
import { Field, Input, Select } from "@/components/admin/fields";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { calculate, type Sex } from "@/lib/health/calculator";
import { activityLevels, fitnessGoals, type ActivityLevel, type FitnessGoal } from "@/lib/profile/types";

interface GoalCalculatorProps {
  defaults: { currentKg: number | null; heightCm: number | null; age: number | null; activity: ActivityLevel | null; goal: FitnessGoal | null };
}

/** Local estimate of maintenance energy, a gentle intake range and a realistic time window. No API, no promises. */
export function GoalCalculator({ defaults }: GoalCalculatorProps) {
  const t = useTranslations("calculator");
  const th = useTranslations("health");
  const [current, setCurrent] = useState(defaults.currentKg?.toString() ?? "");
  const [target, setTarget] = useState("");
  const [height, setHeight] = useState(defaults.heightCm?.toString() ?? "");
  const [age, setAge] = useState(defaults.age?.toString() ?? "");
  const [activity, setActivity] = useState<ActivityLevel>(defaults.activity ?? "moderate");
  const [goal, setGoal] = useState<FitnessGoal | "">(defaults.goal ?? "");
  const [sex, setSex] = useState<Sex | "">("");

  const result = useMemo(() => {
    const n = (v: string) => Number(v.replace(",", "."));
    if (!current || !target || !height || !age) return null;
    return calculate({ currentKg: n(current), targetKg: n(target), heightCm: n(height), age: n(age), activity, goal: goal || null, sex: sex || null });
  }, [current, target, height, age, activity, goal, sex]);

  const missing = !current || !target || !height || !age;

  return (
    <div className="space-y-5">
      <section className="card grid gap-4 p-5 sm:grid-cols-2">
        <Field label={t("fields.current")} hint="kg">
          <Input type="number" inputMode="decimal" step="0.1" min={20} max={400} value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label={t("fields.target")} hint="kg">
          <Input type="number" inputMode="decimal" step="0.1" min={20} max={400} value={target} onChange={(e) => setTarget(e.target.value)} />
        </Field>
        <Field label={th("fields.height")} hint="cm">
          <Input type="number" inputMode="decimal" step="0.5" min={80} max={250} value={height} onChange={(e) => setHeight(e.target.value)} />
        </Field>
        <Field label={t("fields.age")}>
          <Input type="number" inputMode="numeric" min={1} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
        </Field>
        <Field label={th("fields.activity")}>
          <Select value={activity} onChange={(e) => setActivity(e.target.value as ActivityLevel)}>
            {activityLevels.map((a) => (
              <option key={a} value={a}>
                {th(`activity.${a}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={th("fields.goal")}>
          <Select value={goal} onChange={(e) => setGoal(e.target.value as FitnessGoal | "")}>
            <option value="">—</option>
            {fitnessGoals.map((g) => (
              <option key={g} value={g}>
                {th(`goals.${g}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.sex")} hint={t("fields.sexHint")} className="sm:col-span-2">
          <Select value={sex} onChange={(e) => setSex(e.target.value as Sex | "")}>
            <option value="">{t("fields.sexSkip")}</option>
            <option value="female">{t("fields.female")}</option>
            <option value="male">{t("fields.male")}</option>
          </Select>
        </Field>
      </section>

      {missing ? (
        <p className="card text-steel flex items-center gap-3 px-5 py-4 text-sm">
          <Calculator className="text-accent h-5 w-5 shrink-0" aria-hidden />
          {t("fillIn")}
        </p>
      ) : !result ? (
        <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">
          {t("invalid")}
        </p>
      ) : result.warnings.includes("minor") ? (
        <div className="flex items-start gap-3 rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] p-4 text-sm text-[#8a2f2f]">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <p>{t("warnings.minor")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: t("result.maintenance"), value: result.maintenance.low === result.maintenance.high ? `${result.maintenance.low}` : `${result.maintenance.low}–${result.maintenance.high}`, unit: "kcal" },
              { label: t("result.intake"), value: result.intake.low === result.intake.high ? `${result.intake.low}` : `${result.intake.low}–${result.intake.high}`, unit: "kcal" },
              { label: t("result.change"), value: `${result.deltaKg > 0 ? "+" : ""}${result.deltaKg}`, unit: "kg" },
              { label: t("result.time"), value: result.weeks ? `${result.weeks.fast}–${result.weeks.slow}` : "—", unit: result.weeks ? t("result.weeks") : "" },
            ].map((c) => (
              <div key={c.label} className="card px-4 py-3.5">
                <p className="text-steel text-xs font-semibold tracking-[0.12em] uppercase">{c.label}</p>
                <p className="text-ink mt-1 text-xl font-extrabold">{c.value}</p>
                <p className="text-steel text-xs">{c.unit}</p>
              </div>
            ))}
          </section>
          {result.weeks ? (
            <section className="card space-y-2 p-5">
              <p className="text-ink text-sm font-semibold">{t(`result.${result.direction}`)}</p>
              <ProgressBar percent={Math.min(100, (result.weeks.fast / result.weeks.slow) * 100)} color="bg-mint-deep" />
              <p className="text-steel text-xs">{t("result.paceNote")}</p>
            </section>
          ) : (
            <p className="card text-steel px-5 py-4 text-sm">{t("result.maintainNote")}</p>
          )}
          <p className="text-steel text-xs">
            {t("result.bmi", { now: result.bmiNow, target: result.bmiTarget })}
          </p>
          {result.warnings.filter((w) => w !== "minor").map((w) => (
            <div key={w} className="flex items-start gap-3 rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] p-4 text-sm text-[#8a2f2f]">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p>{t(`warnings.${w}`)}</p>
            </div>
          ))}
        </div>
      )}
      <p className="text-steel text-xs">{t("method")}</p>
      <p className="text-steel text-xs">{t("disclaimer")}</p>
    </div>
  );
}
