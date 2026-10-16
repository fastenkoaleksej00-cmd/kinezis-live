import { FeatureTip } from "@/components/onboarding/FeatureTip";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { MessagesSquare, PenSquare, Search, ShieldCheck, X } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listCommunityPosts, parseCommunityFilter, type CommunityFilter } from "@/lib/community/queries";
import { communityTopics, postTypes } from "@/lib/community/types";
import { getPublicMembers } from "@/lib/profile/public";
import { getSocialCounts } from "@/lib/social/queries";
import { getSessionUser } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function href(f: CommunityFilter, patch: Partial<CommunityFilter>): string {
  const n = { ...f, ...patch };
  const q = new URLSearchParams();
  if (n.topic) q.set("topic", n.topic);
  if (n.type) q.set("type", n.type);
  if (n.tag) q.set("tag", n.tag);
  if (n.q) q.set("q", n.q);
  if (n.sort === "best") q.set("sort", "best");
  const s = q.toString();
  return s ? `/community?${s}` : "/community";
}

/** Community hub: members' stories, questions and tips by topic, with search and "most helpful" sorting. */
export default async function CommunityPage({ searchParams }: PageProps) {
  const t = await getTranslations("community");
  const sp = await searchParams;
  const f = parseCommunityFilter(sp);
  const [posts, user] = await Promise.all([listCommunityPosts(f), getSessionUser()]);
  const [members, social] = await Promise.all([getPublicMembers(posts.map((p) => p.userId ?? "").filter(Boolean)), getSocialCounts("post", posts.map((p) => p.id))]);
  const chip = (active: boolean) => cn("inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors", active ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white");

  return (
    <Container as="section" className="max-w-[860px] space-y-5 py-4 sm:py-8">
      <Reveal>
        <SectionHeading
          as="h1"
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("lead")}
          action={
            user ? (
              <Link href="/compose" className={buttonStyles("primary", "md")}>
                <PenSquare className="h-4 w-4" aria-hidden />
                {t("write")}
              </Link>
            ) : undefined
          }
        />
      </Reveal>
      <FeatureTip id="community" />
      {sp.posted ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("posted")}</p> : null}
      {sp.review ? <p className="rounded-2xl border border-warning-line/70 bg-warning-soft px-4 py-3 text-sm text-warning">{t("flagged")}</p> : null}

      <Reveal delay={0.03}>
        <form action="/community" className="card flex items-center gap-2 px-3 py-2">
          <Search className="text-steel h-4 w-4 shrink-0" aria-hidden />
          {f.topic ? <input type="hidden" name="topic" value={f.topic} /> : null}
          {f.type ? <input type="hidden" name="type" value={f.type} /> : null}
          {f.sort === "best" ? <input type="hidden" name="sort" value="best" /> : null}
          <input name="q" defaultValue={f.q ?? ""} maxLength={80} placeholder={t("searchPlaceholder")} className="text-ink min-w-0 flex-1 bg-transparent py-1.5 text-sm outline-none" aria-label={t("searchPlaceholder")} />
          {f.q ? (
            <Link href={href(f, { q: undefined })} aria-label={t("clear")} className="text-steel hover:text-ink inline-flex h-8 w-8 items-center justify-center rounded-full">
              <X className="h-4 w-4" aria-hidden />
            </Link>
          ) : null}
        </form>
      </Reveal>

      <Reveal delay={0.05} className="space-y-2">
        <div className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          <Link href={href(f, { topic: undefined })} scroll={false} className={chip(!f.topic)}>
            {t("allTopics")}
          </Link>
          {communityTopics.map((c) => (
            <Link key={c} href={href(f, { topic: c })} scroll={false} className={chip(f.topic === c)}>
              {t(`topics.${c}`)}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href={href(f, { type: undefined })} scroll={false} className={chip(!f.type)}>
            {t("allTypes")}
          </Link>
          {postTypes.map((p) => (
            <Link key={p} href={href(f, { type: p })} scroll={false} className={chip(f.type === p)}>
              {t(`typesPlural.${p}`)}
            </Link>
          ))}
          <span className="mx-1 hidden h-5 w-px bg-current opacity-10 sm:block" aria-hidden />
          <Link href={href(f, { sort: "new" })} scroll={false} className={chip(f.sort === "new")}>
            {t("sortNew")}
          </Link>
          <Link href={href(f, { sort: "best" })} scroll={false} className={chip(f.sort === "best")}>
            {t("sortBest")}
          </Link>
        </div>
        {f.tag ? (
          <Link href={href(f, { tag: undefined })} className="text-accent inline-flex items-center gap-1 text-sm font-semibold">
            #{f.tag}
            <X className="h-3.5 w-3.5" aria-hidden />
          </Link>
        ) : null}
      </Reveal>

      <div className="space-y-4">
        {posts.length === 0 ? (
          <EmptyState icon={MessagesSquare} illustration="community" title={f.q || f.topic || f.type || f.tag ? t("emptyFiltered") : t("emptyTitle")} body={t("emptyBody")} />
        ) : (
          posts.map((post, i) => (
            <Reveal key={post.id} delay={Math.min(i, 4) * 0.04}>
              <PostCard post={post} social={social[post.id]} signedIn={Boolean(user)} member={post.userId ? (members[post.userId] ?? null) : null} viewerId={user?.id ?? null} />
            </Reveal>
          ))
        )}
      </div>

      <Reveal delay={0.1}>
        <div className="card flex items-start gap-3 p-5 text-sm">
          <ShieldCheck className="text-mint-deep mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <div>
            <p className="text-ink font-semibold">{t("rulesTitle")}</p>
            <ul className="text-steel mt-1 list-disc space-y-1 pl-4">
              <li>{t("rulesList.1")}</li>
              <li>{t("rulesList.2")}</li>
              <li>{t("rulesList.3")}</li>
              <li>{t("rulesList.4")}</li>
            </ul>
          </div>
        </div>
      </Reveal>
    </Container>
  );
}
