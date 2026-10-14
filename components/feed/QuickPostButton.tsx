import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { getSessionUser, isStaff } from "@/lib/supabase/server";

/** Floating "+" for the trainer: new post in two taps, straight from the feed. Hidden for everyone else. */
export async function QuickPostButton() {
  const user = await getSessionUser();
  if (!isStaff(user)) return null;
  const t = await getTranslations("compose");
  return (
    <Link
      href="/compose"
      aria-label={t("title")}
      className="fixed right-4 bottom-24 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-b from-ink-2 to-ink text-white shadow-[0_1px_0_rgba(197,224,233,0.25)_inset,0_18px_36px_-14px_rgba(16,36,43,0.8)] transition-transform duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:scale-95 md:right-8 md:bottom-8"
    >
      <Plus className="h-6 w-6" strokeWidth={2.2} aria-hidden />
    </Link>
  );
}
