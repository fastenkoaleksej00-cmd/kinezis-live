import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Clock, Sparkles, Truck } from "lucide-react";
import { categoryIcon } from "@/components/shop/categoryIcons";
import { CountryPicker, ShopCatalog } from "@/components/shop/ShopCatalog";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listShopItems } from "@/lib/shop/queries";
import { shopCategories, shopCollections } from "@/lib/shop/types";

const collectionIcon = { fast: Truck, deals: Sparkles, soon: Clock } as const;

/** Shop hub: delivery country, three collections, eight categories, recommended items. */
export default async function ShopPage() {
  const t = await getTranslations("shop");
  const items = await listShopItems();
  const count = (c: string) => items.filter((i) => i.category === c).length;

  return (
    <Container as="section" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal delay={0.03}>
        <CountryPicker />
      </Reveal>
      <Reveal delay={0.05} className="grid gap-3 sm:grid-cols-3">
        {shopCollections.map((c) => {
          const Icon = collectionIcon[c];
          return (
            <Link key={c} href={`/shop/collection/${c}`} className="card group flex items-center gap-3 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
              <span className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${c === "deals" ? "bg-[#fdf0e1] text-[#c27a2c]" : c === "soon" ? "bg-accent-soft text-accent" : "bg-mint-soft text-mint-deep"}`}>
                <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-ink block text-sm font-bold">{t(`collections.${c}.title`)}</span>
                <span className="text-steel block text-xs">{t(`collections.${c}.hint`)}</span>
              </span>
              <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 shrink-0 transition-colors" aria-hidden />
            </Link>
          );
        })}
      </Reveal>
      <Reveal delay={0.08} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {shopCategories.map((c) => {
          const Icon = categoryIcon[c];
          return (
            <Link key={c} href={`/shop/${c}`} className="card group flex flex-col gap-3 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
              <span className="flex items-center justify-between">
                <span className="bg-mint-soft text-mint-deep inline-flex h-11 w-11 items-center justify-center rounded-2xl">
                  <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                </span>
                <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 transition-colors" aria-hidden />
              </span>
              <span>
                <span className="text-ink block text-sm font-bold">{t(`categories.${c}.title`)}</span>
                <span className="text-steel block text-xs">{count(c) > 0 ? t("itemsCount", { count: count(c) }) : t(`categories.${c}.hint`)}</span>
              </span>
            </Link>
          );
        })}
      </Reveal>
      <Reveal delay={0.1} as="section" className="space-y-3">
        <h2 className="text-ink text-xl font-bold">{t("featured")}</h2>
        <ShopCatalog items={items.filter((i) => i.featured)} emptyTitle={t("emptyTitle")} emptyBody={t("emptyBody")} />
      </Reveal>
      <Reveal delay={0.14}>
        <p className="text-steel text-xs">{t("howItWorks")}</p>
      </Reveal>
    </Container>
  );
}
