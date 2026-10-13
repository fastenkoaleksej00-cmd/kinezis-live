"use server";

import { cookies } from "next/headers";
import { isLocale, LOCALE_COOKIE } from "@/i18n/config";

const ONE_YEAR = 60 * 60 * 24 * 365;

/** Server action: stores the chosen interface language in a cookie. */
export async function setLocale(value: string): Promise<void> {
  if (!isLocale(value)) return;
  const store = await cookies();
  store.set(LOCALE_COOKIE, value, {
    path: "/",
    maxAge: ONE_YEAR,
    sameSite: "lax",
    httpOnly: false,
  });
}
