"use client";

import { createLocalStore } from "./localStore";

/** Optional Home widgets, per device. Water is off by default; the check-in sits at the bottom and can be snoozed for a day. */
export interface HomePrefs {
  water: boolean;
  checkin: boolean;
  checkinSnoozed?: string;
}

export const homePrefsStore = createLocalStore<HomePrefs>("kl_home", { water: false, checkin: true });
