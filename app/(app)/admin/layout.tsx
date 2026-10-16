import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { Container } from "@/components/ui/Container";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";

/** Staff only. Everyone else is sent to their profile. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) redirect("/profile");
  const t = await getTranslations("admin");
  // Trainer's items sent back by the admin: shown as a badge on "Workouts"
  let returned = 0;
  if (user.role === "trainer" && user.authorId) {
    const db = await createServerSupabase();
    if (db) {
      const [w, c] = await Promise.all([
        db.from("workouts").select("id", { count: "exact", head: true }).eq("author_id", user.authorId).eq("review_status", "rejected"),
        db.from("courses").select("id", { count: "exact", head: true }).eq("author_id", user.authorId).eq("review_status", "rejected"),
      ]);
      returned = (w.count ?? 0) + (c.count ?? 0);
    }
  }

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <div>
        <p className="eyebrow mb-2">{user.role === "admin" ? t("eyebrow") : t("trainerEyebrow")}</p>
        <AdminNav role={user.role} returned={returned} />
      </div>
      {user.role === "trainer" && user.authorStatus !== "active" ? <p className="rounded-2xl border border-danger-line bg-danger-soft px-4 py-3 text-sm text-danger">{t("suspendedNotice")}</p> : null}
      {children}
    </Container>
  );
}
