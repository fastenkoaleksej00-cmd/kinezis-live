"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { Check, Trash2 } from "lucide-react";
import { Field, Input, Select, Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { addMeasurement, deleteMeasurement, updateHealthProfile, type ProfileState } from "@/lib/profile/actions";
import { activityLevels, experienceLevels, fitnessGoals, type Measurement, type UserProfile } from "@/lib/profile/types";

const initial: ProfileState = {};

function Notice({ state }: { state: ProfileState }) {
  const t = useTranslations("health");
  if (state.ok) return <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("saved")}</p>;
  if (state.error) return <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">{t(`errors.${state.error}`)}</p>;
  return null;
}

export function HealthProfileForm({ profile }: { profile: UserProfile }) {
  const t = useTranslations("health");
  const [state, action, pending] = useActionState(updateHealthProfile, initial);
  return (
    <form action={action} className="card grid gap-5 p-5 sm:grid-cols-2" aria-busy={pending}>
      <Field label={t("fields.height")} hint="cm">
        <Input name="height_cm" type="number" inputMode="decimal" step="0.5" min={80} max={250} defaultValue={profile.heightCm ?? ""} />
      </Field>
      <Field label={t("fields.birthDate")} hint={t("fields.optional")}>
        <Input name="birth_date" type="date" defaultValue={profile.birthDate ?? ""} />
      </Field>
      <Field label={t("fields.goal")}>
        <Select name="fitness_goal" defaultValue={profile.fitnessGoal ?? ""}>
          <option value="">—</option>
          {fitnessGoals.map((g) => (
            <option key={g} value={g}>
              {t(`goals.${g}`)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("fields.activity")}>
        <Select name="activity_level" defaultValue={profile.activityLevel ?? ""}>
          <option value="">—</option>
          {activityLevels.map((a) => (
            <option key={a} value={a}>
              {t(`activity.${a}`)}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={t("fields.weeklySessions")} hint={t("fields.weeklyHint")}>
        <Input name="weekly_sessions_target" type="number" min={1} max={14} defaultValue={profile.weeklySessionsTarget} />
      </Field>
      <Field label={t("fields.weeklyMinutes")} hint={t("fields.weeklyHint")}>
        <Input name="weekly_minutes_target" type="number" min={10} max={1500} step={10} defaultValue={profile.weeklyMinutesTarget} />
      </Field>
      <Field label={t("fields.experience")}>
        <Select name="experience" defaultValue={profile.experience ?? ""}>
          <option value="">—</option>
          {experienceLevels.map((e) => (
            <option key={e} value={e}>
              {t(`experience.${e}`)}
            </option>
          ))}
        </Select>
      </Field>
      <div className="flex items-end">
        <Button type="submit" size="md" disabled={pending}>
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          {t("save")}
        </Button>
      </div>
      <div className="sm:col-span-2">
        <Notice state={state} />
      </div>
    </form>
  );
}

export function MeasurementForm() {
  const t = useTranslations("health");
  const [state, action, pending] = useActionState(addMeasurement, initial);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="card grid gap-4 p-5 sm:grid-cols-4" aria-busy={pending}>
      <Field label={t("fields.date")}>
        <Input name="measured_on" type="date" defaultValue={today} max={today} required />
      </Field>
      <Field label={t("fields.weight")} hint="kg">
        <Input name="weight_kg" type="number" inputMode="decimal" step="0.1" min={20} max={400} />
      </Field>
      <Field label={t("fields.waist")} hint={`cm · ${t("fields.optional")}`}>
        <Input name="waist_cm" type="number" inputMode="decimal" step="0.5" min={30} max={250} />
      </Field>
      <div className="flex items-end">
        <Button type="submit" size="md" disabled={pending} className="w-full">
          {t("addMeasurement")}
        </Button>
      </div>
      <Field label={t("fields.note")} hint={t("fields.optional")} className="sm:col-span-4">
        <Textarea name="note" rows={2} maxLength={200} />
      </Field>
      <div className="sm:col-span-4">
        <Notice state={state} />
      </div>
    </form>
  );
}

export function MeasurementRow({ m, dateLabel }: { m: Measurement; dateLabel: string }) {
  const t = useTranslations("health");
  return (
    <li className="flex items-center gap-4 px-5 py-3.5">
      <span className="min-w-0 flex-1">
        <span className="text-ink block text-sm font-semibold">{dateLabel}</span>
        <span className="text-steel block text-xs">
          {m.weightKg !== null ? `${m.weightKg} kg` : ""}
          {m.weightKg !== null && m.waistCm !== null ? " · " : ""}
          {m.waistCm !== null ? `${t("fields.waist")} ${m.waistCm} cm` : ""}
          {m.note ? ` · ${m.note}` : ""}
        </span>
      </span>
      <form action={deleteMeasurement}>
        <input type="hidden" name="id" value={m.id} />
        <button type="submit" aria-label={t("delete")} className="text-steel inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#fdf2f2] hover:text-[#8a2f2f]">
          <Trash2 className="h-4 w-4" aria-hidden />
        </button>
      </form>
    </li>
  );
}
