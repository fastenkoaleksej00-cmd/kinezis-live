import type { LucideIcon } from "lucide-react";
import { Bookmark, Compass, House, Play, UserRound } from "lucide-react";
import type en from "@/messages/en.json";

export type NavKey = keyof typeof en.nav;

export interface NavItem {
  key: NavKey;
  href: string;
  icon: LucideIcon;
}

/** Five main tabs. Home is feed-first; Explore holds Workouts, Face Fitness and Skincare. */
export const navItems: NavItem[] = [
  { key: "home", href: "/", icon: House },
  { key: "explore", href: "/explore", icon: Compass },
  { key: "library", href: "/library", icon: Play },
  { key: "saved", href: "/saved", icon: Bookmark },
  { key: "profile", href: "/profile", icon: UserRound },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
