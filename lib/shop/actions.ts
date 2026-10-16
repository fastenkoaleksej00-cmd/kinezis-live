"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { LocalizedText } from "@/lib/content/types";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";
import { shopCategories, shopCurrencies } from "./types";

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
    position: Number.isFinite(position) ? position : 0,
    published: fd.get("published") === "on",
  };
  const { error } = await db.from("shop_items").upsert(row, { onConflict: "id" });
  if (error) return { error: /duplicate|violates/i.test(error.message) ? "invalid" : "generic" };
  revalidatePath("/shop", "layout");
  revalidatePath("/", "layout");
  redirect("/admin/shop?saved=1");
}

export async function deleteShopItem(fd: FormData): Promise<void> {
  const db = await adminDb();
  if (!db) return;
  const id = str(fd, "id");
  if (id) await db.from("shop_items").delete().eq("id", id);
  revalidatePath("/shop", "layout");
  redirect("/admin/shop?deleted=1");
}
