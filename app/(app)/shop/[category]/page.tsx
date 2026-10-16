import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { ShopItemCard } from "@/components/shop/ShopItemCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listShopItems } from "@/lib/shop/queries";
import { shopCategories, type ShopCategory } from "@/lib/shop/types";

interface PageProps {
  params: Promise<{ category: string }>;
}

export default async function ShopCategoryPage({ params }: PageProps) {
  const { category } = await params;
  if (!(shopCategories as readonly string[]).includes(category)) notFound();
  const c = category as ShopCategory;
  const t = await getTranslations("shop");
  const items = (await listShopItems()).filter((i) => i.category === c);

  return (
    <Container as="section" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/shop" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t(`categories.${c}.title`)} lead={t(`categories.${c}.lead`)} />
      </Reveal>
      {items.length === 0 ? (
        <Reveal delay={0.05}>
          <EmptyState icon={ShoppingBag} illustration="saved" title={t("emptyCategoryTitle")} body={t("emptyCategoryBody")} />
        </Reveal>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((i, idx) => (
            <Reveal key={i.id} delay={Math.min(idx, 6) * 0.04}>
              <ShopItemCard item={i} />
            </Reveal>
          ))}
        </div>
      )}
      <Reveal delay={0.1}>
        <p className="text-steel text-xs">{c === "suspension" ? t("suspensionNote") : t("howItWorks")}</p>
      </Reveal>
    </Container>
  );
}
