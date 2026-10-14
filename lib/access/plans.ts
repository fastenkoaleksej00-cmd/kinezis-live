import type { Access } from "@/lib/content/types";

export const plans = ["free", "premium", "premium_plus"] as const;
export type Plan = (typeof plans)[number];

/** Prices are a product decision, shown as "planned" until payments exist. */
export const planPrices: Record<Exclude<Plan, "free">, { monthly: number; currency: "USD" }> = {
  premium: { monthly: 5.99, currency: "USD" },
  premium_plus: { monthly: 9.99, currency: "USD" },
};

export function isPlan(v: unknown): v is Plan {
  return typeof v === "string" && (plans as readonly string[]).includes(v);
}

/**
 * Entitlement check. Staff always see everything. A plan that has expired counts as free.
 * Premium Plus includes Premium.
 */
export function canAccess(opts: { access: Access; plan: Plan; planUntil?: string | null; staff?: boolean }): boolean {
  if (opts.access === "free" || opts.staff) return true;
  if (opts.plan === "free") return false;
  if (opts.planUntil && new Date(opts.planUntil).getTime() < Date.now()) return false;
  return true;
}
