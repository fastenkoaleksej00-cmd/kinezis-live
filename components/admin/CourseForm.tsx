"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { deleteCourse, saveCourse, type AdminState } from "@/lib/admin/actions";
import type { AuthorRow, CourseRow } from "@/lib/content/db";
import { levels } from "@/lib/content/types";
import { Checkbox, Field, Input, LocalizedInputs, Select } from "./fields";
import { SubmitRow } from "./SubmitRow";

interface CourseFormProps {
  course?: CourseRow | null;
  authors: AuthorRow[];
}

const initial: AdminState = {};

export function CourseForm({ course, authors }: CourseFormProps) {
  const t = useTranslations("admin");
  const tl = useTranslations("library");
  const [state, action, pending] = useActionState(saveCourse, initial);

  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      {course ? <input type="hidden" name="id" value={course.id} /> : null}
      {course?.published_at ? <input type="hidden" name="published_at_prev" value={course.published_at} /> : null}

      <section className="card space-y-5 p-5">
        <LocalizedInputs name="title" label={t("fields.title")} value={course?.title} required />
        <LocalizedInputs name="description" label={t("fields.description")} value={course?.description} multiline />
        <Field label={t("fields.slug")} hint={t("fields.slugHint")}>
          <Input name="slug" defaultValue={course?.slug ?? ""} pattern="[a-z0-9-]*" />
        </Field>
      </section>

      <section className="card grid gap-5 p-5 sm:grid-cols-2">
        <Field label={t("fields.level")}>
          <Select name="level" defaultValue={course?.level ?? "beginner"}>
            {levels.map((l) => (
              <option key={l} value={l}>
                {tl(`levels.${l}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.author")}>
          <Select name="author_id" defaultValue={course?.author_id ?? authors[0]?.id ?? ""}>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.language")} hint={t("fields.languageHint")}>
          <Select name="language" defaultValue={course?.language ?? "uk"}>
            <option value="uk">Українська</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="ru">Русский</option>
          </Select>
        </Field>
        <Field label={t("fields.coverTone")}>
          <Select name="cover_tone" defaultValue={course?.cover_tone ?? "mint"}>
            <option value="mint">{t("tones.mint")}</option>
            <option value="deep">{t("tones.deep")}</option>
            <option value="light">{t("tones.light")}</option>
          </Select>
        </Field>
        <Field label={t("fields.access")} hint={t("fields.accessHint")}>
          <Select name="access" defaultValue={course?.access ?? "free"}>
            <option value="free">{t("access.free")}</option>
            <option value="premium">{t("access.premium")}</option>
          </Select>
        </Field>
      </section>

      <section className="card p-5">
        <Checkbox name="published" label={t("fields.published")} defaultChecked={course?.published ?? false} />
        <p className="text-steel mt-1.5 text-xs">{t("fields.publishedHint")}</p>
      </section>

      <SubmitRow pending={pending} error={state.error} deleteAction={course ? deleteCourse : undefined} id={course?.id} />
    </form>
  );
}
