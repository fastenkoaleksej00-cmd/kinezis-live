"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Settings } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { isActivePath, navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Tablet and desktop sidebar on a petrol surface. */
export function SideNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const tc = useTranslations("common");
  const tb = useTranslations("brand");

  return (
    <aside className="section-deep fixed inset-y-0 left-0 z-40 hidden w-64 flex-col px-5 py-7 text-white md:flex">
      <div className="grid-bg-dark pointer-events-none absolute inset-0" aria-hidden />
      <Link href="/" className="relative mb-10 inline-flex items-center">
        <Logo tone="white" />
      </Link>
      <nav aria-label="Main" className="relative flex-1">
        <ul className="space-y-1.5">
          {navItems.map(({ key, href, icon: Icon }) => {
            const active = isActivePath(pathname, href);
            return (
              <li key={key}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold transition-[background-color,color,border-color] duration-300",
                    active ? "glass-dark text-white" : "text-mist hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                  {t(key)}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="relative space-y-4">
        <Link
          href="/profile/settings"
          className={cn(
            "text-mist flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold transition-colors duration-300 hover:bg-white/5 hover:text-white",
            isActivePath(pathname, "/profile/settings") && "glass-dark text-white",
          )}
        >
          <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
          {tc("settings")}
        </Link>
        <p className="text-mist-2 px-3.5 text-[11px] font-semibold tracking-[0.2em] uppercase">{tb("tagline")}</p>
      </div>
    </aside>
  );
}
