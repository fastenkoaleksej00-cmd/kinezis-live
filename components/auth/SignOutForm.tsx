"use client";

import { clearPersonalData } from "@/lib/store/clearPersonal";

/** Sign-out form that wipes personal per-device data before the server ends the session. */
export function SignOutForm({ action, className, children }: { action: () => Promise<void>; className?: string; children: React.ReactNode }) {
  return (
    <form action={action} onSubmit={() => clearPersonalData()} className={className}>
      {children}
    </form>
  );
}
