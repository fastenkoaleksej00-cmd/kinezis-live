import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Play } from "lucide-react";
import { SaveButton } from "@/components/library/SaveButton";
import { Cover } from "@/components/ui/Cover";
import { pick } from "@/lib/content/localize";
import type { Post } from "@/lib/content/types";
import { getAuthor, getWorkoutById } from "@/lib/content/workouts";
import { formatTime } from "@/lib/format";
import { postKey } from "@/lib/store/keys";
import { AuthorRow } from "./AuthorRow";

interface PostCardProps {
  post: Post;
  /** Full body instead of a clamped preview */
  expanded?: boolean;
}

/** Feed card: author, kind label, text, attachment, save. Opens the post page. */
export async function PostCard({ post, expanded = false }: PostCardProps) {
  const locale = await getLocale();
  const t = await getTranslations("feed");
  const tl = await getTranslations("library");
  const tc = await getTranslations("common");
  const format = await getFormatter();
  const author = getAuthor(post.authorId);
  const date = format.dateTime(new Date(post.publishedAt), { day: "numeric", month: "long" });
  const title = post.title ? pick(post.title, locale) : undefined;
  const workout = post.attachment?.kind === "workout" ? getWorkoutById(post.attachment.workoutId) : undefined;

  return (
    <article className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-3">
        <AuthorRow author={author} roleLabel={tl("trainer")} meta={`${date} · ${t(`kinds.${post.kind}`)}`} />
        <SaveButton itemKey={postKey(post.id)} look="solid" />
      </div>

      <div className="space-y-3 px-4 sm:px-5">
        {title ? (
          <h3 className="text-ink text-lg leading-snug font-bold">
            {expanded ? title : <Link href={`/posts/${post.id}`} className="hover:text-accent transition-colors">{title}</Link>}
          </h3>
        ) : null}
        <p className={expanded ? "text-text text-[15px] leading-relaxed" : "text-text line-clamp-3 text-[15px] leading-relaxed"}>{pick(post.body, locale)}</p>
      </div>

      {post.attachment ? (
        <div className="p-4 pt-3 sm:p-5 sm:pt-3">
          {post.attachment.kind === "photo" ? (
            <Cover tone={post.attachment.coverTone} ratio="aspect-[4/3]" className="rounded-2xl" label={post.sample ? t("sample") : undefined} />
          ) : null}
          {post.attachment.kind === "video" ? (
            <Cover tone={post.attachment.coverTone} ratio="aspect-video" className="rounded-2xl" label={t("kinds.video")}>
              <div className="flex h-full items-center justify-center">
                <span className={post.attachment.coverTone === "light" ? "text-ink inline-flex h-14 w-14 items-center justify-center rounded-full bg-white/85" : "inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/40 bg-white/15 text-white backdrop-blur-md"}>
                  <Play className="ml-0.5 h-5 w-5" fill="currentColor" aria-hidden />
                </span>
              </div>
              {post.attachment.durationSec ? (
                <span className="glass-dark absolute right-3 bottom-3 z-10 rounded-full px-2.5 py-1 text-xs font-semibold text-white">{formatTime(post.attachment.durationSec)}</span>
              ) : null}
              {!post.attachment.source ? (
                <span className="absolute bottom-3 left-3 z-10 rounded-full border border-white/40 bg-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-md">{t("videoPending")}</span>
              ) : null}
            </Cover>
          ) : null}
          {workout ? (
            <Link href={`/library/${workout.slug}`} className="group border-ink/8 bg-frost/70 hover:bg-frost flex items-center gap-3 rounded-2xl border p-3 transition-colors">
              <span className={`cover ${workout.coverTone === "mint" ? "cover-mint" : workout.coverTone === "light" ? "cover-light" : ""} relative h-14 w-14 shrink-0 rounded-xl`}>
                <span className="absolute inset-0 z-10 flex items-center justify-center text-white">
                  <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-ink block truncate text-sm font-bold">{pick(workout.title, locale)}</span>
                <span className="text-steel block text-xs">
                  {tl(`categories.${workout.category}`)} · {tc("minutes", { count: workout.durationMin })}
                </span>
              </span>
              <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 transition-colors" aria-hidden />
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="h-4 sm:h-5" />
      )}

      {!expanded ? (
        <div className="border-ink/8 flex items-center justify-between border-t px-4 py-3 sm:px-5">
          <span className="text-steel text-xs">{post.sample ? t("sample") : ""}</span>
          <Link href={`/posts/${post.id}`} className="text-accent inline-flex items-center gap-1 text-sm font-semibold hover:underline">
            {t("open")}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      ) : null}
    </article>
  );
}
