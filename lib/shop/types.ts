import type { EquipmentId, LocalizedText } from "@/lib/content/types";

/** Eight categories, trimmed from the owner's long list to what home practice actually needs. */
export const shopCategories = ["mats", "props", "bands", "balance", "weights", "recovery", "suspension", "accessories"] as const;
export type ShopCategory = (typeof shopCategories)[number];

/** Curated collections set by the admin; "fast" additionally needs a delivery window of 7 days or less for the chosen country */
export const shopCollections = ["fast", "deals", "soon"] as const;
export type ShopCollection = (typeof shopCollections)[number];

export const shopCurrencies = ["UAH", "EUR", "USD", "PLN", "GBP"] as const;
export type ShopCurrency = (typeof shopCurrencies)[number];

export const shopSources = ["amazon", "temu", "aliexpress", "rozetka", "prom", "partner"] as const;
export type ShopSource = (typeof shopSources)[number];

/** Delivery countries offered in the picker (ISO 3166-1 alpha-2); names come from Intl.DisplayNames */
/** Offer rows in the admin form */
export const OFFER_ROWS = 4;

export const shopCountries = ["UA", "PL", "DE", "AT", "CZ", "SK", "RO", "IT", "ES", "FR", "NL", "GB", "US", "CA"] as const;

export interface ShopOffer {
  id: string;
  source: ShopSource;
  storeName?: string;
  countries: string[];
  url: string;
  price?: number;
  currency: ShopCurrency;
  deliveryMin?: number;
  deliveryMax?: number;
}

export interface ShopItem {
  id: string;
  slug: string;
  category: ShopCategory;
  title: LocalizedText;
  description: LocalizedText;
  imageSrc?: string;
  /** Legacy single link from step 1; used only when the item has no offers */
  price?: number;
  currency: ShopCurrency;
  purchaseUrl?: string;
  partner?: string;
  featured: boolean;
  collections: ShopCollection[];
  offers: ShopOffer[];
}

/** Offers that ship to the country, or have no country stated (shown with a "check delivery" note). No country chosen = all. */
export function offersFor(item: ShopItem, country: string | null): { offer: ShopOffer; confirmed: boolean }[] {
  return item.offers
    .filter((o) => !country || o.countries.length === 0 || o.countries.includes(country))
    .map((o) => ({ offer: o, confirmed: Boolean(country && o.countries.includes(country)) }));
}

/** Workout equipment → shop category, for "You will need" on session pages */
export const equipmentToCategory: Partial<Record<EquipmentId, ShopCategory>> = {
  mat: "mats",
  blocks: "props",
  band: "bands",
  ball: "balance",
  dumbbells: "weights",
};
