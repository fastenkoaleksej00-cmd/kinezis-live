import { cache } from "react";
import { getDb } from "@/lib/content/db";
import type { LocalizedText } from "@/lib/content/types";
import { shopCategories, shopCollections, type ShopCategory, type ShopCollection, type ShopCurrency, type ShopItem, type ShopOffer, type ShopSource } from "./types";

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
  collections?: string[] | null;
}

export interface ShopOfferRow {
  id: string;
  item_id: string;
  source: ShopSource;
  store_name: string | null;
  countries: string[] | null;
  url: string;
  price: number | string | null;
  currency: ShopCurrency;
  delivery_min_days: number | null;
  delivery_max_days: number | null;
  position: number;
}

export const shopColumns = "id, slug, category, title, description, image_src, price, currency, purchase_url, partner, featured, position, published, collections";
export const offerColumns = "id, item_id, source, store_name, countries, url, price, currency, delivery_min_days, delivery_max_days, position";

function rowToOffer(o: ShopOfferRow): ShopOffer {
  return {
    id: o.id,
    source: o.source,
    storeName: o.store_name ?? undefined,
    countries: o.countries ?? [],
    url: o.url,
    price: o.price === null ? undefined : Number(o.price),
    currency: o.currency,
    deliveryMin: o.delivery_min_days ?? undefined,
    deliveryMax: o.delivery_max_days ?? undefined,
  };
}

export function rowToShopItem(r: ShopItemRow, offers: ShopOfferRow[] = []): ShopItem {
  return {
    collections: (r.collections ?? []).filter((c): c is ShopCollection => (shopCollections as readonly string[]).includes(c)),
    offers: offers.filter((o) => o.item_id === r.id).sort((a, b) => a.position - b.position).map(rowToOffer),
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
  const rows = data as unknown as ShopItemRow[];
  // Offers table arrives with migration 0019; without it items keep their single legacy link
  const { data: offers } = rows.length > 0 ? await db.from("shop_offers").select(offerColumns).in("item_id", rows.map((r) => r.id)) : { data: [] };
  return rows.map((r) => rowToShopItem(r, (offers ?? []) as unknown as ShopOfferRow[]));
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

export async function listOfferRows(itemId: string): Promise<ShopOfferRow[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("shop_offers").select(offerColumns).eq("item_id", itemId).order("position");
  return (data ?? []) as unknown as ShopOfferRow[];
}
