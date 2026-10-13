import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

interface SectionLinkProps {
  href: string;
  icon: LucideIcon;
  title: string;
  body: string;
  countLabel: string;
}

/** Hub row for a skincare section with an item count. */
export function SectionLink({ href, icon: Icon, title, body, countLabel }: SectionLinkProps) {
  return (
    <Link href={href} className="card group flex items-center gap-4 p-4 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 sm:p-5">
      <span className="bg-mint-soft text-mint-deep inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
        <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="text-ink block font-bold">{title}</span>
        <span className="text-steel block text-sm">{body}</span>
        <span className="text-mint-deep mt-1 block text-xs font-semibold">{countLabel}</span>
      </span>
      <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 transition-colors" aria-hidden />
    </Link>
  );
}
