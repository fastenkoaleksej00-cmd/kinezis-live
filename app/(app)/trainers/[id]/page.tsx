import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, AtSign, Award, Link2, MessageCircle } from "lucide-react";
import { ReportButton } from "@/components/social/ReportButton";
import { bannerClass } from "@/lib/profile/banner";
import { normalizeBanner } from "@/lib/profile/banner";
import { getSessionUser } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { PostCard } from "@/components/feed/PostCard";
import { WorkoutCard } from "@/components/library/WorkoutCard";
import { TrainerBadge } from "@/components/trainer/TrainerBadge";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick, toCardData } from "@/lib/content/localize";
import { listPosts } from "@/lib/content/posts";
import { getAuthor, listWorkouts } from "@/lib/content/workouts";

interface TrainerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: TrainerPageProps) {
  const { id } = await params;
  const author = await getAuthor(id);
  return author ? { title: author.name } : {};
}

/** Public trainer profile: who they are, what they teach, their latest posts and sessions. */
export default async function TrainerPage({ params }: TrainerPageProps) {
  const { id } = await params;
  const author = await getAuthor(id);
  if (!author) notFound();
  const t = await getTranslations("trainer");
  const tl = await getTranslations("library");
  const tn = await getTranslations("nav");
  const locale = await getLocale();
  const [workouts, posts, viewer] = await Promise.all([listWorkouts(), listPosts(), getSessionUser()]);
  const own = workouts.filter((w) => w.authorId === author.id);
  const preset = normalizeBanner(author.coverPreset);
  const coverClasses = preset === "midnight" ? "section-deep" : bannerClass(preset);
  const ownPosts = posts.filter((p) => p.authorId === author.id).slice(0, 3);

  return (
    <Container as="section" className="space-y-8 py-4 sm:py-8">
      <Reveal>
        <Link href="/" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("home")}
        </Link>
      </Reveal>

      <Reveal delay={0.05}>
        <section className={cn("relative overflow-hidden rounded-3xl p-6 text-white sm:p-8", coverClasses)}>
          {preset === "midnight" ? <div className="grid-bg-dark pointer-events-none absolute inset-0" aria-hidden /> : <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-ink/55 to-transparent" aria-hidden />}
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="glass-dark text-frost inline-flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full text-3xl font-bold">
              {author.avatarSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={author.avatarSrc} alt={author.name} className="h-full w-full object-cover" />
              ) : (
                author.name.slice(0, 1)
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-glow text-[11px] font-semibold tracking-[0.3em] uppercase">{tl("trainer")}</p>
              <h1 className="text-frost mt-1 flex items-center gap-2 text-3xl font-extrabold">
                {author.name}
                {author.verified ? <TrainerBadge label={t("verified")} className="[&_svg]:text-mint [&_svg]:h-6 [&_svg]:w-6" /> : null}
              </h1>
              {author.verified ? <p className="text-mint mt-1 text-xs font-semibold">{t("verified")}</p> : null}
              {author.specialties.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {author.specialties.map((s) => (
                    <li key={s} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90">
                      {s in { kinesiotherapy: 1, yoga: 1, pilates: 1, stretching: 1, mobility: 1, back: 1 } ? tl(`categories.${s as "yoga"}`) : s}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-mist mt-4 max-w-xl text-sm">{author.bio ? pick(author.bio, locale) : t("bioPending")}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {author.instagram ? (
                  <a href={author.instagram} target="_blank" rel="noopener noreferrer" className="text-mist inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold backdrop-blur-md transition-colors hover:text-white">
                    <AtSign className="h-4 w-4" aria-hidden />
                    Instagram
                  </a>
                ) : null}
                <Link href="/messages" className="text-mist inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold backdrop-blur-md transition-colors hover:text-white">
                  <MessageCircle className="h-4 w-4" aria-hidden />
                  {t("ask")}
                </Link>
                {author.links.slice(0, 3).map((l) => (
                  <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="text-mist inline-flex h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold backdrop-blur-md transition-colors hover:text-white">
                    <Link2 className="h-4 w-4" aria-hidden />
                    {new URL(l).hostname.replace(/^www\./, "")}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {author.qualifications || author.experienceYears !== undefined ? (
        <Reveal delay={0.08}>
          <div className="card flex items-start gap-4 p-5">
            <span className="bg-mint-soft text-mint-deep inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
              <Award className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <div className="text-sm">
              <p className="text-ink font-semibold">{t("qualifications")}{author.experienceYears !== undefined ? ` · ${t("years", { count: author.experienceYears })}` : ""}</p>
              {author.qualifications ? <p className="text-steel mt-1 whitespace-pre-line">{author.qualifications}</p> : null}
              <p className="text-steel mt-2 text-xs">{author.verified ? t("verifiedNote") : t("unverifiedNote")}</p>
            </div>
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={0.1} as="section" className="grid grid-cols-2 gap-3 sm:max-w-sm">
        <div className="card px-4 py-3.5">
          <p className="text-ink text-2xl font-extrabold">{own.length}</p>
          <p className="text-steel text-xs">{t("statsSessions")}</p>
        </div>
        <div className="card px-4 py-3.5">
          <p className="text-ink text-2xl font-extrabold">{posts.filter((p) => p.authorId === author.id).length}</p>
          <p className="text-steel text-xs">{t("statsPosts")}</p>
        </div>
      </Reveal>

      {own.length > 0 ? (
        <Reveal delay={0.14} as="section" className="space-y-4">
          <SectionHeading
            title={t("sessions")}
            action={
              <Link href={`/library?author=${author.id}`} className={buttonStyles("secondary", "sm")}>
                {t("allSessions", { count: own.length })}
              </Link>
            }
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {own.slice(0, 4).map((w) => (
              <WorkoutCard key={w.id} workout={toCardData(w, locale)} />
            ))}
          </div>
        </Reveal>
      ) : null}

      {ownPosts.length > 0 ? (
        <Reveal delay={0.18} as="section" className="space-y-4">
          <SectionHeading title={t("latestPosts")} />
          <div className="mx-auto max-w-[720px] space-y-4">
            {ownPosts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </Reveal>
      ) : null}
      <Reveal delay={0.2} className="flex justify-end">
        <ReportButton targetType="trainer" targetId={author.id} signedIn={Boolean(viewer)} />
      </Reveal>
    </Container>
  );
}
