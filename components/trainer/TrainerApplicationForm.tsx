"use client";

import { useTranslations } from "next-intl";
import { useActionState, useRef, useState } from "react";
import { Camera, FileUp, Loader2, Send, Save, X } from "lucide-react";
import { Checkbox, Field, Input, Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { categoryIds } from "@/lib/content/types";
import { getBrowserClient } from "@/lib/supabase/client";
import { saveTrainerApplication, type TrainerState } from "@/lib/trainers/actions";
import type { TrainerApplication } from "@/lib/trainers/queries";

const initial: TrainerState = {};
const MAX_PHOTO = 5 * 1024 * 1024;
const MAX_DOC = 10 * 1024 * 1024;

/** Application to become a trainer: draft or submit. Photo goes to the public avatars folder, documents to the private trainer-docs bucket. */
export function TrainerApplicationForm({ userId, application }: { userId: string; application: TrainerApplication | null }) {
  const t = useTranslations("trainers.apply");
  const tl = useTranslations("library");
  const [state, action, pending] = useActionState(saveTrainerApplication, initial);
  const [photo, setPhoto] = useState<string | null>(application?.photoSrc ?? null);
  const [docs, setDocs] = useState<string[]>(application?.documents ?? []);
  const [busy, setBusy] = useState<"photo" | "doc" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const locked = application?.status === "submitted" || application?.status === "review" || application?.status === "approved";

  async function uploadPhoto(file: File) {
    const supabase = getBrowserClient();
    if (!supabase || file.size > MAX_PHOTO) return setUploadError(t("uploadFailed"));
    setBusy("photo");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${userId}/trainer-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type || undefined });
    setBusy(null);
    if (error) return setUploadError(t("uploadFailed"));
    setUploadError(null);
    setPhoto(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
  }

  async function uploadDoc(file: File) {
    const supabase = getBrowserClient();
    if (!supabase || file.size > MAX_DOC || docs.length >= 5) return setUploadError(t("uploadFailed"));
    setBusy("doc");
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    const path = `${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("trainer-docs").upload(path, file, { contentType: file.type || undefined });
    setBusy(null);
    if (error) return setUploadError(t("uploadFailed"));
    setUploadError(null);
    setDocs((d) => [...d, path]);
  }

  return (
    <form action={action} className="space-y-5" aria-busy={pending}>
      <input type="hidden" name="photo_src" value={photo ?? ""} />
      <input type="hidden" name="documents" value={docs.join("\n")} />
      <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && void uploadPhoto(e.target.files[0])} />
      <input ref={docRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="sr-only" onChange={(e) => e.target.files?.[0] && void uploadDoc(e.target.files[0])} />

      <section className="card space-y-5 p-5">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => photoRef.current?.click()} disabled={busy !== null || locked} className="section-deep text-frost relative inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white text-2xl font-bold shadow-[var(--shadow-card)]" aria-label={t("photo")}>
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="" className="h-full w-full object-cover" />
            ) : (
              <Camera className="h-6 w-6" aria-hidden />
            )}
            {busy === "photo" ? (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-white">
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              </span>
            ) : null}
          </button>
          <p className="text-steel text-xs">{t("photoHint")}</p>
        </div>
        <Field label={t("fields.fullName")}>
          <Input name="full_name" defaultValue={application?.fullName ?? ""} maxLength={80} required disabled={locked} />
        </Field>
        <fieldset>
          <legend className="eyebrow mb-2.5">{t("fields.specialties")}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {categoryIds.map((c) => (
              <Checkbox key={c} name={`spec_${c}`} label={tl(`categories.${c}`)} defaultChecked={application?.specialties.includes(c) ?? false} disabled={locked} />
            ))}
          </div>
        </fieldset>
        <Field label={t("fields.bio")} hint={t("fields.bioHint")}>
          <Textarea name="bio" rows={4} maxLength={1500} defaultValue={application?.bio ?? ""} disabled={locked} />
        </Field>
        <Field label={t("fields.qualifications")} hint={t("fields.qualificationsHint")}>
          <Textarea name="qualifications" rows={4} maxLength={1500} defaultValue={application?.qualifications ?? ""} disabled={locked} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t("fields.experienceYears")}>
            <Input name="experience_years" type="number" min={0} max={70} defaultValue={application?.experienceYears ?? ""} disabled={locked} />
          </Field>
          <Field label={t("fields.links")} hint={t("fields.linksHint")}>
            <Textarea name="links" rows={2} defaultValue={application?.links.join("\n") ?? ""} disabled={locked} />
          </Field>
        </div>
        <div>
          <p className="eyebrow mb-2">{t("fields.documents")}</p>
          <p className="text-steel mb-2 text-xs">{t("fields.documentsHint")}</p>
          <div className="flex flex-wrap items-center gap-2">
            {docs.map((d, i) => (
              <span key={d} className="bg-accent-soft text-accent inline-flex h-8 items-center gap-1.5 rounded-full pr-1.5 pl-3 text-xs font-semibold">
                {t("document", { n: i + 1 })}
                {!locked ? (
                  <button type="button" onClick={() => setDocs((all) => all.filter((x) => x !== d))} aria-label={t("removeDocument")} className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/70">
                    <X className="h-3 w-3" aria-hidden />
                  </button>
                ) : null}
              </span>
            ))}
            {!locked && docs.length < 5 ? (
              <button type="button" onClick={() => docRef.current?.click()} disabled={busy !== null} className="border-ink/10 text-ink inline-flex h-9 items-center gap-2 rounded-full border bg-white/70 px-3 text-xs font-semibold">
                {busy === "doc" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <FileUp className="h-4 w-4" aria-hidden />}
                {t("addDocument")}
              </button>
            ) : null}
          </div>
        </div>
        {uploadError ? <p className="text-sm text-[#8a2f2f]">{uploadError}</p> : null}
      </section>

      {!locked ? (
        <section className="card space-y-4 p-5">
          <Checkbox name="consent" label={t("consent")} defaultChecked={application?.consent ?? false} />
          <p className="text-steel text-xs">{t("consentHint")}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" name="mode" value="submit" size="lg" disabled={pending || busy !== null}>
              <Send className="h-4 w-4" aria-hidden />
              {t("submit")}
            </Button>
            <Button type="submit" name="mode" value="draft" size="lg" variant="secondary" disabled={pending || busy !== null}>
              <Save className="h-4 w-4" aria-hidden />
              {t("saveDraft")}
            </Button>
          </div>
          {state.ok ? <p className="text-mint-deep text-sm font-semibold">{t("saved")}</p> : null}
          {state.error ? <p className="text-sm text-[#8a2f2f]">{t(`errors.${state.error}`)}</p> : null}
        </section>
      ) : null}
    </form>
  );
}
