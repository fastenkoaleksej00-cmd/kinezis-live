"use client";

import { useTranslations } from "next-intl";
import { useActionState, useRef, useState } from "react";
import { Camera, Check, Loader2 } from "lucide-react";
import { Checkbox, Field, Input, LocalizedInputs, Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import type { AuthorRow } from "@/lib/content/db";
import { categoryIds } from "@/lib/content/types";
import { bannerPresets } from "@/lib/profile/types";
import { bannerClass } from "@/lib/profile/banner";
import { getBrowserClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image/compress";
import { updateMyAuthor, type TrainerState } from "@/lib/trainers/actions";
import { cn } from "@/lib/utils";

const initial: TrainerState = {};

/** A trainer edits their own public card. Verification and status stay admin-only (database trigger). */
export function AuthorCardForm({ author, userId }: { author: AuthorRow; userId: string }) {
  const t = useTranslations("trainers.card");
  const tl = useTranslations("library");
  const tp = useTranslations("profileEdit");
  const [state, action, pending] = useActionState(updateMyAuthor, initial);
  const [avatar, setAvatar] = useState<string | null>(author.avatar_src);
  const [preset, setPreset] = useState<string>(author.cover_preset ?? "midnight");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    file = await compressImage(file);
    const supabase = getBrowserClient();
    if (!supabase || file.size > 5 * 1024 * 1024) return;
    setBusy(true);
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/trainer-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type || undefined });
    setBusy(false);
    if (!error) setAvatar(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
  }

  return (
    <form action={action} className="space-y-5" aria-busy={pending}>
      <input type="hidden" name="avatar_src" value={avatar ?? ""} />
      <input type="hidden" name="cover_preset" value={preset} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />

      <section className="card overflow-hidden">
        <div className={cn("relative h-32", bannerClass(preset as (typeof bannerPresets)[number]))} />
        <div className="relative px-5 pb-5">
          <div className="-mt-10 flex items-end gap-4">
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy} className="section-deep text-frost relative inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white text-2xl font-bold shadow-[var(--shadow-card)]" aria-label={t("photo")}>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                author.name.slice(0, 1)
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-white opacity-0 transition-opacity hover:opacity-100">{busy ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Camera className="h-5 w-5" aria-hidden />}</span>
            </button>
            <p className="text-steel pb-2 text-xs">{t("photoHint")}</p>
          </div>
          <p className="eyebrow mt-5 mb-2">{t("cover")}</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {bannerPresets.map((p) => (
              <button key={p} type="button" onClick={() => setPreset(p)} aria-pressed={preset === p} className="group flex flex-col items-center gap-1.5">
                <span className={cn("block h-10 w-full rounded-xl border-2 transition-[border-color]", bannerClass(p), preset === p ? "border-accent" : "border-transparent")} aria-hidden />
                <span className={cn("text-xs font-semibold", preset === p ? "text-ink" : "text-steel")}>{tp(`presets.${p}`)}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="card space-y-5 p-5">
        <Field label={t("name")}>
          <Input name="name" defaultValue={author.name} maxLength={80} required />
        </Field>
        <LocalizedInputs name="bio" label={t("bio")} value={author.bio ?? undefined} multiline />
        <fieldset>
          <legend className="eyebrow mb-2.5">{t("specialties")}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {categoryIds.map((c) => (
              <Checkbox key={c} name={`spec_${c}`} label={tl(`categories.${c}`)} defaultChecked={author.specialties?.includes(c) ?? false} />
            ))}
          </div>
        </fieldset>
        <Field label={t("qualifications")} hint={t("qualificationsHint")}>
          <Textarea name="qualifications" rows={3} maxLength={1500} defaultValue={author.qualifications ?? ""} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("experienceYears")}>
            <Input name="experience_years" type="number" min={0} max={70} defaultValue={author.experience_years ?? ""} />
          </Field>
          <Field label="Instagram">
            <Input name="instagram" type="url" defaultValue={author.instagram ?? ""} placeholder="https://www.instagram.com/…" />
          </Field>
        </div>
        <Field label={t("booking")} hint={t("bookingHint")}>
          <Input name="booking_url" type="url" defaultValue={author.booking_url ?? ""} placeholder="https://cal.com/…" />
        </Field>
        <Field label={t("links")} hint={t("linksHint")}>
          <Textarea name="links" rows={2} defaultValue={(author.links ?? []).join("\n")} />
        </Field>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" size="md" disabled={pending || busy}>
            <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
            {t("save")}
          </Button>
          {state.ok ? <p className="text-mint-deep text-sm font-semibold">{t("saved")}</p> : null}
          {state.error ? <p className="text-sm text-danger">{t("error")}</p> : null}
        </div>
        <p className="text-steel text-xs">{t("verifiedNote")}</p>
      </section>
    </form>
  );
}
