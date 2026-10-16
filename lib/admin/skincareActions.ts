"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { redirect } from "next/navigation";
import { localized, str } from "@/lib/forms";
import { type AdminState, localizedLines, staffClient, slugify, inList, published, mapDbError, languagesList } from "./shared";

/* ----------------------------------------------------------------------------
   Skincare: routines, articles, products
---------------------------------------------------------------------------- */

export async function saveRoutine(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(title.en));
  const steps = localizedLines(fd, "steps");
  if (steps.length === 0) return { error: "bodyRequired" };
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    time_of_day: inList(["morning", "evening", "weekly"] as const, str(fd, "time_of_day"), "morning"),
    steps,
    language: inList(languagesList, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("skin_routines").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/skincare?saved=1");
}

export async function deleteRoutine(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("skin_routines").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/skincare?deleted=1");
}

export async function saveArticle(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const body = localized(fd, "body");
  if (!body) return { error: "bodyRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(title.en));
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    body,
    language: inList(languagesList, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("skin_articles").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/skincare?saved=1");
}

export async function deleteArticle(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("skin_articles").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/skincare?deleted=1");
}

const productCategories = ["cleanser", "toner", "serum", "moisturizer", "spf", "mask", "tool", "other"] as const;

export async function saveProduct(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const name = str(fd, "name");
  if (!name) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const slug = str(fd, "slug") || (await slugify(`${str(fd, "brand")} ${name}`));
  const ingredients = str(fd, "ingredients")
    .split(/\r?\n|,/)
    .map((s) => s.trim())
    .filter(Boolean);
  const purchaseUrl = str(fd, "purchase_url");
  const imageSrc = str(fd, "image_src");
  const row = {
    ...(id ? { id } : {}),
    slug,
    name,
    brand: str(fd, "brand"),
    category: inList(productCategories, str(fd, "category"), "other"),
    description: localized(fd, "description") ?? { en: "" },
    ingredients,
    usage: localized(fd, "usage") ?? { en: "" },
    purchase_url: purchaseUrl || null,
    image_src: imageSrc || null,
    language: inList(languagesList, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("products").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/skincare?saved=1");
}

export async function deleteProduct(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("products").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/skincare?deleted=1");
}
