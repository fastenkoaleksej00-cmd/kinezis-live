"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { deleteMealPlan, saveMealPlan, type AdminState } from "@/lib/admin/actions";
import type { AuthorRow, MealPlanRow } from "@/lib/content/db";
import { mealSlots } from "@/lib/content/types";
import { Checkbox, Field, Input, LocalizedInputs, Select } from "./fields";
import { SubmitRow } from "./SubmitRow";

interface MealPlanFormProps {
  plan?: MealPlanRow | null;
  authors: AuthorRow[];
}

const initial: AdminState = {};

export function MealPlanForm({ plan, authors }: MealPlanFormProps) {
  const t = useTranslations("admin");
  const tn = useTranslations("nutrition");
  const [state, action, pending] = useActionState(saveMealPlan, initial);
  const meal = (slot: string) => plan?.meals.find((m) => m.slot === slot)?.text;

  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      {plan ? <input type="hidden" name="id" value={plan.id} /> : null}
      {plan?.published_at ? <input type="hidden" name="published_at_prev" value={plan.published_at} /> : null}

      <section className="card space-y-5 p-5">
        <LocalizedInputs name="title" label={t("fields.title")} value={plan?.title} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.planDate")}>
            <Input name="plan_date" type="date" defaultValue={plan?.plan_date ?? ""} />
          </Field>
          <Field label={t("fields.slug")} hint={t("fields.slugHint")}>
            <Input name="slug" defaultValue={plan?.slug ?? ""} pattern="[a-z0-9-]*" />
          </Field>
        </div>
      </section>

      <section className="card space-y-6 p-5">
        <p className="text-steel text-xs">{t("fields.mealsHint")}</p>
        {mealSlots.map((slot) => (
          <LocalizedInputs key={slot} name={`meal_${slot}`} label={tn(`slots.${slot}`)} value={meal(slot)} multiline />
        ))}
        <LocalizedInputs name="notes" label={t("fields.notes")} value={plan?.notes} multiline />
      </section>

      <section className="card grid gap-5 p-5 sm:grid-cols-3">
        <Field label={t("fields.author")}>
          <Select name="author_id" defaultValue={plan?.author_id ?? authors[0]?.id ?? ""}>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.language")}>
          <Select name="language" defaultValue={plan?.language ?? "uk"}>
            <option value="uk">Українська</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="ru">Русский</option>
          </Select>
        </Field>
        <Field label={t("fields.access")}>
          <Select name="access" defaultValue={plan?.access ?? "free"}>
            <option value="free">{t("access.free")}</option>
            <option value="premium">{t("access.premium")}</option>
          </Select>
        </Field>
      </section>

      <section className="card p-5">
        <Checkbox name="published" label={t("fields.published")} defaultChecked={plan?.published ?? false} />
        <p className="text-steel mt-1.5 text-xs">{t("fields.publishedHint")}</p>
      </section>

      <SubmitRow pending={pending} error={state.error} deleteAction={plan ? deleteMealPlan : undefined} id={plan?.id} />
    </form>
  );
}
