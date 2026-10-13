import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick } from "@/lib/content/localize";
import { getProduct } from "@/lib/content/skincare";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const t = await getTranslations("skincare");
  const locale = await getLocale();

  return (
    <Container as="article" className="max-w-[760px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/skincare/products" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("products.title")}
        </Link>
      </Reveal>
      <Reveal delay={0.05} className="grid gap-5 sm:grid-cols-[280px_1fr]">
        {product.imageSrc ? (
          <div className="aspect-[4/5] overflow-hidden rounded-3xl bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={product.imageSrc} alt={product.name} className="h-full w-full object-cover" />
          </div>
        ) : (
          <Cover tone="mint" ratio="aspect-[4/5]" label={t(`categories.${product.category}`)} />
        )}
        <div>
          <p className="eyebrow mb-2">{product.brand || t(`categories.${product.category}`)}</p>
          <h1 className="text-2xl leading-tight font-extrabold sm:text-3xl">{product.name}</h1>
          <p className="text-text mt-3 text-[15px] leading-relaxed">{pick(product.description, locale)}</p>
          {product.purchaseUrl ? (
            <a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer" className={buttonStyles("primary", "md", "mt-5")}>
              {t("buy")}
              <ExternalLink className="h-4 w-4" aria-hidden />
            </a>
          ) : null}
        </div>
      </Reveal>
      {product.usage.en ? (
        <Reveal delay={0.1} as="section" className="card px-5 py-4">
          <h2 className="eyebrow mb-2">{t("usage")}</h2>
          <p className="text-text text-[15px] leading-relaxed">{pick(product.usage, locale)}</p>
        </Reveal>
      ) : null}
      {product.ingredients.length > 0 ? (
        <Reveal delay={0.14} as="section" className="card px-5 py-4">
          <h2 className="eyebrow mb-2">{t("ingredients")}</h2>
          <p className="text-steel text-sm leading-relaxed">{product.ingredients.join(", ")}</p>
        </Reveal>
      ) : null}
      <Reveal delay={0.18}>
        <p className="text-steel text-center text-xs">{t("disclaimer")}</p>
      </Reveal>
    </Container>
  );
}
