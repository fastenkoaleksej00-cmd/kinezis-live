"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const KEY = "kl_onboarded";

export function markOnboarded(): void {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // ignore
  }
}

/** First launch: send the visitor to /welcome once. Per device, no account needed. */
export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith("/welcome") || pathname.startsWith("/auth") || pathname.startsWith("/privacy") || pathname.startsWith("/terms")) return;
    let seen = "1";
    try {
      seen = window.localStorage.getItem(KEY) ?? "";
    } catch {
      return;
    }
    if (!seen) router.replace("/welcome");
  }, [pathname, router]);
  return null;
}
