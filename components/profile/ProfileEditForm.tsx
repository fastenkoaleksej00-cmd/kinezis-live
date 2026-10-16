"use client";

import { useTranslations } from "next-intl";
import { useActionState, useRef, useState } from "react";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { Checkbox, Field, Input, Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { updateProfile, type ProfileState } from "@/lib/profile/actions";
import { bannerClass } from "@/lib/profile/banner";
import { bannerPresets, interestOptions, type BannerPreset, type UserProfile } from "@/lib/profile/types";
import { getBrowserClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image/compress";
import { cn } from "@/lib/utils";

const initial: ProfileState = {};
const MAX = 5 * 1024 * 1024;

async function uploadImage(userId: string, kind: "avatar" | "banner", file: File): Promise<string | null> {
  file = await compressImage(file);
  const supabase = getBrowserClient();
  if (!supabase || file.size > MAX) return null;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${userId}/${kind}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type || undefined });
  if (error) return null;
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

/** Name, bio, interests, avatar upload, banner (preset or own image with crop position and live preview). */
export function ProfileEditForm({ profile }: { profile: UserProfile }) {
  const t = useTranslations("profileEdit");
  const tl = useTranslations("library");
  const [state, action, pending] = useActionState(updateProfile, initial);
  const [avatar, setAvatar] = useState<string | null>(profile.avatarSrc);
  const [banner, setBanner] = useState<string | null>(profile.bannerSrc);
  const [preset, setPreset] = useState<BannerPreset>(profile.bannerPreset);
  const [position, setPosition] = useState<number>(profile.bannerPosition);
  const [busy, setBusy] = useState<"avatar" | "banner" | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  async function pick(kind: "avatar" | "banner", file: File) {
    setBusy(kind);
    setUploadError(null);
    const url = await uploadImage(profile.id, kind, file);
    setBusy(null);
    if (!url) {
      setUploadError(t("uploadFailed"));
      return;
    }
    if (kind === "avatar") setAvatar(url);
    else setBanner(url);
  }

  const interestLabel = (i: string) =>
    i in { kinesiotherapy: 1, yoga: 1, pilates: 1, stretching: 1, mobility: 1, back: 1 } ? tl(`categories.${i as "yoga"}`) : t(`interests.${i as "face"}`);

  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      <input type="hidden" name="avatar_src" value={avatar ?? ""} />
      <input type="hidden" name="banner_src" value={banner ?? ""} />
      <input type="hidden" name="banner_preset" value={preset} />
      <input type="hidden" name="banner_position" value={position} />
      <input ref={avatarRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && void pick("avatar", e.target.files[0])} />
      <input ref={bannerRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && void pick("banner", e.target.files[0])} />

      {/* Live preview of banner + avatar */}
      <section className="card overflow-hidden">
        <div className={cn("relative h-40 sm:h-48", !banner && bannerClass(preset))}>
          {banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={banner} alt="" className="h-full w-full object-cover" style={{ objectPosition: `50% ${position}%` }} />
          ) : null}
          <div className="absolute right-3 bottom-3 z-10 flex gap-2">
            <button type="button" onClick={() => bannerRef.current?.click()} disabled={busy !== null} className="inline-flex h-9 items-center gap-2 rounded-full border border-white/40 bg-ink/50 px-3 text-xs font-semibold text-white backdrop-blur-md">
              {busy === "banner" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
              {t("bannerUpload")}
            </button>
            {banner ? (
              <button type="button" onClick={() => setBanner(null)} aria-label={t("bannerRemove")} className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-ink/50 text-white backdrop-blur-md">
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
        <div className="relative px-5 pb-5">
          <div className="-mt-10 flex items-end gap-4">
            <button type="button" onClick={() => avatarRef.current?.click()} disabled={busy !== null} className="section-deep text-frost relative inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white text-2xl font-bold shadow-[var(--shadow-card)]" aria-label={t("avatarUpload")}>
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="" className="h-full w-full object-cover object-[50%_30%]" />
              ) : (
                (profile.displayName ?? "?").slice(0, 1).toUpperCase()
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-white opacity-0 transition-opacity hover:opacity-100">
                {busy === "avatar" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Camera className="h-5 w-5" aria-hidden />}
              </span>
            </button>
            <p className="text-steel pb-2 text-xs">{t("avatarHint")}</p>
          </div>
          {uploadError ? <p className="mt-3 text-sm text-danger">{uploadError}</p> : null}
        </div>
      </section>

      <section className="card space-y-4 p-5">
        <p className="eyebrow">{t("bannerTitle")}</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {bannerPresets.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPreset(p);
                setBanner(null);
              }}
              aria-pressed={!banner && preset === p}
              className="group flex flex-col items-center gap-1.5"
            >
              <span className={cn("block h-12 w-full rounded-xl border-2 transition-[transform,border-color] duration-300 group-active:scale-95", bannerClass(p), !banner && preset === p ? "border-accent" : "border-transparent")} aria-hidden />
              <span className={cn("text-xs font-semibold", !banner && preset === p ? "text-ink" : "text-steel")}>{t(`presets.${p}`)}</span>
            </button>
          ))}
        </div>
        <p className="text-steel text-xs">{t("bannerHint")}</p>
        {preset !== "mint" || banner ? (
          <button
            type="button"
            onClick={() => {
              setPreset("mint");
              setBanner(null);
            }}
            className="text-accent text-xs font-semibold hover:underline"
          >
            {t("bannerReset")}
          </button>
        ) : null}
        {banner ? (
          <label className="block">
            <span className="text-steel mb-1.5 block text-xs font-semibold">{t("bannerPosition")}</span>
            <input type="range" min={0} max={100} value={position} onChange={(e) => setPosition(Number(e.target.value))} className="accent-accent w-full" />
          </label>
        ) : null}
      </section>

      <section className="card space-y-5 p-5">
        <Field label={t("name")}>
          <Input name="display_name" defaultValue={profile.displayName ?? ""} maxLength={60} />
        </Field>
        <Field label={t("bio")} hint={t("bioHint")}>
          <Textarea name="bio" defaultValue={profile.bio ?? ""} maxLength={300} rows={3} />
        </Field>
        <fieldset>
          <legend className="eyebrow mb-2.5">{t("interestsTitle")}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2.5">
            {interestOptions.map((i) => (
              <Checkbox key={i} name={`interest_${i}`} label={interestLabel(i)} defaultChecked={profile.interests.includes(i)} />
            ))}
          </div>
        </fieldset>
      </section>

      {state.error ? <p role="alert" className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">{t(`errors.${state.error}`)}</p> : null}
      <Button type="submit" size="lg" disabled={pending || busy !== null} className="w-full sm:w-auto">
        {pending ? t("saving") : t("save")}
      </Button>
    </form>
  );
}
