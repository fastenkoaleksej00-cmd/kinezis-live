import type { WorkoutCardData } from "@/lib/content/types";
import { regionById, type ConcernId, type RegionId } from "./regions";

export interface Recommendation {
  /** Real sessions from the library that fit the area and concern, best first */
  workouts: WorkoutCardData[];
  /** Whether the concern points to the trainer rather than to exercises */
  suggestTrainer: boolean;
}

/**
 * Pure matching over the real catalogue: no invented videos. Scores sessions by
 * category and goal overlap with the region, then by the chosen concern.
 */
export function recommend(regionId: RegionId, concern: ConcernId | null, catalogue: WorkoutCardData[]): Recommendation {
  const region = regionById[regionId];
  const concernCategory = concern === "yoga" ? "yoga" : concern === "pilates" ? "pilates" : null;
  const concernGoal = concern === "stiffness" || concern === "mobility" ? "mobility" : concern === "relax" ? "relax" : concern === "prevention" ? "posture" : null;

  const scored = catalogue
    .map((w) => {
      let score = 0;
      if (region.categories.includes(w.category)) score += 3 - Math.min(2, region.categories.indexOf(w.category));
      const goalHits = w.goals.filter((g) => region.goals.includes(g)).length;
      score += goalHits;
      if (concernCategory && w.category === concernCategory) score += 3;
      if (concernGoal && w.goals.includes(concernGoal)) score += 2;
      if (concern === "stiffness" || concern === "relax") score += w.level === "beginner" ? 1 : 0;
      return { w, score };
    })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.w.durationMin - b.w.durationMin);

  return { workouts: scored.slice(0, 4).map((s) => s.w), suggestTrainer: concern === "trainer" || concern === "pain" };
}
