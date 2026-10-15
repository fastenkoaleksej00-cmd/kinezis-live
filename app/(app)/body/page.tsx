import { getLocale, getTranslations } from "next-intl/server";
import { BodyMap } from "@/components/body/BodyMap";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { regionIds, type RegionId } from "@/lib/body/regions";
import { toCardData } from "@/lib/content/localize";
import { listWorkouts } from "@/lib/content/workouts";
import { getSessionUser } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Body map: the KINEZIS skeleton, tappable areas, honest recommendations from the real library. */
export default async function BodyPage({ searchParams }: PageProps) {
  const t = await getTranslations("body");
  const locale = await getLocale();
  const sp = await searchParams;
  const initial = typeof sp.region === "string" && (regionIds as readonly string[]).includes(sp.region) ? (sp.region as RegionId) : null;
  const [workouts, user] = await Promise.all([listWorkouts(), getSessionUser()]);
  const catalogue = workouts.map((w) => toCardData(w, locale));

  return (
    <Container as="section" className="max-w-[860px] space-y-5 py-4 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal delay={0.05}>
        <BodyMap modelUrl="/models/kinezis-body.glb" catalogue={catalogue} signedIn={Boolean(user)} initialRegion={initial} />
      </Reveal>
    </Container>
  );
}
