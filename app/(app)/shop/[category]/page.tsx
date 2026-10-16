import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { CountryPicker, ShopCatalog } from "@/components/shop/ShopCatalog";
import { Container } from "@/components/ui/Container";
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
      <Reveal delay={0.03}>
        <CountryPicker />
      </Reveal>
      <Reveal delay={0.05}>
        <ShopCatalog items={items} emptyTitle={t("soonTitle")} emptyBody={t("emptyCategoryBody")} />
      </Reveal>
      <Reveal delay={0.1}>
        <p className="text-steel text-xs">{c === "suspension" ? t("suspensionNote") : t("howItWorks")}</p>
      </Reveal>
    </Container>
  );
}
