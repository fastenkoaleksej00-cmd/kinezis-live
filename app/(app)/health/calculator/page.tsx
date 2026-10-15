import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { GoalCalculator } from "@/components/health/GoalCalculator";
import { GoalPicker } from "@/components/health/GoalPicker";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { ageFromBirthDate, latestWeight } from "@/lib/health/stats";
import { getMyProfile, listMeasurements } from "@/lib/profile/queries";

/** Goal calculator, prefilled from the private health profile when signed in. Works without an account too. */
export default async function CalculatorPage() {
  const t = await getTranslations("calculator");
  const th = await getTranslations("health");
  const [profile, measurements] = await Promise.all([getMyProfile(), listMeasurements()]);
  const last = latestWeight(measurements);
  return (
    <Container as="section" className="max-w-[760px] space-y-5 py-4 sm:py-8">
      <Reveal>
        <Link href="/health" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {th("title")}
        </Link>
        <SectionHeading as="h1" eyebrow={th("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      {profile ? (
        <Reveal delay={0.04}>
          <GoalPicker profile={profile} currentKg={last?.weightKg ?? null} />
        </Reveal>
      ) : null}
      <Reveal delay={0.06}>
        <p className="eyebrow mb-3">{t("weightSection")}</p>
        <GoalCalculator defaults={{ currentKg: last?.weightKg ?? null, heightCm: profile?.heightCm ?? null, age: ageFromBirthDate(profile?.birthDate ?? null), activity: profile?.activityLevel ?? null, goal: profile?.fitnessGoal ?? null }} />
      </Reveal>
    </Container>
  );
}
