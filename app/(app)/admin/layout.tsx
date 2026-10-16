import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/ui/Container";
import { getSessionUser } from "@/lib/supabase/server";

/** Staff only. Everyone else is sent to their profile. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) redirect("/profile");
  const t = await getTranslations("admin");

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <div>
        <p className="eyebrow mb-2">{user.role === "admin" ? t("eyebrow") : t("trainerEyebrow")}</p>
        <AdminNav role={user.role} />
      </div>
      {user.role === "trainer" && user.authorStatus !== "active" ? <p className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">{t("suspendedNotice")}</p> : null}
      {children}
    </Container>
  );
}
