import type { LucideIcon } from "lucide-react";
import { Compass, House, PersonStanding, Play, UserRound } from "lucide-react";
import type en from "@/messages/en.json";

export type NavKey = keyof typeof en.nav;

export interface NavItem {
  key: NavKey;
  href: string;
  icon: LucideIcon;
}

/** Five main tabs. Body map sits in the middle; Saved lives inside Profile and Explore. */
export const navItems: NavItem[] = [
  { key: "home", href: "/", icon: House },
  { key: "explore", href: "/explore", icon: Compass },
  { key: "body", href: "/body", icon: PersonStanding },
  { key: "library", href: "/library", icon: Play },
  { key: "profile", href: "/profile", icon: UserRound },
];

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
