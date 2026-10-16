"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { redirect } from "next/navigation";
import type { LocalizedText } from "@/lib/content/types";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { OFFER_ROWS, shopCategories, shopCollections, shopCountries, shopCurrencies, shopSources } from "./types";

export interface ShopState {
  error?: "forbidden" | "titleRequired" | "invalid" | "generic";
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

function localized(fd: FormData, base: string): LocalizedText | null {
  const en = str(fd, `${base}_en`);
  if (!en) return null;
  const out: LocalizedText = { en };
  for (const l of ["uk", "de", "ru"] as const) {
    const v = str(fd, `${base}_${l}`);
    if (v) out[l] = v;
  }
  return out;
}

async function adminDb() {
  const user = await getSessionUser();
  if (user?.role !== "admin") return null;
  return createServerSupabase();
}

export async function saveShopItem(_prev: ShopState, fd: FormData): Promise<ShopState> {
  const db = await adminDb();
  if (!db) return { error: "forbidden" };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const category = str(fd, "category");
  if (!(shopCategories as readonly string[]).includes(category)) return { error: "invalid" };
  const currency = (shopCurrencies as readonly string[]).includes(str(fd, "currency")) ? str(fd, "currency") : "UAH";
  const priceRaw = str(fd, "price").replace(",", ".");
  const price = priceRaw ? Number(priceRaw) : null;
  if (price !== null && (!Number.isFinite(price) || price < 0)) return { error: "invalid" };
  const url = str(fd, "purchase_url");
  if (url && !/^https:\/\/\S{3,500}$/.test(url)) return { error: "invalid" };
  const id = str(fd, "id") || undefined;
  const slug =
    str(fd, "slug") ||
    `${title.en
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50) || "item"}-${Date.now().toString(36).slice(-4)}`;
  const position = Number.parseInt(str(fd, "position"), 10);
  const row = {
    ...(id ? { id } : {}),
    slug,
    category,
    title,
    description: localized(fd, "description") ?? { en: "" },
    image_src: str(fd, "image_src") || null,
    price,
    currency,
    purchase_url: url || null,
    partner: str(fd, "partner").slice(0, 80) || null,
    featured: fd.get("featured") === "on",
    collections: shopCollections.filter((c) => fd.get(`collection_${c}`) === "on"),
    position: Number.isFinite(position) ? position : 0,
    published: fd.get("published") === "on",
  };
  // Offers: validate every filled row before writing anything
  const offers: Array<Record<string, unknown>> = [];
  for (let i = 0; i < OFFER_ROWS; i++) {
    const offerUrl = str(fd, `offer_${i}_url`);
    if (!offerUrl) continue;
    if (!/^https:\/\/\S{3,800}$/.test(offerUrl)) return { error: "invalid" };
    const source = str(fd, `offer_${i}_source`);
    const p = str(fd, `offer_${i}_price`).replace(",", ".");
    const op = p ? Number(p) : null;
    if (op !== null && (!Number.isFinite(op) || op < 0)) return { error: "invalid" };
    const dmin = Number.parseInt(str(fd, `offer_${i}_dmin`), 10);
    const dmax = Number.parseInt(str(fd, `offer_${i}_dmax`), 10);
    const countries = str(fd, `offer_${i}_countries`)
      .toUpperCase()
      .split(/[\s,;]+/)
      .filter((c) => (shopCountries as readonly string[]).includes(c));
    offers.push({
      source: (shopSources as readonly string[]).includes(source) ? source : "partner",
      store_name: str(fd, `offer_${i}_store`).slice(0, 80) || null,
      countries,
      url: offerUrl,
      price: op,
      currency: (shopCurrencies as readonly string[]).includes(str(fd, `offer_${i}_currency`)) ? str(fd, `offer_${i}_currency`) : "EUR",
      delivery_min_days: Number.isFinite(dmin) ? Math.min(120, Math.max(0, dmin)) : null,
      delivery_max_days: Number.isFinite(dmax) ? Math.min(120, Math.max(0, dmax)) : null,
      position: i,
    });
  }
  const { data: saved, error } = await db.from("shop_items").upsert(row, { onConflict: "id" }).select("id").single();
  if (error || !saved) return { error: error && /duplicate|violates/i.test(error.message) ? "invalid" : "generic" };
  const itemId = (saved as { id: string }).id;
  const del = await db.from("shop_offers").delete().eq("item_id", itemId);
  if (!del.error && offers.length > 0) {
    const ins = await db.from("shop_offers").insert(offers.map((o) => ({ ...o, item_id: itemId })));
    if (ins.error) return { error: "generic" };
  }
  revalidatePath("/shop", "layout"); revalidatePublicContent();
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/shop?saved=1");
}

export async function deleteShopItem(fd: FormData): Promise<void> {
  const db = await adminDb();
  if (!db) return;
  const id = str(fd, "id");
  if (id) await db.from("shop_items").delete().eq("id", id);
  revalidatePath("/shop", "layout"); revalidatePublicContent();
  redirect("/admin/shop?deleted=1");
}
