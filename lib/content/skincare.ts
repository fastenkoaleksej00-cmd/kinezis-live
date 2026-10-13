import { articleColumns, getDb, productColumns, routineColumns, rowToArticle, rowToProduct, rowToRoutine, type ArticleRow, type ProductRow, type RoutineRow } from "./db";
import type { Product, SkinArticle, SkinRoutine } from "./types";

/**
 * Skincare repository. Everything comes from Supabase and is entered by the trainer.
 * There is deliberately no sample data: the app never invents products, brands,
 * ingredients or claims.
 */

export async function listRoutines(): Promise<SkinRoutine[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("skin_routines").select(routineColumns).eq("published", true).order("published_at", { ascending: false });
  return ((data ?? []) as unknown as RoutineRow[]).map(rowToRoutine);
}

export async function getRoutine(slug: string): Promise<SkinRoutine | undefined> {
  return (await listRoutines()).find((r) => r.slug === slug);
}

export async function listArticles(): Promise<SkinArticle[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("skin_articles").select(articleColumns).eq("published", true).order("published_at", { ascending: false });
  return ((data ?? []) as unknown as ArticleRow[]).map(rowToArticle);
}

export async function getArticle(slug: string): Promise<SkinArticle | undefined> {
  return (await listArticles()).find((a) => a.slug === slug);
}

export async function listProducts(): Promise<Product[]> {
  const db = await getDb();
  if (!db) return [];
  const { data } = await db.from("products").select(productColumns).eq("published", true).order("published_at", { ascending: false });
  return ((data ?? []) as unknown as ProductRow[]).map(rowToProduct);
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await listProducts()).find((p) => p.slug === slug);
}
