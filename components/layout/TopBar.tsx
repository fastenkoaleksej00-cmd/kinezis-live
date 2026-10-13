import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Settings } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

/** Phone header: logo on the left, settings on the right. Hidden on wide screens where the sidebar takes over. */
export async function TopBar() {
  const t = await getTranslations("common");
  return (
    <header className="pt-safe glass sticky top-0 z-30 rounded-b-3xl border-t-0 md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" aria-label="KINEZIS LIVE">
          <Logo />
        </Link>
        <Link
          href="/profile/settings"
          aria-label={t("settings")}
          className="text-ink inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/55 backdrop-blur-md transition-colors hover:bg-white"
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
        </Link>
      </div>
    </header>
  );
}
