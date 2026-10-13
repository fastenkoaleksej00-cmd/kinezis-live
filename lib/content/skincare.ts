import type { Product, SkinArticle, SkinRoutine } from "./types";

/**
 * Skincare repository, stage 4. Deliberately empty: routines, articles and
 * products are entered by the trainer. The app never invents products,
 * brands, ingredients or claims.
 */
const routines: SkinRoutine[] = [];
const articles: SkinArticle[] = [];
const products: Product[] = [];

export function listRoutines(): SkinRoutine[] {
  return routines;
}

export function listArticles(): SkinArticle[] {
  return articles;
}

export function listProducts(): Product[] {
  return products;
}
