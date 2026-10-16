"use client";

import { useTranslations } from "next-intl";
import { useActionState, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, Video, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { quickPublish } from "@/lib/admin/postsActions";
import type { QuickPublishState } from "@/lib/admin/shared";
import type { AuthorRow } from "@/lib/content/db";
import { getBrowserClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image/compress";
import { cn } from "@/lib/utils";

interface ComposerProps {
  authors: AuthorRow[];
  defaultLanguage: string;
}

const initial: QuickPublishState = {};
const VIDEO_MAX = 50 * 1024 * 1024;
const PHOTO_MAX = 5 * 1024 * 1024;
const kinds = ["news", "tip", "session", "video", "photo"] as const;

/**
 * Instagram-style composer for the trainer: pick a photo or video, write a caption, choose a type, publish.
 * Files go straight to Supabase Storage from the browser; the post row is written by a server action.
 */
export function Composer({ authors, defaultLanguage }: ComposerProps) {
  const t = useTranslations("compose");
  const ta = useTranslations("admin");
  const tf = useTranslations("feed");
  const [state, action, pending] = useActionState(quickPublish, initial);
  const [media, setMedia] = useState<{ kind: "photo" | "video"; path: string; url: string; name: string; preview?: string } | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [errorKey, setErrorKey] = useState<"tooLarge" | "failed" | "notConfigured" | null>(null);
  const [kind, setKind] = useState<(typeof kinds)[number]>("news");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    file = await compressImage(file);
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
    const path = `posts/${crypto.randomUUID()}-${safe}`;
    const bucket = isVideo ? "videos" : "covers";
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) {
      setErrorKey("failed");
      setStatus("error");
      return;
    }
    const url = isVideo ? "" : supabase.storage.from("covers").getPublicUrl(path).data.publicUrl;
    setMedia({ kind: isVideo ? "video" : "photo", path, url, name: file.name, preview: isVideo ? undefined : URL.createObjectURL(file) });
    setKind((k) => (k === "news" ? (isVideo ? "video" : "photo") : k));
    setStatus("idle");
  }

  return (
    <form action={action} className="space-y-4" aria-busy={pending}>
      <input type="hidden" name="media_kind" value={media?.kind ?? ""} />
      <input type="hidden" name="media_path" value={media?.path ?? ""} />
      <input type="hidden" name="media_url" value={media?.url ?? ""} />
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
        {status === "error" && errorKey ? <p className="px-5 pb-4 text-sm text-danger">{ta(`upload.errors.${errorKey}`)}</p> : null}
      </div>

      <label className="card block p-4">
        <span className="eyebrow mb-2 block">{t("caption")}</span>
        <textarea name="caption" required rows={4} placeholder={t("captionPlaceholder")} className="text-ink placeholder:text-steel/60 w-full resize-none bg-transparent text-[15px] outline-none" />
      </label>

      <div className="card space-y-4 p-4">
        <div>
          <span className="eyebrow mb-2 block">{t("kind")}</span>
          <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4">
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={cn(
                  "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors",
                  kind === k ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70",
                )}
              >
                {tf(`kinds.${k}`)}
              </button>
            ))}
          </div>
          <input type="hidden" name="kind" value={kind} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="eyebrow mb-2 block">{ta("fields.language")}</span>
            <select name="language" defaultValue={defaultLanguage} className="border-ink/10 text-ink h-11 w-full rounded-2xl border bg-white/80 px-3 text-sm outline-none">
              <option value="uk">Українська</option>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
              <option value="ru">Русский</option>
            </select>
          </label>
          <label className="block">
            <span className="eyebrow mb-2 block">{ta("fields.author")}</span>
            <select name="author_id" defaultValue={authors[0]?.id ?? ""} className="border-ink/10 text-ink h-11 w-full rounded-2xl border bg-white/80 px-3 text-sm outline-none">
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="eyebrow mb-2 block">{ta("fields.access")}</span>
            <select name="access" defaultValue="free" className="border-ink/10 text-ink h-11 w-full rounded-2xl border bg-white/80 px-3 text-sm outline-none">
              <option value="free">{ta("access.free")}</option>
              <option value="premium">{ta("access.premium")}</option>
            </select>
          </label>
        </div>
        <input type="hidden" name="tone" value="deep" />
      </div>

      {state.error ? (
        <p role="alert" className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">
          {ta(`errors.${state.error}`)}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending || status === "uploading"} className="w-full">
        {pending ? t("publishing") : t("publish")}
      </Button>
      <p className="text-steel text-center text-xs">{t("fullEditorHint")}</p>
    </form>
  );
}
