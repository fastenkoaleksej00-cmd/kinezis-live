"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { deleteArticle, deleteProduct, deleteRoutine, saveArticle, saveProduct, saveRoutine } from "@/lib/admin/skincareActions";
import type { AdminState } from "@/lib/admin/shared";
import type { ArticleRow, ProductRow, RoutineRow } from "@/lib/content/db";
import { Checkbox, Field, Input, LocalizedInputs, Select, Textarea } from "./fields";
import { SubmitRow } from "./SubmitRow";

const initial: AdminState = {};

function lines(list: Array<{ en?: string; uk?: string; de?: string; ru?: string }> | undefined, code: "en" | "uk" | "de" | "ru"): string {
  return (list ?? []).map((s) => s[code] ?? "").join("\n");
}

function CommonFields({ language, access, published, t }: { language?: string; access?: string; published?: boolean; t: ReturnType<typeof useTranslations<"admin">> }) {
  return (
    <>
      <section className="card grid gap-5 p-5 sm:grid-cols-2">
        <Field label={t("fields.language")} hint={t("fields.languageHint")}>
          <Select name="language" defaultValue={language ?? "uk"}>
            <option value="uk">Українська</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
            <option value="ru">Русский</option>
          </Select>
        </Field>
        <Field label={t("fields.access")} hint={t("fields.accessHint")}>
          <Select name="access" defaultValue={access ?? "free"}>
            <option value="free">{t("access.free")}</option>
            <option value="premium">{t("access.premium")}</option>
          </Select>
        </Field>
      </section>
      <section className="card p-5">
        <Checkbox name="published" label={t("fields.published")} defaultChecked={published ?? false} />
        <p className="text-steel mt-1.5 text-xs">{t("fields.publishedHint")}</p>
      </section>
    </>
  );
}

export function RoutineForm({ routine }: { routine?: RoutineRow | null }) {
  const t = useTranslations("admin");
  const ts = useTranslations("skincare");
  const [state, action, pending] = useActionState(saveRoutine, initial);
  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      {routine ? <input type="hidden" name="id" value={routine.id} /> : null}
      {routine?.published_at ? <input type="hidden" name="published_at_prev" value={routine.published_at} /> : null}
      <section className="card space-y-5 p-5">
        <LocalizedInputs name="title" label={t("fields.title")} value={routine?.title} required />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.timeOfDay")}>
            <Select name="time_of_day" defaultValue={routine?.time_of_day ?? "morning"}>
              <option value="morning">{ts("times.morning")}</option>
              <option value="evening">{ts("times.evening")}</option>
              <option value="weekly">{ts("times.weekly")}</option>
            </Select>
          </Field>
          <Field label={t("fields.slug")} hint={t("fields.slugHint")}>
            <Input name="slug" defaultValue={routine?.slug ?? ""} pattern="[a-z0-9-]*" />
          </Field>
        </div>
        <fieldset className="space-y-2.5">
          <legend className="eyebrow mb-1">{t("fields.routineSteps")}</legend>
          <p className="text-steel text-xs">{t("fields.stepsHint")}</p>
          {(["en", "uk", "de", "ru"] as const).map((code) => (
            <div key={code} className="flex items-start gap-2.5">
              <span className="text-steel mt-3.5 w-7 shrink-0 text-xs font-bold tracking-wider uppercase">{code}</span>
              <Textarea name={`steps_${code}`} defaultValue={lines(routine?.steps, code)} rows={5} required={code === "en"} lang={code} aria-label={`${t("fields.routineSteps")} (${code})`} />
            </div>
          ))}
        </fieldset>
      </section>
      <CommonFields language={routine?.language} access={routine?.access} published={routine?.published} t={t} />
      <SubmitRow pending={pending} error={state.error} deleteAction={routine ? deleteRoutine : undefined} id={routine?.id} />
    </form>
  );
}

export function ArticleForm({ article }: { article?: ArticleRow | null }) {
  const t = useTranslations("admin");
  const [state, action, pending] = useActionState(saveArticle, initial);
  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      {article ? <input type="hidden" name="id" value={article.id} /> : null}
      {article?.published_at ? <input type="hidden" name="published_at_prev" value={article.published_at} /> : null}
      <section className="card space-y-5 p-5">
        <LocalizedInputs name="title" label={t("fields.title")} value={article?.title} required />
        <LocalizedInputs name="body" label={t("fields.body")} value={article?.body} required multiline />
        <Field label={t("fields.slug")} hint={t("fields.slugHint")}>
          <Input name="slug" defaultValue={article?.slug ?? ""} pattern="[a-z0-9-]*" />
        </Field>
      </section>
      <CommonFields language={article?.language} access={article?.access} published={article?.published} t={t} />
      <SubmitRow pending={pending} error={state.error} deleteAction={article ? deleteArticle : undefined} id={article?.id} />
    </form>
  );
}

const productCategories = ["cleanser", "toner", "serum", "moisturizer", "spf", "mask", "tool", "other"] as const;

export function ProductForm({ product }: { product?: ProductRow | null }) {
  const t = useTranslations("admin");
  const ts = useTranslations("skincare");
  const [state, action, pending] = useActionState(saveProduct, initial);
  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      {product ? <input type="hidden" name="id" value={product.id} /> : null}
      {product?.published_at ? <input type="hidden" name="published_at_prev" value={product.published_at} /> : null}
      <section className="card grid gap-5 p-5 sm:grid-cols-2">
        <Field label={t("fields.name")}>
          <Input name="name" defaultValue={product?.name ?? ""} required />
        </Field>
        <Field label={t("fields.brand")}>
          <Input name="brand" defaultValue={product?.brand ?? ""} />
        </Field>
        <Field label={t("fields.productCategory")}>
          <Select name="category" defaultValue={product?.category ?? "other"}>
            {productCategories.map((c) => (
              <option key={c} value={c}>
                {ts(`categories.${c}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.slug")} hint={t("fields.slugHint")}>
          <Input name="slug" defaultValue={product?.slug ?? ""} pattern="[a-z0-9-]*" />
        </Field>
      </section>
      <section className="card space-y-5 p-5">
        <LocalizedInputs name="description" label={t("fields.description")} value={product?.description} multiline />
        <LocalizedInputs name="usage" label={t("fields.usage")} value={product?.usage} multiline />
        <Field label={t("fields.ingredients")} hint={t("fields.ingredientsHint")}>
          <Textarea name="ingredients" defaultValue={(product?.ingredients ?? []).join("\n")} rows={4} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.purchaseUrl")}>
            <Input name="purchase_url" type="url" defaultValue={product?.purchase_url ?? ""} placeholder="https://" />
          </Field>
          <Field label={t("fields.imageSrc")}>
            <Input name="image_src" type="url" defaultValue={product?.image_src ?? ""} placeholder="https://" />
          </Field>
        </div>
      </section>
      <CommonFields language={product?.language} access={product?.access} published={product?.published} t={t} />
      <SubmitRow pending={pending} error={state.error} deleteAction={product ? deleteProduct : undefined} id={product?.id} />
    </form>
  );
}
