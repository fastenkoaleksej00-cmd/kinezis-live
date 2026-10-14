import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, Play } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { QuickPostButton } from "@/components/feed/QuickPostButton";
import { PremiumBanner } from "@/components/premium/PremiumBanner";
import { ContinueCard } from "@/components/home/ContinueCard";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick, toCardData } from "@/lib/content/localize";
import { listPosts } from "@/lib/content/posts";
import { getTodayWorkout, listWorkouts } from "@/lib/content/workouts";
import { getSessionUser } from "@/lib/supabase/server";

/** Home, feed-first: today's session, continue, then the trainer feed. */
export default async function HomePage() {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  const tl = await getTranslations("library");
  const locale = await getLocale();
  const [allWorkouts, today, posts, user] = await Promise.all([listWorkouts(), getTodayWorkout(), listPosts(), getSessionUser()]);
  const workouts = allWorkouts.map((w) => toCardData(w, locale));

  return (
    <Container as="section" className="space-y-8 py-6 sm:py-8">
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
          <SectionHeading title={t("feedTitle")} />
        </Reveal>
        <div className="mx-auto max-w-[720px] space-y-4">
          {posts.map((post, i) => (
            <Reveal key={post.id} delay={Math.min(i, 4) * 0.05}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>
      <QuickPostButton />
    </Container>
  );
}
