import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { Eye, EyeOff, MessageSquare, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { deleteComment, setCommentHidden } from "@/lib/social/actions";
import { listRecentComments } from "@/lib/social/queries";

/** Moderation: latest comments, hide or delete. */
export default async function AdminCommentsPage() {
  const t = await getTranslations("admin");
  const ts = await getTranslations("social");
  const format = await getFormatter();
  const comments = await listRecentComments();
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("nav.comments")} lead={t("commentsIntro")} />
      {comments.length === 0 ? (
        <EmptyState icon={MessageSquare} title={t("emptyList")} body={t("commentsIntro")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {comments.map((c) => (
            <li key={c.id} className={c.hidden ? "flex items-start gap-4 px-5 py-4 opacity-60" : "flex items-start gap-4 px-5 py-4"}>
              <div className="min-w-0 flex-1">
                <p className="text-ink text-sm font-semibold">
                  {c.authorName ?? ts("member")} <span className="text-steel font-normal">· {format.dateTime(new Date(c.createdAt), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </p>
                <p className="text-text mt-1 text-sm whitespace-pre-line">{c.body}</p>
                <Link href={c.targetType === "post" ? `/posts/${c.targetId}` : `/library`} className="text-accent mt-1 inline-block text-xs font-semibold hover:underline">
                  {c.targetType === "post" ? t("nav.posts") : t("nav.workouts")}
                </Link>
              </div>
              <div className="flex shrink-0 gap-1">
                <form action={setCommentHidden}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="hidden" value={c.hidden ? "false" : "true"} />
                  <button type="submit" aria-label={c.hidden ? t("unhide") : t("hide")} className="text-steel hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-frost">
                    {c.hidden ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
                  </button>
                </form>
                <form action={deleteComment}>
                  <input type="hidden" name="id" value={c.id} />
                  <input type="hidden" name="path" value="/admin/comments" />
                  <button type="submit" aria-label={t("delete")} className="text-steel inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-danger-soft hover:text-danger">
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
