import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { Cover } from "@/components/ui/Cover";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import type { ShopItem } from "@/lib/shop/types";
import { categoryIcon } from "./categoryIcons";

/** Product card: photo, name, price, partner and a link out to buy. No cart and no payment inside the app yet. */
export async function ShopItemCard({ item }: { item: ShopItem }) {
  const t = await getTranslations("shop");
  const locale = (await getLocale()) as Locale;
  const Icon = categoryIcon[item.category];
  const price = item.price !== undefined ? new Intl.NumberFormat(locale, { style: "currency", currency: item.currency, maximumFractionDigits: item.price % 1 === 0 ? 0 : 2 }).format(item.price) : null;
  const desc = pick(item.description, locale);

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {item.imageSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageSrc} alt={pick(item.title, locale)} loading="lazy" decoding="async" className="aspect-square w-full bg-white object-contain p-3" />
      ) : (
        <Cover tone="mint" ratio="aspect-square" className="rounded-none">
          <div className="flex h-full items-center justify-center text-white/90">
            <Icon className="h-10 w-10" strokeWidth={1.4} aria-hidden />
          </div>
        </Cover>
      )}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="eyebrow">{t(`categories.${item.category}.title`)}</p>
        <h3 className="text-ink text-[15px] leading-snug font-bold">{pick(item.title, locale)}</h3>
        {desc ? <p className="text-steel line-clamp-3 text-sm">{desc}</p> : null}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div>
            {price ? <p className="text-ink text-lg font-extrabold">{price}</p> : <p className="text-steel text-sm">{t("priceAtPartner")}</p>}
            {item.partner ? <p className="text-steel text-[11px]">{t("soldBy", { partner: item.partner })}</p> : null}
          </div>
          {item.purchaseUrl ? (
            <a href={item.purchaseUrl} target="_blank" rel="sponsored noopener noreferrer" className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-transform active:scale-95">
              {t("buy")}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
          ) : (
            <span className="bg-bone-2 text-steel inline-flex h-9 items-center rounded-full px-3 text-xs font-semibold">{t("soon")}</span>
          )}
        </div>
      </div>
    </article>
  );
}
