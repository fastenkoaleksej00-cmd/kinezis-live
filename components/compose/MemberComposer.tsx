"use client";

import { useTranslations } from "next-intl";
import { useActionState, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { memberPublish, type QuickPublishState } from "@/lib/admin/actions";
import { getBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const initial: QuickPublishState = {};
const VIDEO_MAX = 50 * 1024 * 1024;
const PHOTO_MAX = 5 * 1024 * 1024;
const categories = ["workouts", "face", "skincare", "nutrition", "motivation", "other"] as const;

/** Member composer: photo or video, caption, category. Publishes to the community feed. */
export function MemberComposer({ userId, defaultLanguage }: { userId: string; defaultLanguage: string }) {
  const t = useTranslations("compose");
  const ta = useTranslations("admin");
  const [state, action, pending] = useActionState(memberPublish, initial);
  const [media, setMedia] = useState<{ kind: "photo" | "video"; path: string; url: string; name: string; preview?: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorKey, setErrorKey] = useState<"tooLarge" | "failed" | "notConfigured" | null>(null);
  const [category, setCategory] = useState<(typeof categories)[number]>("other");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    const supabase = getBrowserClient();
    if (!supabase) {
      setErrorKey("notConfigured");
      setStatus("error");
      return;
    }
    const isVideo = file.type.startsWith("video/");
    if (file.size > (isVideo ? VIDEO_MAX : PHOTO_MAX)) {
      setErrorKey("tooLarge");
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setErrorKey(null);
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
    // Members write only inside their own folder (storage policies)
    const path = `${userId}/${crypto.randomUUID()}-${safe}`;
    const bucket = isVideo ? "member-videos" : "avatars";
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) {
      setErrorKey("failed");
      setStatus("error");
      return;
    }
    const url = isVideo ? "" : supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    setMedia({ kind: isVideo ? "video" : "photo", path: isVideo ? path : "", url, name: file.name, preview: isVideo ? undefined : URL.createObjectURL(file) });
    setStatus("idle");
  }

  return (
    <form action={action} className="space-y-4" aria-busy={pending}>
      <input type="hidden" name="media_kind" value={media?.kind ?? ""} />
      <input type="hidden" name="media_path" value={media?.path ?? ""} />
      <input type="hidden" name="media_url" value={media?.url ?? ""} />
      <input type="hidden" name="language" value={defaultLanguage} />
      <input type="hidden" name="category" value={category} />
      <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />

      <div className="card overflow-hidden">
        {media ? (
          <div className="relative">
            {media.kind === "photo" && media.preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={media.preview} alt="" className="aspect-[4/3] w-full object-cover" />
            ) : (
              <div className="cover flex aspect-video items-center justify-center">
                <span className="relative z-10 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  {media.name}
                </span>
              </div>
            )}
            <button type="button" onClick={() => setMedia(null)} aria-label={ta("upload.remove")} className="absolute top-3 right-3 z-20 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-ink/50 text-white backdrop-blur-md">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={status === "uploading"} className="hover:bg-frost/60 flex w-full flex-col items-center gap-3 px-6 py-10 text-center transition-colors">
            {status === "uploading" ? (
              <Loader2 className="text-accent h-8 w-8 animate-spin" aria-hidden />
            ) : (
              <span className="flex gap-3">
                <span className="bg-accent-soft text-accent inline-flex h-12 w-12 items-center justify-center rounded-full">
                  <ImagePlus className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <span className="bg-mint-soft text-mint-deep inline-flex h-12 w-12 items-center justify-center rounded-full">
                  <Video className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
              </span>
            )}
            <span className="text-ink text-sm font-semibold">{status === "uploading" ? ta("upload.uploading") : t("addMedia")}</span>
            <span className="text-steel text-xs">{t("mediaHint")}</span>
          </button>
        )}
        {status === "error" && errorKey ? <p className="px-5 pb-4 text-sm text-[#8a2f2f]">{ta(`upload.errors.${errorKey}`)}</p> : null}
      </div>

      <label className="card block p-4">
        <span className="eyebrow mb-2 block">{t("caption")}</span>
        <textarea name="caption" required maxLength={1000} rows={4} placeholder={t("memberPlaceholder")} className="text-ink placeholder:text-steel/60 w-full resize-none bg-transparent text-[15px] outline-none" />
      </label>

      <div className="card p-4">
        <span className="eyebrow mb-2 block">{t("category")}</span>
        <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4">
          {categories.map((c) => (
            <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className={cn("inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors", category === c ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
              {t(`categories.${c}`)}
            </button>
          ))}
        </div>
      </div>

      {state.error ? <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">{ta(`errors.${state.error}`)}</p> : null}
      <Button type="submit" size="lg" disabled={pending || status === "uploading"} className="w-full">
        {pending ? t("publishing") : t("publish")}
      </Button>
      <p className="text-steel text-center text-xs">{t("memberRules")}</p>
    </form>
  );
}
