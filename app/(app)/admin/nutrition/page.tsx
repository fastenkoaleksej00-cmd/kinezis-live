import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus, UtensilsCrossed } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listAllMealPlans } from "@/lib/admin/queries";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminNutritionPage({ searchParams }: PageProps) {
  const t = await getTranslations("admin");
  const params = await searchParams;
  const plans = await listAllMealPlans();
  return (
    <div className="space-y-5">
      <SectionHeading
        as="h1"
        title={t("nav.nutrition")}
        lead={t("nutritionIntro")}
        action={
          <Link href="/admin/nutrition/new" className={buttonStyles("primary", "md")}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("newMealPlan")}
          </Link>
        }
      />
      {params.saved ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("savedNotice")}</p> : null}
      {params.deleted ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm font-semibold">{t("deletedNotice")}</p> : null}
      {plans.length === 0 ? (
        <EmptyState icon={UtensilsCrossed} title={t("emptyList")} body={t("nutritionIntro")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {plans.map((p) => (
            <li key={p.id}>
              <Link href={`/admin/nutrition/${p.id}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate font-semibold">{p.title.en}</span>
                  <span className="text-steel block text-xs">{p.plan_date ?? p.slug}</span>
                </span>
                <StatusBadge published={p.published} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
