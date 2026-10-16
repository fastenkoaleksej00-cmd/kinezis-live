"use client";

import { createLocalStore } from "./localStore";

/** Delivery country chosen by the member in the shop (per device). Null = show everything. Never inferred from the account. */
export const shopCountryStore = createLocalStore<{ country: string | null }>("kl_shop_country", { country: null });
