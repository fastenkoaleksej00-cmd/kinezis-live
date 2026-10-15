"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { deleteLesson, saveLesson, type AdminState } from "@/lib/admin/actions";
import type { LessonRow, ModuleRow } from "@/lib/content/db";
import { Field, Input, LocalizedInputs, Select, Textarea } from "./fields";
import { SubmitRow } from "./SubmitRow";
import { VideoField } from "./VideoField";

interface LessonFormProps {
  /** Published library sessions a programme step can reuse */
  workouts?: Array<{ id: string; title: string }>;
  courseId: string;
  modules: ModuleRow[];
  lesson?: LessonRow | null;
  defaultModuleId?: string;
}

const initial: AdminState = {};

function lines(list: Array<{ en?: string; uk?: string; de?: string; ru?: string }> | undefined, code: "en" | "uk" | "de" | "ru"): string {
  return (list ?? []).map((s) => s[code] ?? "").join("\n");
}

export function LessonForm({ courseId, modules, lesson, defaultModuleId, workouts = [] }: LessonFormProps) {
  const t = useTranslations("admin");
  const [state, action, pending] = useActionState(saveLesson, initial);
  const video = lesson?.video ?? null;

  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      <input type="hidden" name="course_id" value={courseId} />
      {lesson ? <input type="hidden" name="id" value={lesson.id} /> : null}

      <section className="card space-y-5 p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.module")}>
            <Select name="module_id" defaultValue={lesson?.module_id ?? defaultModuleId ?? modules[0]?.id ?? ""} required>
              {modules.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title.en}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t("fields.position")} hint={t("fields.positionHint")}>
            <Input name="position" type="number" min={0} defaultValue={lesson?.position ?? 0} />
          </Field>
        </div>
        <LocalizedInputs name="title" label={t("fields.title")} value={lesson?.title} required />
        <LocalizedInputs name="summary" label={t("fields.summary")} value={lesson?.summary} multiline />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.slug")} hint={t("fields.slugHint")}>
            <Input name="slug" defaultValue={lesson?.slug ?? ""} pattern="[a-z0-9-]*" />
          </Field>
          <Field label={t("fields.duration")}>
            <Input name="duration_min" type="number" min={1} max={240} defaultValue={lesson?.duration_min ?? ""} />
          </Field>
        </div>
      </section>

      {workouts.length > 0 ? (
        <section className="card space-y-2 p-5">
          <Field label={t("fields.linkedSession")} hint={t("fields.linkedSessionHint")}>
            <Select name="workout_id" defaultValue={lesson?.workout_id ?? ""}>
              <option value="">—</option>
              {workouts.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title}
                </option>
              ))}
            </Select>
          </Field>
        </section>
      ) : null}

      <VideoField folder="lessons" value={video} />

      <section className="card space-y-5 p-5">
        <fieldset className="space-y-2.5">
          <legend className="eyebrow mb-1">{t("fields.routineSteps")}</legend>
          <p className="text-steel text-xs">{t("fields.stepsHint")}</p>
          {(["en", "uk", "de", "ru"] as const).map((code) => (
            <div key={code} className="flex items-start gap-2.5">
              <span className="text-steel mt-3.5 w-7 shrink-0 text-[11px] font-bold tracking-wider uppercase">{code}</span>
              <Textarea name={`routine_${code}`} defaultValue={lines(lesson?.routine, code)} rows={4} lang={code} aria-label={`${t("fields.routineSteps")} (${code})`} />
            </div>
          ))}
        </fieldset>
        <LocalizedInputs name="recommendations" label={t("fields.recommendations")} value={lesson?.recommendations} multiline />
        <Field label={t("fields.access")} hint={t("fields.accessHint")}>
          <Select name="access" defaultValue={lesson?.access ?? "free"}>
            <option value="free">{t("access.free")}</option>
            <option value="premium">{t("access.premium")}</option>
          </Select>
        </Field>
      </section>

      {lesson ? <input type="hidden" name="course_id" value={courseId} /> : null}
      <SubmitRow pending={pending} error={state.error} deleteAction={lesson ? deleteLesson : undefined} id={lesson?.id} />
    </form>
  );
}
