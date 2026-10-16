"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { MapPin, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { shopCountries, offersFor, type ShopCollection, type ShopItem } from "@/lib/shop/types";
import { shopCountryStore } from "@/lib/store/shopCountry";
import { ShopItemCard } from "./ShopItemCard";

/** Delivery-country picker shared by every shop page. */
export function CountryPicker() {
  const t = useTranslations("shop");
  const locale = useLocale();
  const { country } = shopCountryStore.useStore();
  const names = useMemo(() => {
    try {
      return new Intl.DisplayNames([locale], { type: "region" });
    } catch {
      return null;
    }
  }, [locale]);
  return (
    <label className="card flex items-center gap-3 px-4 py-3">
      <MapPin className="text-mint-deep h-4 w-4 shrink-0" aria-hidden />
      <span className="text-steel shrink-0 text-sm">{t("deliverTo")}</span>
      <select value={country ?? ""} onChange={(e) => shopCountryStore.write({ country: e.target.value || null })} className="text-ink min-w-0 flex-1 truncate bg-transparent text-sm font-semibold outline-none">
        <option value="">{t("anyCountry")}</option>
        {shopCountries.map((c) => (
          <option key={c} value={c}>
            {names?.of(c) ?? c}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Item grid filtered by the chosen country (and, for "fast", by a stated delivery window of 7 days or less).
 * Items without any offer for the country are hidden, except "coming soon" ones.
 */
export function ShopCatalog({ items, collection, emptyTitle, emptyBody }: { items: ShopItem[]; collection?: ShopCollection; emptyTitle: string; emptyBody: string }) {
  const t = useTranslations("shop");
  const { country } = shopCountryStore.useStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const c = mounted ? country : null;
  const visible = items.filter((i) => {
    if (collection && !i.collections.includes(collection)) return false;
    if (collection === "soon" || i.collections.includes("soon")) return true;
    const offers = offersFor(i, c);
    if (i.offers.length === 0) return Boolean(i.purchaseUrl);
    if (offers.length === 0) return false;
    if (collection === "fast") return offers.some(({ offer }) => offer.deliveryMax !== undefined && offer.deliveryMax <= 7);
    return true;
  });

  if (visible.length === 0) {
    return <EmptyState icon={ShoppingBag} illustration="saved" title={emptyTitle} body={c && items.length > 0 ? t("emptyForCountry") : emptyBody} />;
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {visible.map((i) => (
        <ShopItemCard key={i.id} item={i} country={c} />
      ))}
    </div>
  );
}
