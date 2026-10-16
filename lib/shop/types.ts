import type { EquipmentId, LocalizedText } from "@/lib/content/types";

/** Eight categories, trimmed from the owner's long list to what home practice actually needs. */
export const shopCategories = ["mats", "props", "bands", "balance", "weights", "recovery", "suspension", "accessories"] as const;
export type ShopCategory = (typeof shopCategories)[number];

export const shopCurrencies = ["UAH", "EUR", "USD", "PLN", "GBP"] as const;
export type ShopCurrency = (typeof shopCurrencies)[number];

export interface ShopItem {
  id: string;
  slug: string;
  category: ShopCategory;
  title: LocalizedText;
  description: LocalizedText;
  imageSrc?: string;
  price?: number;
  currency: ShopCurrency;
  purchaseUrl?: string;
  partner?: string;
  featured: boolean;
}

/** Workout equipment → shop category, for "You will need" on session pages */
export const equipmentToCategory: Partial<Record<EquipmentId, ShopCategory>> = {
  mat: "mats",
  blocks: "props",
  band: "bands",
  ball: "balance",
  dumbbells: "weights",
};
