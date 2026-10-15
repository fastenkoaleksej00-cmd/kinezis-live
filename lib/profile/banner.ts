import { bannerPresets, type BannerPreset } from "./types";

/** Accepts stored values incl. legacy "deep"/"light" and returns a current palette. */
export function normalizeBanner(raw: string | null | undefined): BannerPreset {
  if (raw === "deep") return "midnight";
  if (raw === "light") return "ocean";
  return (bannerPresets as readonly string[]).includes(raw ?? "") ? (raw as BannerPreset) : "mint";
}

/** CSS classes for a banner surface (the `.cover` base adds the soft grid overlay). */
export function bannerClass(preset: BannerPreset): string {
  return `cover banner-${preset}`;
}
