"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { isActivePath, navItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

/** Phone tab bar: five tabs on a glass surface above the home indicator. */
export function BottomNav() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  const reduce = useReducedMotion();

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
                  "flex flex-1 flex-col items-center justify-center gap-1 text-[10.5px] font-semibold tracking-wide transition-[color,transform] duration-300 active:scale-95",
                  active ? "text-ink" : "text-steel hover:text-ink",
                )}
              >
                <span className={cn("relative inline-flex h-8 w-12 items-center justify-center rounded-full transition-colors duration-300", active && "text-white")}>
                  {active ? (
                    <motion.span
                      layoutId="tab-pill"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36, mass: 0.8 }}
                      className="absolute inset-0 rounded-full bg-linear-to-b from-ink-2 to-ink shadow-[0_8px_18px_-10px_rgba(16,36,43,0.8)]"
                      aria-hidden
                    />
                  ) : null}
                  <Icon className="relative h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
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
