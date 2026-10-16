import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ShopItemForm } from "@/components/shop/ShopItemForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSessionUser } from "@/lib/supabase/server";

export default async function NewShopItemPage() {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/admin");
  const t = await getTranslations("shop.admin");
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("new")} />
      <ShopItemForm />
    </div>
  );
}
