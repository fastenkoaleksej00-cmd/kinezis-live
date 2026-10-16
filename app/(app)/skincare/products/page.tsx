import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listProducts } from "@/lib/content/skincare";

export default async function SkincareProductsPage() {
  const t = await getTranslations("skincare");
  await getLocale();
  const items = await listProducts();

  return (
    <Container as="section" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/skincare" className={buttonStyles("ghost", "sm", "-ml-3 mb-2")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
        <SectionHeading as="h1" title={t("products.title")} lead={t("products.body")} />
      </Reveal>
      <Reveal delay={0.06}>
        {items.length === 0 ? (
          <EmptyState icon={Sparkles} title={t("products.emptyTitle")} body={t("products.emptyBody")} />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((p) => (
              <Link key={p.id} href={`/skincare/products/${p.slug}`} className="group block">
                {p.imageSrc ? (
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.imageSrc} alt={p.name} className="h-full w-full object-cover" />
                    <span className="absolute top-3 left-3 rounded-full border border-white/60 bg-white/70 px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.18em] uppercase backdrop-blur-md">{t(`categories.${p.category}`)}</span>
                  </div>
                ) : (
                  <Cover tone="mint" ratio="aspect-[4/5]" label={t(`categories.${p.category}`)} />
                )}
                <p className="text-ink mt-2.5 text-sm font-bold">{p.name}</p>
                <p className="text-steel text-xs">{p.brand}</p>
              </Link>
            ))}
          </div>
        )}
      </Reveal>
      {items.length > 0 ? (
        <Reveal delay={0.1}>
          <p className="text-steel text-center text-xs">{t("disclaimer")}</p>
        </Reveal>
      ) : null}
    </Container>
  );
}
