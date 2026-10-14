"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
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
  const reduce = useReducedMotion();

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
                    "relative flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-[15px] font-semibold transition-colors duration-300",
                    active ? "text-white" : "text-mist hover:bg-white/5 hover:text-white",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="side-pill"
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 36, mass: 0.8 }}
                      className="glass-dark absolute inset-0 rounded-2xl"
                      aria-hidden
                    />
                  ) : null}
                  <Icon className="relative h-[18px] w-[18px]" strokeWidth={active ? 2.2 : 1.8} aria-hidden />
                  <span className="relative">{t(key)}</span>
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
