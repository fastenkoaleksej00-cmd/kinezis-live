import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { Eye, EyeOff, Trash2, Users } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { deleteOwnPost, setPostHidden } from "@/lib/admin/postsActions";
import { listAllPosts } from "@/lib/admin/queries";
import { clearReview } from "@/lib/community/actions";
import { listFlaggedPosts } from "@/lib/community/queries";
import { ShieldAlert } from "lucide-react";
import { getPublicMembers } from "@/lib/profile/public";

/** Moderation of member posts: hide (keeps it for the author) or delete. */
export default async function AdminCommunityPage() {
  const t = await getTranslations("admin");
  const tf = await getTranslations("feed");
  const format = await getFormatter();
  const posts = (await listAllPosts()).filter((p) => p.user_id);
  const members = await getPublicMembers(posts.map((p) => p.user_id ?? ""));
  const flagged = await listFlaggedPosts();
  const tcm = await getTranslations("community");
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("nav.community")} lead={t("communityIntro")} />
      {flagged.length > 0 ? (
        <section className="space-y-2 rounded-3xl border border-warning-line/70 bg-warning-soft p-4">
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-warning">
            <ShieldAlert className="h-4 w-4" aria-hidden />
            {tcm("admin.flaggedTitle", { count: flagged.length })}
          </p>
          <ul className="space-y-2">
            {flagged.map((p) => (
              <li key={p.id} className="card flex flex-wrap items-center gap-3 px-4 py-3">
                <Link href={`/posts/${p.id}`} className="text-ink min-w-0 flex-1 truncate text-sm hover:underline">
                  {p.body.en.slice(0, 140)}
                </Link>
                <form action={clearReview}>
                  <input type="hidden" name="id" value={p.id} />
                  <button type="submit" className="text-mint-deep text-xs font-semibold hover:underline">
                    {tcm("admin.checked")}
                  </button>
                </form>
              </li>
            ))}
          </ul>
          <p className="text-xs text-warning">{tcm("admin.flaggedHint")}</p>
        </section>
      ) : null}
      {posts.length === 0 ? (
        <EmptyState icon={Users} illustration="community" title={t("emptyList")} body={t("communityIntro")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {posts.map((p) => {
            const m = p.user_id ? members[p.user_id] : undefined;
            return (
              <li key={p.id} className={p.hidden ? "flex items-start gap-4 px-5 py-4 opacity-60" : "flex items-start gap-4 px-5 py-4"}>
                <div className="min-w-0 flex-1">
                  <p className="text-ink text-sm font-semibold">
                    {m?.displayName ?? tf("member")} <span className="text-steel font-normal">· {format.dateTime(new Date(p.created_at), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                    {p.hidden ? <span className="text-steel font-normal"> · {t("status.hiddenPost")}</span> : null}
                  </p>
                  <p className="text-text mt-1 line-clamp-3 text-sm whitespace-pre-line">{p.body.en}</p>
                  <Link href={`/posts/${p.id}`} className="text-accent mt-1 inline-block text-xs font-semibold hover:underline">
                    {tf("open")}
                  </Link>
                </div>
                <div className="flex shrink-0 gap-1">
                  <form action={setPostHidden}>
                    <input type="hidden" name="id" value={p.id} />
                    <input type="hidden" name="hidden" value={p.hidden ? "false" : "true"} />
                    <button type="submit" aria-label={p.hidden ? t("unhide") : t("hide")} className="text-steel hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-frost">
                      {p.hidden ? <Eye className="h-4 w-4" aria-hidden /> : <EyeOff className="h-4 w-4" aria-hidden />}
                    </button>
                  </form>
                  <form action={deleteOwnPost}>
                    <input type="hidden" name="id" value={p.id} />
                    <button type="submit" aria-label={t("delete")} className="text-steel inline-flex h-9 w-9 items-center justify-center rounded-full hover:bg-danger-soft hover:text-danger">
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
