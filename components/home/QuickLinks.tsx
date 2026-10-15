import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { PersonStanding, Play, UtensilsCrossed } from "lucide-react";

/** Three one-tap entries under the greeting: body map, nutrition, library. */
export async function QuickLinks() {
  const t = await getTranslations("home.quick");
  const items = [
    { href: "/body", icon: PersonStanding, label: t("body"), tone: "bg-accent-soft text-accent" },
    { href: "/nutrition", icon: UtensilsCrossed, label: t("nutrition"), tone: "bg-mint-soft text-mint-deep" },
    { href: "/library", icon: Play, label: t("library"), tone: "bg-accent-soft text-accent" },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map(({ href, icon: Icon, label, tone }) => (
        <Link key={href} href={href} className="card flex flex-col items-center gap-2 px-2 py-3.5 text-center transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:scale-95">
          <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${tone}`}>
            <Icon className="h-5 w-5" strokeWidth={1.9} aria-hidden />
          </span>
          <span className="text-ink text-xs font-semibold">{label}</span>
        </Link>
      ))}
    </div>
  );
}
