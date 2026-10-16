import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Plus, ShoppingBag } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listAllShopRows } from "@/lib/shop/queries";
import { getSessionUser } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminShopPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/admin");
  const t = await getTranslations("shop");
  const ta = await getTranslations("admin");
  const sp = await searchParams;
  const rows = await listAllShopRows();
  return (
    <div className="space-y-5">
      <SectionHeading
        as="h1"
        title={t("admin.listTitle")}
        lead={t("admin.listLead")}
        action={
          <Link href="/admin/shop/new" className={buttonStyles("primary", "md")}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("admin.new")}
          </Link>
        }
      />
      {sp.saved ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{ta("savedNotice")}</p> : null}
      {sp.deleted ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm font-semibold">{ta("deletedNotice")}</p> : null}
      {rows.length === 0 ? (
        <EmptyState icon={ShoppingBag} title={t("admin.empty")} body={t("admin.emptyBody")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {rows.map((r) => (
            <li key={r.id}>
              <Link href={`/admin/shop/${r.id}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate font-semibold">{r.title.en}</span>
                  <span className="text-steel block text-xs">
                    {t(`categories.${r.category}.title`)}
                    {r.price !== null ? ` · ${r.price} ${r.currency}` : ""}
                    {r.featured ? ` · ${t("admin.featured")}` : ""}
                  </span>
                </span>
                <StatusBadge published={r.published} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
