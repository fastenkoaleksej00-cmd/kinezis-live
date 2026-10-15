import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { Newspaper, Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listAllPosts } from "@/lib/admin/queries";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminPostsPage({ searchParams }: PageProps) {
  const t = await getTranslations("admin");
  const tf = await getTranslations("feed");
  const format = await getFormatter();
  const params = await searchParams;
  const posts = (await listAllPosts()).filter((p) => !p.user_id);

  return (
    <div className="space-y-5">
      <SectionHeading
        as="h1"
        title={t("nav.posts")}
        action={
          <Link href="/admin/posts/new" className={buttonStyles("primary", "md")}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("newPost")}
          </Link>
        }
      />
      {params.saved ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("savedNotice")}</p> : null}
      {params.deleted ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm font-semibold">{t("deletedNotice")}</p> : null}

      {posts.length === 0 ? (
        <EmptyState icon={Newspaper} title={t("emptyPostsTitle")} body={t("emptyPostsBody")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {posts.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/posts/${p.id}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate font-semibold">{p.title?.en ?? p.body.en.slice(0, 80)}</span>
                  <span className="text-steel block text-xs">
                    {tf(`kinds.${p.kind}`)} · {format.dateTime(new Date(p.updated_at), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </span>
                <StatusBadge published={p.published} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
