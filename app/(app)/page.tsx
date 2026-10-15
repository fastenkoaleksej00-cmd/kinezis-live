import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Play } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { QuickPostButton } from "@/components/feed/QuickPostButton";
import { PremiumBanner } from "@/components/premium/PremiumBanner";
import { ContinueCard } from "@/components/home/ContinueCard";
import { RemindersCard } from "@/components/home/RemindersCard";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick, toCardData } from "@/lib/content/localize";
import { listPosts, type FeedFilter } from "@/lib/content/posts";
import { getPublicMembers } from "@/lib/profile/public";
import { cn } from "@/lib/utils";
import { getTodayWorkout, listWorkouts } from "@/lib/content/workouts";
import { getMyProfile } from "@/lib/profile/queries";
import { getSocialCounts } from "@/lib/social/queries";
import { getSessionUser } from "@/lib/supabase/server";

/** Home, feed-first: today's session, continue, then the trainer feed. */
interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const sp = await searchParams;
  const feed: FeedFilter = sp.feed === "trainer" || sp.feed === "community" ? sp.feed : "all";
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const tl = await getTranslations("library");
  const locale = await getLocale();
  const [allWorkouts, today, posts, user, profile] = await Promise.all([listWorkouts(), getTodayWorkout(), listPosts(undefined, feed), getSessionUser(), getMyProfile()]);
  const members = await getPublicMembers(posts.map((p) => p.userId ?? "").filter(Boolean));
  const tf = await getTranslations("feed");
  const workouts = allWorkouts.map((w) => toCardData(w, locale));
  const social = await getSocialCounts("post", posts.map((p) => p.id));

  return (
    <Container as="section" className="space-y-8 py-6 sm:py-8">
      {sp.posted ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("posted")}</p> : null}
      {sp.deleted ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm font-semibold">{tf("deletedNotice")}</p> : null}
      <Reveal>
        <p className="eyebrow mb-2">{t("greeting")}</p>
        <h1 className="text-[1.9rem] leading-[1.05] font-extrabold sm:text-[2.4rem]">{t("intro")}</h1>
      </Reveal>

      {today ? (
        <Reveal delay={0.08}>
          <Link href={`/library/${today.slug}`} className="group block">
            <Cover tone={today.coverTone} ratio="aspect-[4/3] sm:aspect-[21/9]" label={t("todayEyebrow")}>
              <div className="flex h-full flex-col justify-end p-5 sm:p-7">
                <p className={today.coverTone === "light" ? "text-steel text-[11px] font-semibold tracking-[0.3em] uppercase" : "text-glow text-[11px] font-semibold tracking-[0.3em] uppercase"}>
                  {tl(`categories.${today.category}`)}
                </p>
                <h2 className={today.coverTone === "light" ? "text-ink mt-1.5 text-2xl leading-tight font-bold sm:text-3xl" : "text-frost mt-1.5 text-2xl leading-tight font-bold sm:text-3xl"}>
                  {pick(today.title, locale)}
                </h2>
                <p className={today.coverTone === "light" ? "text-steel mt-2 max-w-md text-sm sm:text-base" : "text-mist mt-2 max-w-md text-sm sm:text-base"}>
                  {tc("minutes", { count: today.durationMin })} · {tl(`levels.${today.level}`)}
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <span className={today.coverTone === "light" ? "text-ink inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/85 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5" : "inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5"}>
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" aria-hidden />
                  </span>
                  <span className={today.coverTone === "light" ? "text-ink text-sm font-semibold" : "text-frost text-sm font-semibold"}>{tl("start")}</span>
                </div>
              </div>
            </Cover>
          </Link>
        </Reveal>
      ) : null}

      {profile ? (
        <Reveal delay={0.09}>
          <RemindersCard reminders={profile.reminders} />
        </Reveal>
      ) : null}

      <Reveal delay={0.1}>
        <PremiumBanner user={user} />
      </Reveal>

      <Reveal delay={0.12} as="section" className="space-y-4">
        <SectionHeading
          title={t("continueTitle")}
          action={
            <Link href="/library" className={buttonStyles("secondary", "sm")}>
              {tc("open")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <ContinueCard workouts={workouts} />
      </Reveal>

      <section className="space-y-4">
        <Reveal delay={0.16}>
          <SectionHeading title={feed === "community" ? tf("filters.community") : t("feedTitle")} />
          <div className="scroll-row -mx-4 mt-3 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {(["all", "trainer", "community"] as const).map((f) => (
              <Link key={f} href={f === "all" ? "/" : `/?feed=${f}`} scroll={false} className={cn("inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-colors", feed === f ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white")}>
                {tf(`filters.${f}`)}
              </Link>
            ))}
          </div>
        </Reveal>
        <div className="mx-auto max-w-[720px] space-y-4">
          {posts.length === 0 && feed === "community" ? <p className="card text-steel px-5 py-4 text-sm">{tf("communityEmpty")}</p> : null}
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={Math.min(i, 4) * 0.05}>
              <PostCard post={post} social={social[post.id]} signedIn={Boolean(user)} member={post.userId ? (members[post.userId] ?? null) : null} viewerId={user?.id ?? null} />
            </Reveal>
          ))}
        </div>
      </section>
      <QuickPostButton />
    </Container>
  );
}
