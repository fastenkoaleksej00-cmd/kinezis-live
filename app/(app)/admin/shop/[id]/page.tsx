import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ShopItemForm } from "@/components/shop/ShopItemForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getShopRow, listOfferRows } from "@/lib/shop/queries";
import { getSessionUser } from "@/lib/supabase/server";

export default async function EditShopItemPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/admin");
  const { id } = await params;
  const item = await getShopRow(id);
  if (!item) notFound();
  const t = await getTranslations("shop.admin");
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("edit")} />
      <ShopItemForm item={item} offers={await listOfferRows(item.id)} />
    </div>
  );
}
