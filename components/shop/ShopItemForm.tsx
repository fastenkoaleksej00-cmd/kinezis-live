"use client";

import { useTranslations } from "next-intl";
import { useActionState, useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { Checkbox, Field, Input, LocalizedInputs, Select } from "@/components/admin/fields";
import { SubmitRow } from "@/components/admin/SubmitRow";
import { deleteShopItem, saveShopItem, type ShopState } from "@/lib/shop/actions";
import type { ShopItemRow, ShopOfferRow } from "@/lib/shop/queries";
import { OFFER_ROWS, shopCategories, shopCollections, shopCountries, shopCurrencies, shopSources } from "@/lib/shop/types";
import { getBrowserClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image/compress";

const initial: ShopState = {};

/** Admin: one product. Photo goes to the public covers bucket under shop/. Buying happens on the partner's page. */
export function ShopItemForm({ item, offers = [] }: { item?: ShopItemRow | null; offers?: ShopOfferRow[] }) {
  const t = useTranslations("shop.admin");
  const ts = useTranslations("shop");
  const [state, action, pending] = useActionState(saveShopItem, initial);
  const [image, setImage] = useState<string>(item?.image_src ?? "");
  const [busy, setBusy] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    file = await compressImage(file);
    const supabase = getBrowserClient();
    if (!supabase || file.size > 5 * 1024 * 1024) return setUploadError(true);
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `shop/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("covers").upload(path, file, { contentType: file.type || undefined });
    setBusy(false);
    if (error) return setUploadError(true);
    setUploadError(false);
    setImage(supabase.storage.from("covers").getPublicUrl(path).data.publicUrl);
  }

  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      {item ? <input type="hidden" name="id" value={item.id} /> : null}
      <input type="hidden" name="image_src" value={image} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
      <section className="card space-y-5 p-5">
        <LocalizedInputs name="title" label={t("title")} value={item?.title} required />
        <LocalizedInputs name="description" label={t("description")} value={item?.description ?? undefined} multiline />
      </section>
      <section className="card grid gap-5 p-5 sm:grid-cols-2">
        <Field label={t("category")}>
          <Select name="category" defaultValue={item?.category ?? "mats"}>
            {shopCategories.map((c) => (
              <option key={c} value={c}>
                {ts(`categories.${c}.title`)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Field label={t("price")} hint={t("priceHint")}>
            <Input name="price" inputMode="decimal" defaultValue={item?.price ?? ""} />
          </Field>
          <Field label={t("currency")}>
            <Select name="currency" defaultValue={item?.currency ?? "UAH"}>
              {shopCurrencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <Field label={t("url")} hint={t("urlHint")} className="sm:col-span-2">
          <Input name="purchase_url" type="url" defaultValue={item?.purchase_url ?? ""} placeholder="https://" />
        </Field>
        <Field label={t("partner")}>
          <Input name="partner" defaultValue={item?.partner ?? ""} maxLength={80} />
        </Field>
        <Field label={t("position")}>
          <Input name="position" type="number" defaultValue={item?.position ?? 0} />
        </Field>
        <div className="sm:col-span-2">
          <p className="eyebrow mb-2">{t("photo")}</p>
          <div className="flex items-center gap-4">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image} alt="" className="h-24 w-24 rounded-2xl border border-white bg-white object-contain p-1" />
            ) : null}
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="border-ink/10 text-ink inline-flex h-10 items-center gap-2 rounded-full border bg-white/70 px-4 text-sm font-semibold">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
              {t("upload")}
            </button>
          </div>
          {uploadError ? <p className="mt-2 text-sm text-danger">{t("uploadFailed")}</p> : null}
          <p className="text-steel mt-2 text-xs">{t("photoHint")}</p>
        </div>
      </section>
      <section className="card space-y-4 p-5">
        <div>
          <p className="eyebrow">{t("offersTitle")}</p>
          <p className="text-steel mt-1 text-xs">{t("offersHint", { countries: shopCountries.join(", ") })}</p>
        </div>
        {Array.from({ length: OFFER_ROWS }, (_, i) => {
          const o = offers[i];
          return (
            <fieldset key={i} className="bg-frost/60 grid gap-3 rounded-2xl p-3 sm:grid-cols-6">
              <legend className="text-steel px-1 text-xs font-semibold">{t("offer", { n: i + 1 })}</legend>
              <Field label={t("source")} className="sm:col-span-2">
                <Select name={`offer_${i}_source`} defaultValue={o?.source ?? "partner"}>
                  {shopSources.map((src) => (
                    <option key={src} value={src}>
                      {ts(`sources.${src}`)}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("storeName")} className="sm:col-span-2">
                <Input name={`offer_${i}_store`} defaultValue={o?.store_name ?? ""} maxLength={80} placeholder="Amazon.de" />
              </Field>
              <Field label={t("countries")} className="sm:col-span-2">
                <Input name={`offer_${i}_countries`} defaultValue={(o?.countries ?? []).join(", ")} placeholder="DE, AT, PL" />
              </Field>
              <Field label={t("url")} className="sm:col-span-6">
                <Input name={`offer_${i}_url`} type="url" defaultValue={o?.url ?? ""} placeholder="https://" />
              </Field>
              <Field label={t("price")} className="sm:col-span-2">
                <Input name={`offer_${i}_price`} inputMode="decimal" defaultValue={o?.price ?? ""} />
              </Field>
              <Field label={t("currency")}>
                <Select name={`offer_${i}_currency`} defaultValue={o?.currency ?? "EUR"}>
                  {shopCurrencies.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label={t("deliveryMin")}>
                <Input name={`offer_${i}_dmin`} type="number" min={0} max={120} defaultValue={o?.delivery_min_days ?? ""} />
              </Field>
              <Field label={t("deliveryMax")} className="sm:col-span-2">
                <Input name={`offer_${i}_dmax`} type="number" min={0} max={120} defaultValue={o?.delivery_max_days ?? ""} />
              </Field>
            </fieldset>
          );
        })}
        <p className="text-steel text-xs">{t("deliveryHint")}</p>
      </section>

      <section className="card space-y-3 p-5">
        <p className="eyebrow">{t("collectionsTitle")}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2.5">
          {shopCollections.map((c) => (
            <Checkbox key={c} name={`collection_${c}`} label={ts(`collections.${c}.title`)} defaultChecked={item?.collections?.includes(c) ?? false} />
          ))}
        </div>
        <Checkbox name="featured" label={t("featured")} defaultChecked={item?.featured ?? false} />
        <Checkbox name="published" label={t("published")} defaultChecked={item?.published ?? false} />
        {state.error ? <p className="text-sm text-danger">{t(`errors.${state.error}`)}</p> : null}
      </section>
      <SubmitRow pending={pending} deleteAction={item ? deleteShopItem : undefined} id={item?.id} />
    </form>
  );
}
