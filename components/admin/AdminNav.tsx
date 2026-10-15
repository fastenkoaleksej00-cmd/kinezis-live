"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const items = [
  { key: "overview", href: "/admin", admin: false },
  { key: "workouts", href: "/admin/workouts", admin: false },
  { key: "courses", href: "/admin/courses", admin: false },
  { key: "posts", href: "/admin/posts", admin: false },
  { key: "profile", href: "/admin/profile", admin: false, trainerOnly: true },
  { key: "messages", href: "/admin/messages", admin: false },
  { key: "review", href: "/admin/review", admin: true },
  { key: "applications", href: "/admin/applications", admin: true },
  { key: "trainers", href: "/admin/trainers", admin: true },
  { key: "reports", href: "/admin/reports", admin: true },
  { key: "community", href: "/admin/community", admin: true },
  { key: "comments", href: "/admin/comments", admin: true },
  { key: "skincare", href: "/admin/skincare", admin: true },
  { key: "nutrition", href: "/admin/nutrition", admin: true },
] as const;

/** Trainers see their own tools; admins additionally get review, applications, trainers, reports and brand sections. */
export function AdminNav({ role }: { role: "trainer" | "admin" }) {
  const pathname = usePathname();
  const t = useTranslations("admin.nav");
  return (
    <nav aria-label="Admin" className="scroll-row -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
      {items
        .filter((i) => (role === "admin" ? !("trainerOnly" in i && i.trainerOnly) : !i.admin))
        .map(({ key, href }) => {
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
