import type { CategoryId, Goal } from "@/lib/content/types";

export type Vec3 = [number, number, number];
export type Box = [Vec3, Vec3];

export const regionIds = ["neck", "shoulders", "chest", "upperBack", "spine", "lowerBack", "elbows", "wrists", "pelvis", "hips", "knees", "shins", "feet"] as const;
export type RegionId = (typeof regionIds)[number];

export interface Region {
  id: RegionId;
  /** Marker position on the normalised skeleton (1.75 m, feet at y = 0, facing +z) */
  anchor: Vec3;
  /** World-space boxes; a click whose hit point falls inside counts as this region (approximate, not per bone) */
  boxes: Box[];
  /** Which side the region is best seen from */
  view: "front" | "back" | "both";
  /** Library categories and goals that fit this area, used to pick real sessions */
  categories: CategoryId[];
  goals: Goal[];
}

/**
 * Boxes come from the KINEZIS skeleton prototype (zones.js), split into 13 areas.
 * Order matters: the first matching region wins, so narrow regions (spine, lower back) come before wide ones.
 */
export const regions: Region[] = [
  { id: "neck", anchor: [0, 1.48, 0.04], boxes: [[[-0.05, 1.42, -0.07], [0.05, 1.535, 0.03]]], view: "both", categories: ["mobility", "kinesiotherapy", "stretching"], goals: ["mobility", "posture", "relax"] },
  { id: "lowerBack", anchor: [0, 1.06, -0.06], boxes: [[[-0.07, 0.975, -0.09], [0.07, 1.12, 0.04]]], view: "back", categories: ["back", "kinesiotherapy", "pilates"], goals: ["posture", "recovery", "strength"] },
  { id: "spine", anchor: [0, 1.3, -0.1], boxes: [[[-0.06, 1.12, -0.12], [0.06, 1.42, -0.02]]], view: "back", categories: ["back", "kinesiotherapy", "yoga"], goals: ["mobility", "posture"] },
  { id: "upperBack", anchor: [0.1, 1.3, -0.1], boxes: [[[-0.14, 1.12, -0.12], [0.14, 1.4, -0.02]]], view: "back", categories: ["back", "mobility", "yoga"], goals: ["posture", "mobility", "relax"] },
  { id: "chest", anchor: [0, 1.26, 0.1], boxes: [[[-0.14, 1.12, -0.02], [0.14, 1.4, 0.12]]], view: "front", categories: ["mobility", "yoga", "stretching"], goals: ["posture", "mobility", "energy"] },
  { id: "shoulders", anchor: [0.19, 1.41, 0], boxes: [[[0.08, 1.33, -0.12], [0.24, 1.46, 0.1]], [[-0.24, 1.33, -0.12], [-0.08, 1.46, 0.1]]], view: "both", categories: ["mobility", "stretching", "kinesiotherapy"], goals: ["mobility", "posture", "relax"] },
  { id: "elbows", anchor: [-0.27, 1.09, 0], boxes: [[[0.13, 1.03, -0.12], [0.34, 1.15, 0.08]], [[-0.34, 1.03, -0.12], [-0.13, 1.15, 0.08]]], view: "both", categories: ["mobility", "stretching"], goals: ["mobility", "recovery"] },
  { id: "wrists", anchor: [-0.3, 0.75, 0], boxes: [[[0.18, 0.62, -0.12], [0.42, 0.92, 0.1]], [[-0.42, 0.62, -0.12], [-0.18, 0.92, 0.1]]], view: "both", categories: ["mobility", "stretching"], goals: ["mobility", "recovery"] },
  { id: "hips", anchor: [0.14, 0.86, 0.06], boxes: [[[0.06, 0.78, -0.08], [0.16, 0.9, 0.06]], [[-0.16, 0.78, -0.08], [-0.06, 0.9, 0.06]]], view: "both", categories: ["kinesiotherapy", "stretching", "yoga"], goals: ["mobility", "strength", "recovery"] },
  { id: "pelvis", anchor: [0, 0.92, 0.06], boxes: [[[-0.2, 0.8, -0.12], [0.2, 0.975, 0.1]]], view: "both", categories: ["kinesiotherapy", "pilates", "back"], goals: ["posture", "strength", "mobility"] },
  { id: "knees", anchor: [-0.12, 0.51, 0.05], boxes: [[[0.04, 0.44, -0.1], [0.2, 0.57, 0.1]], [[-0.2, 0.44, -0.1], [-0.04, 0.57, 0.1]]], view: "front", categories: ["kinesiotherapy", "mobility", "pilates"], goals: ["strength", "mobility", "recovery"] },
  { id: "shins", anchor: [0.1, 0.28, 0.04], boxes: [[[0.03, 0.105, -0.1], [0.2, 0.44, 0.1]], [[-0.2, 0.105, -0.1], [-0.03, 0.44, 0.1]]], view: "front", categories: ["stretching", "mobility"], goals: ["mobility", "recovery"] },
  { id: "feet", anchor: [0.13, 0.07, 0.1], boxes: [[[-0.25, 0, -0.12], [0.25, 0.105, 0.22]]], view: "front", categories: ["mobility", "stretching", "kinesiotherapy"], goals: ["mobility", "strength"] },
];

export const regionById = Object.fromEntries(regions.map((r) => [r.id, r])) as Record<RegionId, Region>;

export function inBox(p: { x: number; y: number; z: number }, [a, b]: Box): boolean {
  return p.x >= a[0] && p.x <= b[0] && p.y >= a[1] && p.y <= b[1] && p.z >= a[2] && p.z <= b[2];
}

/** First region whose box contains the point, or null. */
export function regionAt(p: { x: number; y: number; z: number }): RegionId | null {
  for (const r of regions) if (r.boxes.some((b) => inBox(p, b))) return r.id;
  return null;
}

export const concernIds = ["stiffness", "mobility", "relax", "prevention", "exercises", "yoga", "pilates", "materials", "pain", "trainer"] as const;
export type ConcernId = (typeof concernIds)[number];

/** Pain follow-up: mild and familiar vs. warning signs that need a professional before any exercise */
export const painKinds = ["mild", "afterLoad", "severe", "sudden", "numbness", "weakness"] as const;
export type PainKind = (typeof painKinds)[number];
export const painRedFlags: PainKind[] = ["severe", "sudden", "numbness", "weakness"];

export function regionKey(id: RegionId): string {
  return `body:${id}`;
}
