import type { ActivityLevel, FitnessGoal } from "@/lib/profile/types";

export type Sex = "female" | "male";

export interface CalculatorInput {
  currentKg: number;
  targetKg: number;
  heightCm: number;
  age: number;
  activity: ActivityLevel;
  goal: FitnessGoal | null;
  sex: Sex | null;
}

export interface CalculatorResult {
  /** Estimated maintenance calories per day; a range when sex is not given */
  maintenance: { low: number; high: number };
  /** Suggested daily intake for a gentle pace; a range */
  intake: { low: number; high: number };
  /** Weight change to reach the target, kg (negative = loss) */
  deltaKg: number;
  /** Weeks at a safe pace: 0.25–0.5 kg per week */
  weeks: { fast: number; slow: number } | null;
  direction: "lose" | "gain" | "maintain";
  bmiNow: number;
  bmiTarget: number;
  warnings: Array<"minor" | "targetUnderweight" | "targetHigh" | "floorApplied">;
}

/** Mifflin–St Jeor resting energy, kcal/day */
export function bmr(sex: Sex, kg: number, cm: number, age: number): number {
  return 10 * kg + 6.25 * cm - 5 * age + (sex === "male" ? 5 : -161);
}

export const activityFactor: Record<ActivityLevel, number> = { low: 1.2, moderate: 1.45, high: 1.7 };

/**
 * Local, documented estimate. Assumptions: Mifflin–St Jeor for resting energy, activity multipliers
 * 1.2 / 1.45 / 1.7, a gentle pace of 0.25–0.5 kg per week (roughly 250–500 kcal/day), and an intake floor
 * of 1200 kcal (female) / 1500 kcal (male). Nothing here is a prescription.
 */
export function calculate(input: CalculatorInput): CalculatorResult | null {
  const { currentKg, targetKg, heightCm, age, activity, sex } = input;
  if (!(currentKg > 20 && currentKg < 400) || !(targetKg > 20 && targetKg < 400) || !(heightCm > 80 && heightCm < 250) || !(age > 0 && age < 130)) return null;
  const warnings: CalculatorResult["warnings"] = [];
  if (age < 18) warnings.push("minor");
  const h = heightCm / 100;
  const bmiNow = Math.round((currentKg / (h * h)) * 10) / 10;
  const bmiTarget = Math.round((targetKg / (h * h)) * 10) / 10;
  if (bmiTarget < 18.5) warnings.push("targetUnderweight");
  if (bmiTarget > 30 && targetKg > currentKg) warnings.push("targetHigh");

  const sexes: Sex[] = sex ? [sex] : ["female", "male"];
  const maint = sexes.map((s) => Math.round(bmr(s, currentKg, heightCm, age) * activityFactor[activity]));
  const maintenance = { low: Math.min(...maint), high: Math.max(...maint) };

  const deltaKg = Math.round((targetKg - currentKg) * 10) / 10;
  const direction: CalculatorResult["direction"] = Math.abs(deltaKg) < 0.5 ? "maintain" : deltaKg < 0 ? "lose" : "gain";
  const floor = sex === "male" ? 1500 : 1200;
  let intake: CalculatorResult["intake"];
  if (direction === "lose") {
    intake = { low: maintenance.low - 500, high: maintenance.high - 250 };
    if (intake.low < floor) {
      intake.low = floor;
      warnings.push("floorApplied");
    }
    if (intake.high < intake.low) intake.high = intake.low;
  } else if (direction === "gain") {
    intake = { low: maintenance.low + 250, high: maintenance.high + 400 };
  } else {
    intake = maintenance;
  }
  const weeks = direction === "maintain" ? null : { fast: Math.ceil(Math.abs(deltaKg) / 0.5), slow: Math.ceil(Math.abs(deltaKg) / 0.25) };
  return { maintenance, intake, deltaKg, weeks, direction, bmiNow, bmiTarget, warnings };
}
