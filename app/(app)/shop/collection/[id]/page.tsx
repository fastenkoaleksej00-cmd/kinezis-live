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
import { shopCollections, type ShopCollection } from "@/lib/shop/types";

export default async function ShopCollectionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(shopCollections as readonly string[]).includes(id)) notFound();
  const c = id as ShopCollection;
  const t = await getTranslations("shop");
  const items = await listShopItems();
  return (
    <Container as="section" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/shop" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t(`collections.${c}.title`)} lead={t(`collections.${c}.lead`)} />
      </Reveal>
      {c !== "soon" ? (
        <Reveal delay={0.03}>
          <CountryPicker />
        </Reveal>
      ) : null}
      <Reveal delay={0.05}>
        <ShopCatalog items={items} collection={c} emptyTitle={t("soonTitle")} emptyBody={t(`collections.${c}.empty`)} />
      </Reveal>
      <Reveal delay={0.1}>
        <p className="text-steel text-xs">{c === "fast" ? t("fastNote") : t("howItWorks")}</p>
      </Reveal>
    </Container>
  );
}
