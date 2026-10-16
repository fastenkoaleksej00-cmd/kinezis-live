"use client";

import { useLocale, useTranslations } from "next-intl";
import { ExternalLink, Truck } from "lucide-react";
import { Cover } from "@/components/ui/Cover";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { offersFor, type ShopItem } from "@/lib/shop/types";
import { categoryIcon } from "./categoryIcons";

function money(locale: string, value: number, currency: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency, maximumFractionDigits: value % 1 === 0 ? 0 : 2 }).format(value);
}

/**
 * Product card: photo, name, description and one row per store offer that ships to the chosen country.
 * Delivery is shown only as the store's stated window; nothing is promised by the app.
 */
export function ShopItemCard({ item, country }: { item: ShopItem; country: string | null }) {
  const t = useTranslations("shop");
  const locale = useLocale() as Locale;
  const Icon = categoryIcon[item.category];
  const desc = pick(item.description, locale);
  const soon = item.collections.includes("soon");
  const offers = offersFor(item, country);
  const legacy = item.offers.length === 0 && item.purchaseUrl ? { url: item.purchaseUrl, price: item.price, currency: item.currency, store: item.partner } : null;

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      <div className="relative">
        {item.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageSrc} alt={pick(item.title, locale)} loading="lazy" decoding="async" className="aspect-square w-full bg-white object-contain p-3" />
        ) : (
          <Cover tone="mint" ratio="aspect-square" className="rounded-none">
            <div className="flex h-full items-center justify-center text-white/90">
              <Icon className="h-10 w-10" strokeWidth={1.4} aria-hidden />
            </div>
          </Cover>
        )}
        {soon ? <span className="bg-accent-soft text-accent absolute top-2 left-2 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase">{t("collections.soon.badge")}</span> : null}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="eyebrow">{t(`categories.${item.category}.title`)}</p>
        <h3 className="text-ink text-[15px] leading-snug font-bold">{pick(item.title, locale)}</h3>
        {desc ? <p className="text-steel line-clamp-3 text-sm">{desc}</p> : null}
        <div className="mt-auto space-y-2 pt-3">
          {soon && offers.length === 0 && !legacy ? <p className="text-steel text-sm">{t("soonNote")}</p> : null}
          {!soon && offers.length === 0 && !legacy ? <p className="text-steel text-sm">{country ? t("notForCountry") : t("noOffers")}</p> : null}
          {offers.map(({ offer, confirmed }) => (
            <div key={offer.id} className="bg-frost/60 rounded-2xl p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-ink truncate text-xs font-semibold">{offer.storeName ?? t(`sources.${offer.source}`)}</p>
                  {offer.price !== undefined ? <p className="text-ink text-base font-extrabold">{money(locale, offer.price, offer.currency)}</p> : <p className="text-steel text-xs">{t("priceAtPartner")}</p>}
                </div>
                <a href={offer.url} target="_blank" rel="sponsored noopener noreferrer" className="bg-linear-to-b from-ink-2 to-ink inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold text-white transition-transform active:scale-95">
                  {t("buy")}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
              <p className="text-steel mt-1 inline-flex items-center gap-1 text-[11px]">
                <Truck className="h-3 w-3 shrink-0" aria-hidden />
                {offer.deliveryMax !== undefined
                  ? t("deliveryStated", { min: offer.deliveryMin ?? offer.deliveryMax, max: offer.deliveryMax })
                  : confirmed
                    ? t("deliveryAtStore")
                    : t("deliveryCheck")}
              </p>
            </div>
          ))}
          {legacy ? (
            <div className="flex items-end justify-between gap-2">
              <div>
                {legacy.price !== undefined ? <p className="text-ink text-lg font-extrabold">{money(locale, legacy.price, legacy.currency)}</p> : <p className="text-steel text-sm">{t("priceAtPartner")}</p>}
                {legacy.store ? <p className="text-steel text-[11px]">{t("soldBy", { partner: legacy.store })}</p> : null}
              </div>
              <a href={legacy.url} target="_blank" rel="sponsored noopener noreferrer" className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white">
                {t("buy")}
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
