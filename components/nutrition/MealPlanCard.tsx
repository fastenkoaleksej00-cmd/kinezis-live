import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { UtensilsCrossed } from "lucide-react";
import { SaveButton } from "@/components/library/SaveButton";
import { Cover } from "@/components/ui/Cover";
import { pick } from "@/lib/content/localize";
import type { MealPlan } from "@/lib/content/types";
import { mealKey } from "@/lib/store/keys";

export async function MealPlanCard({ plan }: { plan: MealPlan }) {
  const t = await getTranslations("nutrition");
  const locale = await getLocale();
  const format = await getFormatter();
  const date = plan.date ? format.dateTime(new Date(plan.date), { day: "numeric", month: "long" }) : undefined;
  return (
    <Link href={`/nutrition/${plan.slug}`} className="group block">
      <Cover tone="mint" ratio="aspect-[16/10]" label={date}>
        <div className="absolute top-3 right-3 z-20">
          <SaveButton itemKey={mealKey(plan.id)} look="glass" />
        </div>
        <div className="flex h-full flex-col justify-end p-5">
          <span className="text-ink mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/85">
            <UtensilsCrossed className="h-4 w-4" strokeWidth={1.9} aria-hidden />
          </span>
          <h3 className="text-ink text-lg leading-snug font-bold">{pick(plan.title, locale)}</h3>
          <p className="text-steel mt-1 text-xs font-medium">{t("mealsCount", { count: plan.meals.length })}</p>
        </div>
      </Cover>
    </Link>
  );
}
