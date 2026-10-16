import { cache } from "react";
import { getDb } from "@/lib/content/db";
import type { LocalizedText } from "@/lib/content/types";
import { shopCategories, type ShopCategory, type ShopCurrency, type ShopItem } from "./types";

export interface ShopItemRow {
  id: string;
  slug: string;
  category: ShopCategory;
  title: LocalizedText;
  description: LocalizedText | null;
  image_src: string | null;
  price: number | string | null;
  currency: ShopCurrency;
  purchase_url: string | null;
  partner: string | null;
  featured: boolean;
  position: number;
  published: boolean;
}

export const shopColumns = "id, slug, category, title, description, image_src, price, currency, purchase_url, partner, featured, position, published";

export function rowToShopItem(r: ShopItemRow): ShopItem {
  return {
    id: r.id,
    slug: r.slug,
    category: r.category,
    title: r.title,
    description: r.description ?? { en: "" },
    imageSrc: r.image_src ?? undefined,
    price: r.price === null ? undefined : Number(r.price),
    currency: r.currency,
    purchaseUrl: r.purchase_url ?? undefined,
    partner: r.partner ?? undefined,
    featured: r.featured,
  };
}

/** Published items only. Empty until the admin adds real products: nothing is invented. */
export const listShopItems = cache(async (): Promise<ShopItem[]> => {
  const db = await getDb();
  if (!db) return [];
  const { data, error } = await db.from("shop_items").select(shopColumns).eq("published", true).order("position").order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as ShopItemRow[]).map(rowToShopItem);
});

export async function countByCategory(): Promise<Record<ShopCategory, number>> {
  const items = await listShopItems();
  return Object.fromEntries(shopCategories.map((c) => [c, items.filter((i) => i.category === c).length])) as Record<ShopCategory, number>;
}

/** Admin: every row including drafts (RLS) */
export async function listAllShopRows(): Promise<ShopItemRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("shop_items").select(shopColumns).order("category").order("position");
  return (data ?? []) as unknown as ShopItemRow[];
}

export async function getShopRow(id: string): Promise<ShopItemRow | null> {
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.from("shop_items").select(shopColumns).eq("id", id).maybeSingle();
  return (data as unknown as ShopItemRow | null) ?? null;
}
