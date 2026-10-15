"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Check, Target } from "lucide-react";
import { Field, Input } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { updateGoal, type ProfileState } from "@/lib/profile/actions";
import { primaryGoals, type PrimaryGoal, type UserProfile } from "@/lib/profile/types";
import { cn } from "@/lib/utils";

const initial: ProfileState = {};

/** Choose the one goal shown on Home. Weight goals need a target; weekly goals reuse the ring targets. */
export function GoalPicker({ profile, currentKg }: { profile: UserProfile; currentKg: number | null }) {
  const t = useTranslations("goal");
  const [goal, setGoal] = useState<PrimaryGoal>(profile.primaryGoal ?? "sessions");
  const [state, action, pending] = useActionState(updateGoal, initial);

  return (
    <form action={action} className="card space-y-4 p-5" aria-busy={pending}>
      <div className="flex items-center gap-3">
        <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
          <Target className="h-5 w-5" strokeWidth={1.8} aria-hidden />
        </span>
        <div>
          <p className="text-ink font-bold">{t("pickerTitle")}</p>
          <p className="text-steel text-sm">{t("pickerLead")}</p>
        </div>
      </div>
      <input type="hidden" name="primary_goal" value={goal} />
      <div className="flex flex-wrap gap-2">
        {primaryGoals.map((g) => (
          <button key={g} type="button" aria-pressed={goal === g} onClick={() => setGoal(g)} className={cn("inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold transition-colors", goal === g ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
            {t(`types.${g}`)}
          </button>
        ))}
      </div>
      <p className="text-steel text-sm">{t(`descriptions.${goal}`)}</p>
      {goal === "weight" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t("fields.currentKg")} hint="kg">
            <Input type="number" inputMode="decimal" step="0.1" value={currentKg ?? ""} readOnly disabled placeholder="—" />
          </Field>
          <Field label={t("fields.targetKg")} hint="kg">
            <Input name="target_weight_kg" type="number" inputMode="decimal" step="0.1" min={20} max={400} defaultValue={profile.targetWeightKg ?? ""} required />
          </Field>
          {currentKg === null ? <p className="text-steel text-xs sm:col-span-2">{t("fields.needWeight")}</p> : null}
        </div>
      ) : null}
      {goal === "sessions" ? (
        <Field label={t("fields.sessionsPerWeek")}>
          <Input name="weekly_sessions_target" type="number" min={1} max={14} defaultValue={profile.weeklySessionsTarget} />
        </Field>
      ) : null}
      {goal === "minutes" ? (
        <Field label={t("fields.minutesPerWeek")}>
          <Input name="weekly_minutes_target" type="number" min={10} max={1500} step={10} defaultValue={profile.weeklyMinutesTarget} />
        </Field>
      ) : null}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="md" disabled={pending}>
          <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
          {t("save")}
        </Button>
        {state.ok ? <p className="text-mint-deep text-sm font-semibold">{t("saved")}</p> : null}
        {state.error ? <p className="text-sm text-[#8a2f2f]">{t(`errors.${state.error === "invalid" ? "invalid" : "generic"}`)}</p> : null}
      </div>
      <p className="text-steel text-xs">{t("pickerNote")}</p>
    </form>
  );
}
