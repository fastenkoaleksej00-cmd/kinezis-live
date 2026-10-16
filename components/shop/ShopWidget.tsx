import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowRight, ShoppingBag } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { listShopItems } from "@/lib/shop/queries";
import { shopCategories } from "@/lib/shop/types";
import { categoryIcon } from "./categoryIcons";

/** Home: "Everything for practice". Shows real featured products when the admin has added them, otherwise the categories. */
export async function ShopWidget() {
  const t = await getTranslations("shop");
  const locale = (await getLocale()) as Locale;
  const items = await listShopItems();
  const featured = items.filter((i) => i.featured).slice(0, 3);

  return (
    <section className="card relative overflow-hidden p-4 sm:p-5">
      <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,var(--color-mint-soft)_0%,transparent_70%)]" aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1 inline-flex items-center gap-2">
            <ShoppingBag className="h-3.5 w-3.5" aria-hidden />
            {t("eyebrow")}
          </p>
          <h2 className="text-ink text-lg font-bold">{t("widgetTitle")}</h2>
          <p className="text-steel mt-1 text-sm">{t("widgetBody")}</p>
        </div>
      </div>
      {featured.length > 0 ? (
        <div className="relative mt-4 grid grid-cols-3 gap-2">
          {featured.map((i) => {
            const Icon = categoryIcon[i.category];
            return (
              <Link key={i.id} href={`/shop/${i.category}`} className="group block overflow-hidden rounded-2xl border border-white/70 bg-white/80">
                {i.imageSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={i.imageSrc} alt={pick(i.title, locale)} loading="lazy" className="aspect-square w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <span className="bg-mint-soft text-mint-deep flex aspect-square items-center justify-center">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                )}
                <span className="text-ink block truncate px-2 pb-2 text-xs font-semibold">{pick(i.title, locale)}</span>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="scroll-row relative -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {shopCategories.slice(0, 6).map((c) => {
            const Icon = categoryIcon[c];
            return (
              <Link key={c} href={`/shop/${c}`} className="border-ink/10 text-ink inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border bg-white/70 px-3 text-xs font-semibold hover:bg-white">
                <Icon className="text-mint-deep h-3.5 w-3.5" aria-hidden />
                {t(`categories.${c}.title`)}
              </Link>
            );
          })}
        </div>
      )}
      <Link href="/shop" className="text-accent relative mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline">
        {t("open")}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </section>
  );
}
