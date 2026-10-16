"use client";

import { createLocalStore } from "./localStore";

/**
 * Screen tips extend the first-launch introduction (kl_onboarded): each tip shows once per device,
 * can be dismissed, switched off or replayed in Settings. Nothing here is required to use the app.
 */
export const tipIds = ["home", "library", "mind", "nutrition", "community", "shop", "profile", "health", "bodyPick"] as const;
export type TipId = (typeof tipIds)[number];

export interface TipsState {
  seen: TipId[];
  off: boolean;
}

export const tipsStore = createLocalStore<TipsState>("kl_tips", { seen: [], off: false });

export function dismissTip(id: TipId): void {
  const s = tipsStore.read();
  if (!s.seen.includes(id)) tipsStore.write({ ...s, seen: [...s.seen, id] });
}
