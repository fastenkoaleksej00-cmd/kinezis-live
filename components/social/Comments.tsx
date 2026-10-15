"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useActionState, useRef } from "react";
import { BadgeCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { addComment, deleteComment, type CommentState } from "@/lib/social/actions";
import type { CommentTarget, CommentView } from "@/lib/social/types";

interface CommentsProps {
  targetType: CommentTarget;
  targetId: string;
  path: string;
  comments: CommentView[];
  signedIn: boolean;
  staff: boolean;
  enabled: boolean;
  /** Preformatted dates keyed by comment id (server-side formatting) */
  dates: Record<string, string>;
}

const initial: CommentState = {};

export function Comments({ targetType, targetId, path, comments, signedIn, staff, enabled, dates }: CommentsProps) {
  const t = useTranslations("social");
  const [state, action, pending] = useActionState(addComment, initial);
  const formRef = useRef<HTMLFormElement>(null);
  if (state.ok && formRef.current) formRef.current.reset();

  return (
    <section className="space-y-4" aria-label={t("commentsTitle")}>
      <h2 className="text-ink text-lg font-bold">{t("commentsCount", { count: comments.length })}</h2>

      {comments.length === 0 ? <p className="text-steel text-sm">{enabled ? t("noComments") : t("commentsOff")}</p> : null}

      <ul className="space-y-3">
        {comments.map((c) => (
          <li key={c.id} className={c.hidden ? "card border-dashed p-4 opacity-60" : "card p-4"}>
            <div className="flex items-start gap-3">
              <span className="section-deep text-frost inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold">
                {c.authorAvatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.authorAvatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  (c.authorName ?? t("member")).slice(0, 1).toUpperCase()
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-x-1.5 text-sm">
                  <span className="text-ink font-semibold">{c.authorName ?? t("member")}</span>
                  {c.authorRole !== "user" ? (
                    <span className="text-accent inline-flex items-center gap-1 text-xs font-semibold">
                      <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
                      {t("trainer")}
                    </span>
                  ) : null}
                  <span className="text-steel text-xs">· {dates[c.id]}</span>
                  {c.hidden ? <span className="text-steel text-xs">· {t("hidden")}</span> : null}
                </p>
                <p className="text-text mt-1 text-[15px] leading-relaxed whitespace-pre-line">{c.body}</p>
              </div>
              {c.mine || staff ? (
                <form action={deleteComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="path" value={path} />
                  <button type="submit" aria-label={t("delete")} className="text-steel inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#fdf2f2] hover:text-[#8a2f2f]">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </form>
              ) : null}
            </div>
          </li>
        ))}
      </ul>

      {enabled ? (
        signedIn ? (
          <form ref={formRef} action={action} className="card space-y-3 p-4" aria-busy={pending}>
            <input type="hidden" name="target_type" value={targetType} />
            <input type="hidden" name="target_id" value={targetId} />
            <input type="hidden" name="path" value={path} />
            <textarea name="body" required maxLength={1000} rows={3} placeholder={t("placeholder")} className="text-ink placeholder:text-steel/60 w-full resize-none bg-transparent text-[15px] outline-none" />
            {state.error ? <p role="alert" className="text-sm text-[#8a2f2f]">{t(`errors.${state.error}`)}</p> : null}
            <div className="flex items-center justify-between gap-3">
              <span className="text-steel text-xs">{t("rules")}</span>
              <Button type="submit" size="sm" disabled={pending}>
                {t("send")}
              </Button>
            </div>
          </form>
        ) : (
          <div className="card flex flex-wrap items-center justify-between gap-3 p-4">
            <span className="text-steel text-sm">{t("signInToComment")}</span>
            <Link href="/auth/sign-in" className={buttonStyles("secondary", "sm")}>
              {t("signIn")}
            </Link>
          </div>
        )
      ) : null}
    </section>
  );
}
