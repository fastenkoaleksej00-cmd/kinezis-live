import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Wind } from "lucide-react";
import { workoutKey } from "@/lib/store/keys";
import { SaveButton } from "@/components/library/SaveButton";
import { VideoPlayer } from "@/components/player/VideoPlayer";
import { resolveVideo } from "@/lib/video/resolve";
import { Paywall } from "@/components/premium/Paywall";
import { canAccess } from "@/lib/access/plans";
import { getSessionUser, isStaff } from "@/lib/supabase/server";
import { Container } from "@/components/ui/Container";
import { pick } from "@/lib/content/localize";
import { getAuthor, getWorkout } from "@/lib/content/workouts";

interface WatchPageProps {
  params: Promise<{ slug: string }>;
}

/** Player screen on a petrol surface: the video first, details below. */
export default async function WatchPage({ params }: WatchPageProps) {
  const { slug } = await params;
  const workout = await getWorkout(slug);
  if (!workout) notFound();

  const locale = await getLocale();
  const t = await getTranslations("library");
  const tc = await getTranslations("common");
  const author = await getAuthor(workout.authorId);
  const title = pick(workout.title, locale);
  const user = await getSessionUser();
  const allowed = canAccess({ access: workout.access, plan: user?.plan ?? "free", planUntil: user?.planUntil, staff: isStaff(user) });
  const playable = allowed ? await resolveVideo(workout.video) : null;

  return (
    <div className="section-deep relative -mb-24 min-h-dvh pb-28 text-white md:-mb-10 md:pb-12">
      <div className="grid-bg-dark pointer-events-none absolute inset-0" aria-hidden />
      <Container as="section" className="relative space-y-5 py-4 sm:py-8">
        <div className="flex items-center justify-between">
          <Link href={`/library/${workout.slug}`} className="text-mist inline-flex h-10 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold backdrop-blur-md transition-colors hover:text-white">
            <ArrowLeft className="h-4 w-4" aria-hidden />
            {tc("back")}
          </Link>
          <SaveButton itemKey={workoutKey(workout.id)} look="glass" size="md" />
        </div>

        {allowed ? <VideoPlayer workoutId={workout.id} source={playable} title={title} /> : <Paywall />}

        <div>
          <p className="text-glow text-[11px] font-semibold tracking-[0.3em] uppercase">{t(`categories.${workout.category}`)}</p>
          <h1 className="text-frost mt-1.5 text-2xl leading-tight font-extrabold sm:text-3xl">{title}</h1>
          <p className="text-mist mt-2 text-sm">
            {tc("minutes", { count: workout.durationMin })} · {t(`levels.${workout.level}`)} · {author?.name}
          </p>
          <p className="text-mist mt-4 max-w-2xl text-[15px] leading-relaxed">{pick(workout.description, locale)}</p>
          <Link href="/breathe/recovery?minutes=3" className="glass-dark text-frost mt-5 inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold">
            <Wind className="h-4 w-4" aria-hidden />
            {t("recoverAfter")}
          </Link>
        </div>
      </Container>
    </div>
  );
}
