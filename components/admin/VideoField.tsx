"use client";

import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { CheckCircle2, Loader2, UploadCloud, X } from "lucide-react";
import type { VideoSource } from "@/lib/content/types";
import { getBrowserClient } from "@/lib/supabase/client";
import { Field, Input, Select } from "./fields";

interface VideoFieldProps {
  /** Form field prefix: "video" or "attachment_video" */
  name?: string;
  /** Storage folder: workouts | lessons | posts */
  folder: string;
  value: VideoSource;
}

const MAX_BYTES = 50 * 1024 * 1024;

/**
 * Video source picker with direct upload to Supabase Storage.
 * Writes hidden inputs the server action reads: <name>_kind, <name>_path, <name>_src, <name>_poster.
 */
export function VideoField({ name = "video", folder, value }: VideoFieldProps) {
  const t = useTranslations("admin");
  const [kind, setKind] = useState<string>(value?.kind ?? "none");
  const [path, setPath] = useState<string>(value?.kind === "storage" ? value.path : "");
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">(path ? "done" : "idle");
  const [errorKey, setErrorKey] = useState<"tooLarge" | "failed" | "notConfigured" | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    const supabase = getBrowserClient();
    if (!supabase) {
      setErrorKey("notConfigured");
      setStatus("error");
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorKey("tooLarge");
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setErrorKey(null);
    const safeName = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/^-+|-+$/g, "");
    const objectPath = `${folder}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from("videos").upload(objectPath, file, { upsert: false, contentType: file.type || "video/mp4" });
    if (error) {
      setErrorKey("failed");
      setStatus("error");
      return;
    }
    setPath(objectPath);
    setStatus("done");
  }

  return (
    <section className="card grid gap-5 p-5 sm:grid-cols-2">
      <Field label={t("fields.videoKind")} hint={t("fields.videoHint")} className="sm:col-span-2">
        <Select name={`${name}_kind`} value={kind} onChange={(e) => setKind(e.target.value)}>
          <option value="none">{t("video.none")}</option>
          <option value="storage">{t("video.storage")}</option>
          <option value="file">{t("video.file")}</option>
          <option value="hls">{t("video.hls")}</option>
          <option value="youtube">{t("video.youtube")}</option>
        </Select>
      </Field>

      {kind === "storage" ? (
        <div className="sm:col-span-2">
          <input type="hidden" name={`${name}_path`} value={path} />
          <input ref={fileRef} type="file" accept="video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => e.target.files?.[0] && void upload(e.target.files[0])} />
          <div className="border-ink/10 flex flex-wrap items-center gap-3 rounded-2xl border border-dashed bg-white/60 p-4">
            {status === "done" && path ? (
              <>
                <CheckCircle2 className="text-mint-deep h-5 w-5 shrink-0" aria-hidden />
                <span className="text-ink min-w-0 flex-1 truncate text-sm font-semibold">{path.split("/").pop()}</span>
                <button
                  type="button"
                  onClick={() => {
                    setPath("");
                    setStatus("idle");
                  }}
                  className="text-steel hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full"
                  aria-label={t("upload.remove")}
                >
                  <X className="h-4 w-4" aria-hidden />
                </button>
              </>
            ) : status === "uploading" ? (
              <>
                <Loader2 className="text-accent h-5 w-5 shrink-0 animate-spin" aria-hidden />
                <span className="text-steel text-sm">{t("upload.uploading")}</span>
              </>
            ) : (
              <>
                <UploadCloud className="text-accent h-5 w-5 shrink-0" aria-hidden />
                <span className="text-steel flex-1 text-sm">{t("upload.hint")}</span>
                <button type="button" onClick={() => fileRef.current?.click()} className="border-ink/10 text-ink inline-flex h-10 items-center rounded-full border bg-white px-4 text-sm font-semibold hover:bg-frost">
                  {t("upload.choose")}
                </button>
              </>
            )}
          </div>
          {status === "error" && errorKey ? <p className="mt-2 text-sm text-danger">{t(`upload.errors.${errorKey}`)}</p> : null}
        </div>
      ) : null}

      {kind === "file" || kind === "hls" ? (
        <Field label={t("fields.videoSrc")} className="sm:col-span-2">
          <Input name={`${name}_src`} type="url" defaultValue={value && (value.kind === "file" || value.kind === "hls") ? value.src : ""} placeholder="https://" />
        </Field>
      ) : null}

      {kind === "youtube" ? (
        <Field label={t("fields.youtubeLink")} hint={t("fields.youtubeHint")} className="sm:col-span-2">
          <Input name={`${name}_src`} defaultValue={value?.kind === "youtube" ? `https://www.youtube.com/watch?v=${value.id}` : ""} placeholder="https://www.youtube.com/watch?v=…" />
        </Field>
      ) : null}

      {kind !== "none" ? (
        <Field label={t("fields.videoPoster")} className="sm:col-span-2">
          <Input name={`${name}_poster`} type="url" defaultValue={value?.poster ?? ""} placeholder="https://" />
        </Field>
      ) : null}
    </section>
  );
}
