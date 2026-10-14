import { getDb, mealPlanColumns, rowToMealPlan, type MealPlanRow } from "./db";
import type { MealPlan } from "./types";

/** Nutrition repository. DB only: the trainer's own days, no invented plans. */
export async function listMealPlans(): Promise<MealPlan[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("meal_plans").select(mealPlanColumns).eq("published", true).order("plan_date", { ascending: false, nullsFirst: false }).order("published_at", { ascending: false });
  return ((data ?? []) as unknown as MealPlanRow[]).map(rowToMealPlan);
}

export async function getMealPlan(slug: string): Promise<MealPlan | undefined> {
  return (await listMealPlans()).find((m) => m.slug === slug);
}
