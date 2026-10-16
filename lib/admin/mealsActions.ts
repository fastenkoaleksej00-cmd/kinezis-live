"use server";

import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/content/revalidate";
import { redirect } from "next/navigation";
import { mealSlots, type LocalizedText, type MealSlot } from "@/lib/content/types";
import { localized, str } from "@/lib/forms";
import { type AdminState, staffClient, authorFor, slugify, inList, published, mapDbError, languagesList } from "./shared";

/* ----------------------------------------------------------------------------
   Meal plans
---------------------------------------------------------------------------- */

export async function saveMealPlan(_prev: AdminState, fd: FormData): Promise<AdminState> {
  const ctx = await staffClient();
  if ("error" in ctx) return { error: ctx.error };
  const title = localized(fd, "title");
  if (!title) return { error: "titleRequired" };
  const id = str(fd, "id") || undefined;
  const date = str(fd, "plan_date");
  const slug = str(fd, "slug") || (await slugify(`${date || ""} ${title.en}`));
  const meals = mealSlots
    .map((slot) => ({ slot, text: localized(fd, `meal_${slot}`) }))
    .filter((m): m is { slot: MealSlot; text: LocalizedText } => m.text !== null);
  if (meals.length === 0) return { error: "bodyRequired" };
  const row = {
    ...(id ? { id } : {}),
    slug,
    title,
    plan_date: date || null,
    meals,
    notes: localized(fd, "notes"),
    author_id: authorFor(ctx.user, str(fd, "author_id")),
    language: inList(languagesList, str(fd, "language"), "uk"),
    access: str(fd, "access") === "premium" ? "premium" : "free",
    ...published(fd, str(fd, "published_at_prev") || null),
  };
  const { error } = await ctx.db.from("meal_plans").upsert(row, { onConflict: "id" });
  if (error) return { error: mapDbError(error.message) };
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/nutrition?saved=1");
}

export async function deleteMealPlan(fd: FormData): Promise<void> {
  const ctx = await staffClient();
  if ("error" in ctx) return;
  const id = str(fd, "id");
  if (id) await ctx.db.from("meal_plans").delete().eq("id", id);
  revalidatePath("/", "layout"); revalidatePublicContent();
  redirect("/admin/nutrition?deleted=1");
}
