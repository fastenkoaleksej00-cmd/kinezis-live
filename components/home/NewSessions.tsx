import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { WorkoutCard } from "@/components/library/WorkoutCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import type { WorkoutCardData } from "@/lib/content/types";

/** Horizontal strip of the latest sessions with their covers. */
export async function NewSessions({ workouts }: { workouts: WorkoutCardData[] }) {
  const t = await getTranslations("home");
  const tc = await getTranslations("common");
  if (workouts.length === 0) return null;
  return (
    <section className="space-y-3">
      <SectionHeading
        title={t("newSessions")}
        action={
          <Link href="/library" className={buttonStyles("secondary", "sm")}>
            {tc("seeAll")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        }
      />
      <div className="scroll-row -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {workouts.slice(0, 6).map((w) => (
          <div key={w.id} className="w-[46%] shrink-0 sm:w-[30%] lg:w-[22%]">
            <WorkoutCard workout={w} />
          </div>
        ))}
      </div>
    </section>
  );
}
