"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, Film, ImagePlus, Loader2, Play, Scissors, X } from "lucide-react";
import { Checkbox, Field, Input, Select, Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { Cover } from "@/components/ui/Cover";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { quickPublishWorkout, type QuickPublishState } from "@/lib/admin/actions";
import type { AuthorRow } from "@/lib/content/db";
import { categoryIds, goals, levels, equipmentIds } from "@/lib/content/types";
import { getBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface WorkoutComposerProps {
  authors: AuthorRow[];
  isAdmin?: boolean;
  defaultLanguage: string;
}

const initial: QuickPublishState = {};
const VIDEO_MAX = 50 * 1024 * 1024;
const IMAGE_MAX = 5 * 1024 * 1024;

/**
 * One-screen workout publish for the trainer: video → title → category → cover (upload or frame from the video) → preview → publish or draft.
 * Files go straight to Supabase Storage from the browser; the row is written by a server action.
 */
export function WorkoutComposer({ authors, defaultLanguage, isAdmin = false }: WorkoutComposerProps) {
  const t = useTranslations("workoutCompose");
  const ta = useTranslations("admin");
  const tl = useTranslations("library");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState(quickPublishWorkout, initial);
  const [video, setVideo] = useState<{ path: string; name: string; objectUrl: string; size: number } | null>(null);
  const [videoStatus, setVideoStatus] = useState<"idle" | "uploading" | "error">("idle");
  // Files over the storage limit: point the trainer to the YouTube import instead of a dead end
  const [tooLarge, setTooLarge] = useState(false);
  const [poster, setPoster] = useState<string | null>(null);
  const [posterStatus, setPosterStatus] = useState<"idle" | "uploading" | "error">("idle");
  const [frameAt, setFrameAt] = useState(2);
  const [videoDuration, setVideoDuration] = useState(0);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<(typeof categoryIds)[number]>("mobility");
  const [level, setLevel] = useState<(typeof levels)[number]>("beginner");
  const [duration, setDuration] = useState(15);
  const [error, setError] = useState<string | null>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const imageInput = useRef<HTMLInputElement>(null);
  const previewVideo = useRef<HTMLVideoElement>(null);

  useEffect(() => () => {
    if (video) URL.revokeObjectURL(video.objectUrl);
  }, [video]);

  async function uploadVideo(file: File) {
    const supabase = getBrowserClient();
    if (!supabase) return setError(ta("upload.errors.notConfigured"));
    if (file.size > VIDEO_MAX) {
      setTooLarge(true);
      return setError(null);
    }
    setTooLarge(false);
    setError(null);
    setVideoStatus("uploading");
    const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
    const path = `workouts/${crypto.randomUUID()}-${safe}`;
    const { error: err } = await supabase.storage.from("videos").upload(path, file, { upsert: false, contentType: file.type || "video/mp4" });
    if (err) {
      setVideoStatus("error");
      return setError(ta("upload.errors.failed"));
    }
    setVideo({ path, name: file.name, objectUrl: URL.createObjectURL(file), size: file.size });
    setVideoStatus("idle");
    const base = file.name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
    if (!title) setTitle(base);
  }

  async function uploadPosterBlob(blob: Blob, name: string) {
    const supabase = getBrowserClient();
    if (!supabase) return setError(ta("upload.errors.notConfigured"));
    if (blob.size > IMAGE_MAX) return setError(ta("upload.errors.tooLarge"));
    setError(null);
    setPosterStatus("uploading");
    const path = `workouts/${crypto.randomUUID()}-${name}`;
    const { error: err } = await supabase.storage.from("covers").upload(path, blob, { upsert: false, contentType: blob.type || "image/jpeg" });
    if (err) {
      setPosterStatus("error");
      return setError(ta("upload.errors.failed"));
    }
    setPoster(supabase.storage.from("covers").getPublicUrl(path).data.publicUrl);
    setPosterStatus("idle");
  }

  function grabFrame() {
    const v = previewVideo.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1280 / v.videoWidth);
    canvas.width = Math.round(v.videoWidth * scale);
    canvas.height = Math.round(v.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(v, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => blob && void uploadPosterBlob(blob, "frame.jpg"), "image/jpeg", 0.86);
  }

  const busy = videoStatus === "uploading" || posterStatus === "uploading";

  return (
    <form action={action} className="space-y-5" aria-busy={pending}>
      <input type="hidden" name="video_path" value={video?.path ?? ""} />
      <input type="hidden" name="poster_url" value={poster ?? ""} />
      <input type="hidden" name="language" value={defaultLanguage} />
      <input type="hidden" name="category" value={category} />
      <input type="hidden" name="level" value={level} />
      <input ref={videoInput} type="file" accept="video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => e.target.files?.[0] && void uploadVideo(e.target.files[0])} />
      <input ref={imageInput} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => e.target.files?.[0] && void uploadPosterBlob(e.target.files[0], e.target.files[0].name.toLowerCase().replace(/[^a-z0-9.]+/g, "-"))} />

      {/* 1. Video */}
      <section className="card overflow-hidden">
        {video ? (
          <div className="relative bg-black">
            <video ref={previewVideo} src={video.objectUrl} muted playsInline preload="metadata" className="aspect-video w-full" onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration)} />
            <div className="absolute top-3 left-3 flex items-center gap-2 rounded-full border border-white/40 bg-ink/50 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              {video.name} · {(video.size / 1024 / 1024).toFixed(1)} MB
            </div>
            <button type="button" onClick={() => setVideo(null)} aria-label={ta("upload.remove")} className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-ink/50 text-white backdrop-blur-md">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => videoInput.current?.click()} disabled={busy} className="hover:bg-frost/60 flex w-full flex-col items-center gap-3 px-6 py-10 text-center transition-colors">
            {videoStatus === "uploading" ? <Loader2 className="text-accent h-8 w-8 animate-spin" aria-hidden /> : <span className="bg-accent-soft text-accent inline-flex h-14 w-14 items-center justify-center rounded-full"><Film className="h-6 w-6" strokeWidth={1.8} aria-hidden /></span>}
            <span className="text-ink text-sm font-semibold">{videoStatus === "uploading" ? ta("upload.uploading") : t("pickVideo")}</span>
            <span className="text-steel text-xs">{ta("upload.hint")}</span>
            {videoStatus === "uploading" ? <ProgressBar percent={100} className="w-48" label={ta("upload.uploading")} /> : null}
          </button>
        )}
      </section>

      {/* 2. Title and details */}
      <section className="card space-y-4 p-5">
        <Field label={t("title")}>
          <Input name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={120} placeholder={t("titlePlaceholder")} />
        </Field>
        <Field label={t("description")} hint={t("optional")}>
          <Textarea name="description" rows={3} maxLength={600} />
        </Field>
        <div>
          <span className="eyebrow mb-2 block">{t("category")}</span>
          <div className="scroll-row -mx-5 flex gap-2 overflow-x-auto px-5">
            {categoryIds.map((c) => (
              <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={category === c} className={cn("inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors", category === c ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
                {tl(`categories.${c}`)}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label={t("duration")}>
            <Input name="duration_min" type="number" min={1} max={240} value={duration} onChange={(e) => setDuration(Number(e.target.value) || 0)} required />
          </Field>
          <Field label={t("level")}>
            <Select value={level} onChange={(e) => setLevel(e.target.value as (typeof levels)[number])}>
              {levels.map((l) => (
                <option key={l} value={l}>
                  {tl(`levels.${l}`)}
                </option>
              ))}
            </Select>
          </Field>
          {isAdmin ? (
            <Field label={ta("fields.author")}>
              <Select name="author_id" defaultValue={authors[0]?.id ?? ""}>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : null}
        </div>
        <fieldset>
          <legend className="eyebrow mb-2">{ta("fields.equipment")}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {equipmentIds.map((e) => (
              <Checkbox key={e} name={`equipment_${e}`} label={tl(`equipment.${e}`)} />
            ))}
          </div>
        </fieldset>
        <Field label={ta("fields.safety")} hint={ta("fields.safetyHint")}>
          <Textarea name="safety" rows={2} maxLength={600} />
        </Field>
        <fieldset>
          <legend className="eyebrow mb-2">{ta("fields.goals")}</legend>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {goals.map((g) => (
              <Checkbox key={g} name={`goal_${g}`} label={tl(`goals.${g}`)} />
            ))}
          </div>
        </fieldset>
        <Field label={ta("fields.access")}>
          <Select name="access" defaultValue="free">
            <option value="free">{ta("access.free")}</option>
            <option value="premium">{ta("access.premium")}</option>
          </Select>
        </Field>
      </section>

      {/* 3. Cover */}
      <section className="card space-y-4 p-5">
        <div className="flex items-center justify-between">
          <span className="eyebrow">{t("cover")}</span>
          {posterStatus === "uploading" ? <Loader2 className="text-accent h-4 w-4 animate-spin" aria-hidden /> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => imageInput.current?.click()} disabled={busy} className="border-ink/10 text-ink hover:bg-white inline-flex h-10 items-center gap-2 rounded-full border bg-white/70 px-4 text-sm font-semibold">
            <ImagePlus className="h-4 w-4" aria-hidden />
            {t("coverUpload")}
          </button>
          {video ? (
            <button type="button" onClick={grabFrame} disabled={busy} className="border-ink/10 text-ink hover:bg-white inline-flex h-10 items-center gap-2 rounded-full border bg-white/70 px-4 text-sm font-semibold">
              <Scissors className="h-4 w-4" aria-hidden />
              {t("coverFromVideo")}
            </button>
          ) : null}
          {poster ? (
            <button type="button" onClick={() => setPoster(null)} className="text-steel inline-flex h-10 items-center gap-1 rounded-full px-3 text-sm font-semibold hover:text-ink">
              <X className="h-4 w-4" aria-hidden />
              {ta("upload.remove")}
            </button>
          ) : null}
        </div>
        {video && videoDuration > 0 ? (
          <label className="block">
            <span className="text-steel mb-1 block text-xs">{t("frameAt", { seconds: Math.round(frameAt) })}</span>
            <input
              type="range"
              min={0}
              max={Math.max(1, Math.floor(videoDuration))}
              step={0.5}
              value={frameAt}
              onChange={(e) => {
                const v = Number(e.target.value);
                setFrameAt(v);
                if (previewVideo.current) previewVideo.current.currentTime = v;
              }}
              className="accent-accent w-full"
            />
          </label>
        ) : null}
        <p className="text-steel text-xs">{t("coverHint")}</p>
      </section>

      {/* 4. Preview */}
      <section className="space-y-2">
        <span className="eyebrow">{t("preview")}</span>
        <div className="max-w-[220px]">
          <Cover tone="deep" ratio="aspect-[4/5]" label={tl(`categories.${category}`)} imageSrc={poster ?? undefined}>
            <div className="flex h-full flex-col justify-end p-4">
              <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-md">
                <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
              </span>
              <h3 className="text-frost text-[15px] leading-snug font-bold">{title || t("titlePlaceholder")}</h3>
              <p className="text-mist mt-1 text-xs font-medium">
                {tc("minutes", { count: duration || 0 })} · {tl(`levels.${level}`)}
              </p>
            </div>
          </Cover>
        </div>
      </section>

      {tooLarge ? (
        <div role="alert" className="rounded-2xl border border-[#e8c48a]/70 bg-[#fdf6ea] px-4 py-3 text-sm text-[#7a5418]">
          <p className="font-semibold">{t("tooLargeTitle")}</p>
          <p className="mt-1">{t("tooLargeBody")}</p>
          <Link href="/admin/workouts" className="mt-2 inline-block font-semibold underline">
            {t("tooLargeAction")}
          </Link>
        </div>
      ) : null}
      {error ? <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">{error}</p> : null}
      {state.error ? <p role="alert" className="rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] px-4 py-3 text-sm text-[#8a2f2f]">{ta(`errors.${state.error}`)}</p> : null}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="mode" value="publish" size="lg" disabled={pending || busy || !video} className="flex-1 sm:flex-none">
          {pending ? t("publishing") : t("publish")}
        </Button>
        <Button type="submit" name="mode" value="draft" variant="secondary" size="lg" disabled={pending || busy} className="flex-1 sm:flex-none">
          {t("saveDraft")}
        </Button>
      </div>
      <p className="text-steel text-xs">{t("note")}</p>
    </form>
  );
}
