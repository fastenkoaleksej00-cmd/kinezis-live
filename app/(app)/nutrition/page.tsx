import { FeatureTip } from "@/components/onboarding/FeatureTip";
import { getTranslations } from "next-intl/server";
import { UtensilsCrossed } from "lucide-react";
import { MealPlanCard } from "@/components/nutrition/MealPlanCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listMealPlans } from "@/lib/content/meals";

export default async function NutritionPage() {
  const t = await getTranslations("nutrition");
  const plans = await listMealPlans();
  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      <FeatureTip id="nutrition" />
      <Reveal delay={0.05}>
        <p className="card text-steel px-5 py-4 text-sm">{t("disclaimer")}</p>
      </Reveal>
      {plans.length === 0 ? (
        <Reveal delay={0.1}>
          <EmptyState icon={UtensilsCrossed} title={t("emptyTitle")} body={t("emptyBody")} />
        </Reveal>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((p, i) => (
            <Reveal key={p.id} delay={0.1 + i * 0.04}>
              <MealPlanCard plan={p} />
            </Reveal>
          ))}
        </div>
      )}
    </Container>
  );
}
