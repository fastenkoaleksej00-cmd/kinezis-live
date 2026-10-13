"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { deletePost, savePost, type AdminState } from "@/lib/admin/actions";
import type { AuthorRow, PostRow, WorkoutRow } from "@/lib/content/db";
import { Checkbox, Field, Input, LocalizedInputs, Select } from "./fields";
import { SubmitRow } from "./SubmitRow";

interface PostFormProps {
  post?: PostRow | null;
  authors: AuthorRow[];
  workouts: Pick<WorkoutRow, "id" | "title" | "published">[];
}

const initial: AdminState = {};
const kinds = ["news", "tip", "session", "video", "photo"] as const;

export function PostForm({ post, authors, workouts }: PostFormProps) {
  const t = useTranslations("admin");
  const tf = useTranslations("feed");
  const [state, action, pending] = useActionState(savePost, initial);
  const att = post?.attachment ?? null;
  const [attKind, setAttKind] = useState<string>(att?.kind ?? "none");

  return (
    <form action={action} className="space-y-6" aria-busy={pending}>
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      {post?.published_at ? <input type="hidden" name="published_at_prev" value={post.published_at} /> : null}

      <section className="card space-y-5 p-5">
        <Field label={t("fields.kind")}>
          <Select name="kind" defaultValue={post?.kind ?? "news"}>
            {kinds.map((k) => (
              <option key={k} value={k}>
                {tf(`kinds.${k}`)}
              </option>
            ))}
          </Select>
        </Field>
        <LocalizedInputs name="title" label={t("fields.title")} value={post?.title} />
        <LocalizedInputs name="body" label={t("fields.body")} value={post?.body} required multiline />
      </section>

      <section className="card space-y-5 p-5">
        <Field label={t("fields.attachment")}>
          <Select name="attachment_kind" value={attKind} onChange={(e) => setAttKind(e.target.value)}>
            <option value="none">{t("attachment.none")}</option>
            <option value="photo">{t("attachment.photo")}</option>
            <option value="video">{t("attachment.video")}</option>
            <option value="workout">{t("attachment.workout")}</option>
          </Select>
        </Field>

        {attKind === "photo" || attKind === "video" ? (
          <Field label={t("fields.coverTone")}>
            <Select name="attachment_tone" defaultValue={att && "coverTone" in att ? att.coverTone : "deep"}>
              <option value="deep">{t("tones.deep")}</option>
              <option value="light">{t("tones.light")}</option>
              <option value="mint">{t("tones.mint")}</option>
            </Select>
          </Field>
        ) : null}

        {attKind === "photo" ? (
          <>
            <Field label={t("fields.photoSrc")} hint={t("fields.photoHint")}>
              <Input name="attachment_photo_src" type="url" defaultValue={att?.kind === "photo" ? (att.src ?? "") : ""} placeholder="https://" />
            </Field>
            <LocalizedInputs name="attachment_alt" label={t("fields.photoAlt")} value={att?.kind === "photo" ? att.alt : undefined} />
          </>
        ) : null}

        {attKind === "video" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label={t("fields.videoKind")} className="sm:col-span-2">
              <Select name="attachment_video_kind" defaultValue={att?.kind === "video" && att.source ? att.source.kind : "none"}>
                <option value="none">{t("video.none")}</option>
                <option value="file">{t("video.file")}</option>
                <option value="hls">{t("video.hls")}</option>
              </Select>
            </Field>
            <Field label={t("fields.videoSrc")}>
              <Input name="attachment_video_src" type="url" defaultValue={att?.kind === "video" && att.source ? att.source.src : ""} placeholder="https://" />
            </Field>
            <Field label={t("fields.videoDuration")}>
              <Input name="attachment_duration" type="number" min={1} defaultValue={att?.kind === "video" ? (att.durationSec ?? "") : ""} />
            </Field>
          </div>
        ) : null}

        {attKind === "workout" ? (
          <Field label={t("fields.linkedWorkout")}>
            <Select name="attachment_workout_id" defaultValue={att?.kind === "workout" ? att.workoutId : ""}>
              <option value="">—</option>
              {workouts.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.title.en}
                  {w.published ? "" : ` (${t("status.draft")})`}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
      </section>

      <section className="card grid gap-5 p-5 sm:grid-cols-2">
        <Field label={t("fields.author")}>
          <Select name="author_id" defaultValue={post?.author_id ?? authors[0]?.id ?? ""}>
            {authors.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t("fields.language")} hint={t("fields.languageHint")}>
          <Select name="language" defaultValue={post?.language ?? "uk"}>
            <option value="uk">Українська</option>
            <option value="en">English</option>
            <option value="de">Deutsch</option>
          </Select>
        </Field>
        <Field label={t("fields.access")} hint={t("fields.accessHint")}>
          <Select name="access" defaultValue={post?.access ?? "free"}>
            <option value="free">{t("access.free")}</option>
            <option value="premium">{t("access.premium")}</option>
          </Select>
        </Field>
        <div className="flex flex-col justify-end gap-2.5">
          <Checkbox name="reactions_enabled" label={t("fields.reactions")} defaultChecked={post?.reactions_enabled ?? true} />
          <Checkbox name="comments_enabled" label={t("fields.comments")} defaultChecked={post?.comments_enabled ?? true} />
        </div>
      </section>

      <section className="card p-5">
        <Checkbox name="published" label={t("fields.published")} defaultChecked={post?.published ?? false} />
        <p className="text-steel mt-1.5 text-xs">{t("fields.publishedHint")}</p>
      </section>

      <SubmitRow pending={pending} error={state.error} deleteAction={post ? deletePost : undefined} id={post?.id} />
    </form>
  );
}
