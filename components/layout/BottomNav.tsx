"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { isActivePath, navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Phone tab bar: five tabs on a glass surface above the home indicator. */
export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      aria-label="Main"
      className="glass pb-safe fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-b-0 md:hidden"
    >
      <ul className="grid h-16 grid-cols-5">
        {navItems.map(({ key, href, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <li key={key} className="flex">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold tracking-wide transition-colors duration-300",
                  active ? "text-ink" : "text-steel hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "inline-flex h-8 w-12 items-center justify-center rounded-full transition-[background-color,box-shadow] duration-300 ease-[var(--ease-out-expo)]",
                    active && "bg-linear-to-b from-ink-2 to-ink text-white shadow-[0_8px_18px_-10px_rgba(16,36,43,0.8)]",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                </span>
                {t(key)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
