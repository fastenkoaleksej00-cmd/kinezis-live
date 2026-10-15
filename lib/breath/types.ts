import type { LocalizedText } from "@/lib/content/types";

export const breathCategories = ["basics", "calm", "mobility", "digestive", "recovery", "rehab"] as const;
export type BreathCategory = (typeof breathCategories)[number];

export const breathGoals = ["learn", "relax", "recover", "coordinate", "reflux", "sleep", "specialist"] as const;
export type BreathGoal = (typeof breathGoals)[number];

export type EvidenceLevel = "established" | "encouraging" | "insufficient";

export interface BreathPhase {
  kind: "inhale" | "exhale" | "hold" | "rest";
  seconds: number;
}

export interface Source {
  id: string;
  citation: string;
  url: string;
  year: number;
  type: "rct" | "meta" | "review" | "physiology" | "observational";
}

export interface EvidenceCard {
  id: string;
  claim: LocalizedText;
  level: EvidenceLevel;
  population: LocalizedText;
  intervention: LocalizedText;
  outcomes: LocalizedText;
  limitations: LocalizedText;
  sources: string[];
  checked: string;
}

export interface Practice {
  id: string;
  category: BreathCategory;
  goals: BreathGoal[];
  title: LocalizedText;
  purpose: LocalizedText;
  description: LocalizedText;
  steps: LocalizedText[];
  cautions: LocalizedText[];
  /** One cycle; repeated until the chosen duration runs out */
  pattern: BreathPhase[];
  /** Minutes offered in the UI */
  durations: number[];
  level: "beginner" | "intermediate";
  /** Posture or movement cue shown during the session */
  cue?: LocalizedText;
  evidence: string;
}
