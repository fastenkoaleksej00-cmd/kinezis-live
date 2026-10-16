import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getSessionUser } from "@/lib/supabase/server";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listAllWorkouts } from "@/lib/admin/queries";
import { YouTubeImport } from "@/components/admin/YouTubeImport";
import { latestChannelVideos } from "@/lib/video/youtubeFeed";
import { Film } from "lucide-react";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminWorkoutsPage({ searchParams }: PageProps) {
  const t = await getTranslations("admin");
  const tl = await getTranslations("library");
  const tc = await getTranslations("common");
  const params = await searchParams;
  const viewer = await getSessionUser();
  const workouts = await listAllWorkouts(viewer?.role === "trainer" ? viewer.authorId : null);

  return (
    <div className="space-y-5">
      <SectionHeading
        as="h1"
        title={t("nav.workouts")}
        action={
          <Link href="/admin/workouts/new" className={buttonStyles("primary", "md")}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("newWorkout")}
          </Link>
        }
      />
      <YouTubeImport suggestions={viewer?.role === "admin" ? (await latestChannelVideos()).filter((v) => !workouts.some((w) => w.video?.kind === "youtube" && w.video.id === v.id)).map((v) => ({ id: v.id, title: v.title })) : []} />
      {params.saved ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("savedNotice")}</p> : null}
      {params.submitted ? <p className="bg-accent-soft text-accent rounded-2xl px-4 py-3 text-sm font-semibold">{t("submittedNotice")}</p> : null}
      {params.deleted ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm font-semibold">{t("deletedNotice")}</p> : null}

      {workouts.length === 0 ? (
        <EmptyState icon={Film} title={t("emptyWorkoutsTitle")} body={t("emptyWorkoutsBody")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {workouts.map((w) => (
            <li key={w.id}>
              <Link href={`/admin/workouts/${w.id}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate font-semibold">{w.title.en}</span>
                  <span className="text-steel block text-xs">
                    {tl(`categories.${w.category}`)} · {tc("minutes", { count: w.duration_min })} · {tl(`levels.${w.level}`)}
                  </span>
                </span>
                <StatusBadge published={w.published} review={w.review_status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
