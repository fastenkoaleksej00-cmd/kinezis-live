import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Play } from "lucide-react";
import { SaveButton } from "@/components/library/SaveButton";
import { Cover } from "@/components/ui/Cover";
import { pick } from "@/lib/content/localize";
import type { Post } from "@/lib/content/types";
import { getAuthor, getWorkoutById } from "@/lib/content/workouts";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { resolveVideo } from "@/lib/video/resolve";
import { formatTime } from "@/lib/format";
import { postKey } from "@/lib/store/keys";
import { AuthorRow } from "./AuthorRow";
import { LikeButton } from "@/components/social/LikeButton";
import { MessageCircle } from "lucide-react";
import { getSocialCounts } from "@/lib/social/queries";
import { getSessionUser } from "@/lib/supabase/server";
import { getPublicMembers } from "@/lib/profile/public";
import { deleteOwnPost } from "@/lib/admin/actions";
import { BadgeCheck, Stethoscope, Trash2 } from "lucide-react";
import { redFlagText } from "@/lib/community/types";

interface PostCardProps {
  post: Post;
  /** Full body instead of a clamped preview */
  expanded?: boolean;
  /** Pre-fetched counts (lists pass them to avoid one query per card) */
  social?: { likes: number; comments: number; liked: boolean };
  signedIn?: boolean;
  /** Pre-fetched member info for community posts */
  member?: { displayName: string | null; avatarSrc: string | null } | null;
  viewerId?: string | null;
}

/** Feed card: author, kind label, text, attachment, save. Opens the post page. */
export async function PostCard({ post, expanded = false, social, signedIn, member, viewerId }: PostCardProps) {
  const locale = await getLocale();
  const t = await getTranslations("feed");
  const tl = await getTranslations("library");
  const tc = await getTranslations("common");
  const format = await getFormatter();
  const author = post.userId ? undefined : await getAuthor(post.authorId);
  const memberInfo = post.userId ? (member !== undefined ? member : ((await getPublicMembers([post.userId]))[post.userId] ?? null)) : null;
  const viewer = viewerId !== undefined ? viewerId : ((await getSessionUser())?.id ?? null);
  const mine = Boolean(post.userId && viewer && post.userId === viewer);
  const date = format.dateTime(new Date(post.publishedAt), { day: "numeric", month: "long" });
  const title = post.title ? pick(post.title, locale) : undefined;
  const workout = post.attachment?.kind === "workout" ? await getWorkoutById(post.attachment.workoutId) : undefined;
  const playable = expanded && post.attachment?.kind === "video" ? await resolveVideo(post.attachment.source) : null;
  const counts = social ?? (await getSocialCounts("post", [post.id]))[post.id];
  const isSignedIn = signedIn ?? Boolean(await getSessionUser());
  const ts = await getTranslations("social");
  const tcm = await getTranslations("community");
  const bodyText = pick(post.body, locale);
  const endorser = post.userId && post.endorsedBy ? await getAuthor(post.endorsedBy) : undefined;
  const redFlag = Boolean(post.userId && expanded && redFlagText(bodyText));

  return (
    <article className="card overflow-hidden">
      <div className="flex items-start justify-between gap-3 p-4 pb-3 sm:p-5 sm:pb-3">
        {post.userId ? (
          <Link href={`/members/${post.userId}`} className="flex min-w-0 items-center gap-3">
            <span className="section-deep text-frost inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold">
              {memberInfo?.avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={memberInfo.avatarSrc} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />
              ) : (
                (memberInfo?.displayName ?? t("member")).slice(0, 1).toUpperCase()
              )}
            </span>
            <span className="min-w-0">
              <span className="text-ink block truncate text-sm font-bold">
                {memberInfo?.displayName ?? t("member")} <span className="text-steel font-medium">· {t("community")}</span>
              </span>
              <span className="text-steel block text-xs">
                {date}
                {post.category ? ` · ${t(`categories.${post.category as "other"}`)}` : ""}
              </span>
            </span>
          </Link>
        ) : (
          <AuthorRow author={author} roleLabel={tl("trainer")} meta={`${date} · ${t(`kinds.${post.kind}`)}`} />
        )}
        <div className="flex shrink-0 items-center gap-1">
          {mine && expanded ? (
            <form action={deleteOwnPost}>
              <input type="hidden" name="id" value={post.id} />
              <button type="submit" aria-label={t("deleteOwn")} className="text-steel inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#fdf2f2] hover:text-[#8a2f2f]">
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </form>
          ) : null}
          <SaveButton itemKey={postKey(post.id)} look="solid" />
        </div>
      </div>

      {post.userId && (post.topic || post.postType || endorser) ? (
        <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2 sm:px-5">
          {post.postType ? <span className="bg-accent-soft text-accent inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold">{tcm(`types.${post.postType as "story"}`)}</span> : null}
          {post.topic ? (
            <Link href={`/community?topic=${post.topic}`} className="bg-mint-soft text-mint-deep inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold">
              {tcm(`topics.${post.topic as "general"}`)}
            </Link>
          ) : null}
          {endorser ? (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-[#e4f6f1] px-2.5 text-xs font-semibold text-[#2f7d70]">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden />
              {tcm("endorsedBy", { name: endorser.name })}
            </span>
          ) : (
            <span className="bg-bone-2 text-steel inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold">{tcm("personal")}</span>
          )}
        </div>
      ) : null}

      <div className="space-y-3 px-4 sm:px-5">
        {title ? (
          <h3 className="text-ink text-lg leading-snug font-bold">
            {expanded ? title : <Link href={`/posts/${post.id}`} className="hover:text-accent transition-colors">{title}</Link>}
          </h3>
        ) : null}
        <p className={expanded ? "text-text text-[15px] leading-relaxed whitespace-pre-line" : "text-text line-clamp-3 text-[15px] leading-relaxed"}>{bodyText}</p>
        {post.tags && post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-x-2 gap-y-1">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/community?tag=${encodeURIComponent(tag)}`} className="text-accent text-xs font-semibold hover:underline">
                #{tag}
              </Link>
            ))}
          </div>
        ) : null}
        {post.userId && expanded ? <p className="text-steel text-xs">{endorser ? tcm("endorsedNote") : tcm("personalNote")}</p> : null}
        {redFlag ? (
          <div className="flex items-start gap-3 rounded-2xl border border-[#e3b4b4] bg-[#fdf2f2] p-3 text-sm text-[#8a2f2f]">
            <Stethoscope className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{tcm("redFlag")}</p>
          </div>
        ) : null}
      </div>

      {post.attachment ? (
        <div className="p-4 pt-3 sm:p-5 sm:pt-3">
          {post.attachment.kind === "photo" ? (
            post.attachment.src ? (
              <div className="relative overflow-hidden rounded-2xl bg-frost">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.attachment.src} alt={pick(post.attachment.alt, locale)} className="max-h-[560px] w-full object-cover" loading="lazy" />
              </div>
            ) : (
              <Cover tone={post.attachment.coverTone} ratio="aspect-[4/3]" className="rounded-2xl" label={post.sample ? t("sample") : undefined} />
            )
          ) : null}
          {post.attachment.kind === "video" && !expanded ? (
            <Link href={`/posts/${post.id}`} className="block">
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
                <span className="absolute bottom-3 left-3 z-10 rounded-full border border-white/40 bg-white/15 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.18em] text-white uppercase backdrop-blur-md">{t("videoPending")}</span>
              ) : null}
            </Cover>
            </Link>
          ) : null}
          {post.attachment.kind === "video" && expanded ? (
            <VideoPlayer workoutId={`post:${post.id}`} source={playable} title={title ?? pick(post.body, locale).slice(0, 60)} />
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

      <div className="border-ink/8 flex items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          {post.reactionsEnabled && !post.sample ? <LikeButton targetType="post" targetId={post.id} likes={counts.likes} liked={counts.liked} signedIn={isSignedIn} /> : null}
          {post.commentsEnabled && !post.sample ? (
            <Link href={`/posts/${post.id}#comments`} className="border-ink/10 text-ink inline-flex h-9 items-center gap-1.5 rounded-full border bg-white/70 px-3 text-sm font-semibold hover:bg-white" aria-label={ts("commentsTitle")}>
              <MessageCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
              <span className="tabular-nums">{counts.comments}</span>
            </Link>
          ) : null}
          {post.sample ? <span className="text-steel text-xs">{t("sample")}</span> : null}
        </div>
        {!expanded ? (
          <Link href={`/posts/${post.id}`} className="text-accent inline-flex items-center gap-1 text-sm font-semibold hover:underline">
            {t("open")}
            <ArrowUpRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
