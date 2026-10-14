"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { deleteWorkout, saveWorkout, type AdminState } from "@/lib/admin/actions";
import type { AuthorRow, WorkoutRow } from "@/lib/content/db";
import { categoryIds, goals, levels } from "@/lib/content/types";
import { Checkbox, Field, Input, LocalizedInputs, Select } from "./fields";
import { SubmitRow } from "./SubmitRow";
import { VideoField } from "./VideoField";

interface WorkoutFormProps {
  workout?: WorkoutRow | null;
  authors: AuthorRow[];
}

const initial: AdminState = {};

export function WorkoutForm({ workout, authors }: WorkoutFormProps) {
  const t = useTranslations("admin");
  const tl = useTranslations("library");
  const [state, action, pending] = useActionState(saveWorkout, initial);
  const video = workout?.video ?? null;

  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      {workout ? <input type="hidden" name="id" value={workout.id} /> : null}
      {workout?.published_at ? <input type="hidden" name="published_at_prev" value={workout.published_at} /> : null}

      <section className="card space-y-5 p-5">
        <LocalizedInputs name="title" label={t("fields.title")} value={workout?.title} required />
        <LocalizedInputs name="description" label={t("fields.description")} value={workout?.description} multiline />
        <Field label={t("fields.slug")} hint={t("fields.slugHint")}>
          <Input name="slug" defaultValue={workout?.slug ?? ""} pattern="[a-z0-9-]*" />
        </Field>
      </section>

      <section className="card grid gap-5 p-5 sm:grid-cols-2">
        <Field label={t("fields.category")}>
          <Select name="category" defaultValue={workout?.category ?? "kinesiotherapy"}>
            {categoryIds.map((c) => (
              <option key={c} value={c}>
                {tl(`categories.${c}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.duration")}>
          <Input name="duration_min" type="number" min={1} max={240} defaultValue={workout?.duration_min ?? 15} required />
        </Field>
        <Field label={t("fields.level")}>
          <Select name="level" defaultValue={workout?.level ?? "beginner"}>
            {levels.map((l) => (
              <option key={l} value={l}>
                {tl(`levels.${l}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.author")}>
          <Select name="author_id" defaultValue={workout?.author_id ?? authors[0]?.id ?? ""}>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <fieldset className="sm:col-span-2">
          <legend className="eyebrow mb-2.5">{t("fields.goals")}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {goals.map((g) => (
              <Checkbox key={g} name={`goal_${g}`} label={tl(`goals.${g}`)} defaultChecked={workout?.goals?.includes(g) ?? false} />
            ))}
          </div>
        </fieldset>
        <Field label={t("fields.language")} hint={t("fields.languageHint")}>
          <Select name="language" defaultValue={workout?.language ?? "uk"}>
            <option value="uk">Українська</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </Select>
        </Field>
        <Field label={t("fields.coverTone")}>
          <Select name="cover_tone" defaultValue={workout?.cover_tone ?? "deep"}>
            <option value="deep">{t("tones.deep")}</option>
            <option value="light">{t("tones.light")}</option>
            <option value="mint">{t("tones.mint")}</option>
          </Select>
        </Field>
        <Field label={t("fields.access")} hint={t("fields.accessHint")}>
          <Select name="access" defaultValue={workout?.access ?? "free"}>
            <option value="free">{t("access.free")}</option>
            <option value="premium">{t("access.premium")}</option>
          </Select>
        </Field>
      </section>

      <VideoField folder="workouts" value={video} />

      <section className="card p-5">
        <Checkbox name="published" label={t("fields.published")} defaultChecked={workout?.published ?? false} />
        <p className="text-steel mt-1.5 text-xs">{t("fields.publishedHint")}</p>
      </section>

      <SubmitRow pending={pending} error={state.error} deleteAction={workout ? deleteWorkout : undefined} id={workout?.id} />
    </form>
  );
}
