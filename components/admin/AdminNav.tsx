"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const items = [
  { key: "overview", href: "/admin" },
  { key: "workouts", href: "/admin/workouts" },
  { key: "posts", href: "/admin/posts" },
  { key: "courses", href: "/admin/courses" },
  { key: "skincare", href: "/admin/skincare" },
  { key: "nutrition", href: "/admin/nutrition" },
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
  return (
    <nav aria-label="Admin" className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      {items.map(({ key, href }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 shrink-0 items-center rounded-full px-4 text-sm font-semibold transition-[background-color,color] duration-300",
              active ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70 hover:bg-white",
            )}
          >
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}
