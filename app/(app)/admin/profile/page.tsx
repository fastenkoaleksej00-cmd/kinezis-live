import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { AuthorCardForm } from "@/components/admin/AuthorCardForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSessionUser } from "@/lib/supabase/server";
import { getMyAuthorRow } from "@/lib/trainers/queries";

/** Trainer: own public card (name, photo, cover palette, bio, specialties, qualifications, links). */
export default async function AdminProfilePage() {
  const user = await getSessionUser();
  if (!user || (user.role !== "trainer" && user.role !== "admin")) redirect("/profile");
  const t = await getTranslations("trainers.card");
  const author = await getMyAuthorRow();
  return (
    <div className="space-y-5">
      <SectionHeading
        as="h1"
        title={t("title")}
        lead={t("lead")}
        action={
          author ? (
            <Link href={`/trainers/${author.id}`} className="text-accent inline-flex items-center gap-1 text-sm font-semibold hover:underline">
              {t("viewPublic")}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          ) : undefined
        }
      />
      {author ? <AuthorCardForm author={author} userId={user.id} /> : <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm">{t("noCard")}</p>}
    </div>
  );
}
