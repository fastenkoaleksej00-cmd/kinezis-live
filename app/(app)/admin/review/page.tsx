import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Check, ClipboardCheck, X } from "lucide-react";
import { Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listAuthorRows } from "@/lib/admin/queries";
import { getSessionUser } from "@/lib/supabase/server";
import { reviewContent } from "@/lib/trainers/actions";
import { listPendingContent } from "@/lib/trainers/queries";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Admin: trainers' publications waiting for a decision. Approved items go live; rejected ones return to the author with a note. */
export default async function AdminReviewPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/admin");
  const t = await getTranslations("trainers.admin");
  const tl = await getTranslations("library");
  const tc = await getTranslations("common");
  const sp = await searchParams;
  const [{ workouts, courses }, authors] = await Promise.all([listPendingContent(), listAuthorRows()]);
  const authorName = (id: string | null) => authors.find((a) => a.id === id)?.name ?? "—";
  const items = [
    ...workouts.map((w) => ({ table: "workouts" as const, id: w.id, title: w.title.en, meta: `${tl(`categories.${w.category}`)} · ${tc("minutes", { count: w.duration_min })} · ${authorName(w.author_id)}`, href: `/admin/workouts/${w.id}` })),
    ...courses.map((c) => ({ table: "courses" as const, id: c.id, title: c.title.en, meta: `${t(c.kind === "program" ? "kindProgram" : "kindCourse")} · ${authorName(c.author_id)}`, href: `/admin/courses/${c.id}` })),
  ];

  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("reviewTitle")} lead={t("reviewLead")} />
      {sp.decided ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("decided")}</p> : null}
      {items.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title={t("noReview")} body={t("noReviewBody")} />
      ) : (
        <ul className="space-y-3">
          {items.map((i) => (
            <li key={`${i.table}-${i.id}`} className="card space-y-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={i.href} className="text-ink hover:text-accent block font-bold transition-colors">
                    {i.title}
                  </Link>
                  <p className="text-steel text-xs">{i.meta}</p>
                </div>
                <Link href={i.href} className="text-accent shrink-0 text-xs font-semibold hover:underline">
                  {t("open")}
                </Link>
              </div>
              <form action={reviewContent} className="flex flex-wrap items-end gap-2">
                <input type="hidden" name="table" value={i.table} />
                <input type="hidden" name="id" value={i.id} />
                <label className="min-w-[200px] flex-1">
                  <span className="text-steel mb-1 block text-xs font-semibold">{t("fields.note")}</span>
                  <Textarea name="note" rows={1} maxLength={1000} />
                </label>
                <Button type="submit" size="md" name="decision" value="approve">
                  <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  {t("approve")}
                </Button>
                <Button type="submit" size="md" variant="secondary" name="decision" value="reject">
                  <X className="h-4 w-4" aria-hidden />
                  {t("reject")}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <p className="text-steel text-xs">{t("reviewNote")}</p>
    </div>
  );
}
