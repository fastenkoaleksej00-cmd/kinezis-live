import Link from "next/link";
import { redirect } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { Check, EyeOff, Flag } from "lucide-react";
import { Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSessionUser } from "@/lib/supabase/server";
import { resolveReport } from "@/lib/trainers/actions";
import { listReports } from "@/lib/trainers/queries";
import { cn } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const targetHref = (type: string, id: string) => (type === "post" ? `/posts/${id}` : type === "trainer" ? `/trainers/${id}` : type === "workout" ? `/admin/workouts/${id}` : type === "course" ? `/admin/courses/${id}` : "/admin/comments");

/** Admin: members' reports. Resolving can also hide the target (post/comment) or pull it from the library (workout/course). */
export default async function AdminReportsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/admin");
  const t = await getTranslations("trainers.admin");
  const tr = await getTranslations("report");
  const format = await getFormatter();
  const sp = await searchParams;
  const status = sp.status === "all" ? "all" : sp.status === "resolved" ? "resolved" : "open";
  const reports = await listReports(status);

  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("reportsTitle")} lead={t("reportsLead")} />
      {sp.decided ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("decided")}</p> : null}
      <div className="flex gap-2">
        {(["open", "resolved", "all"] as const).map((s) => (
          <Link key={s} href={`/admin/reports?status=${s}`} className={cn("inline-flex h-9 items-center rounded-full px-4 text-sm font-semibold", status === s ? "bg-linear-to-b from-ink-2 to-ink text-white" : "border-ink/10 text-ink border bg-white/70")}>
            {t(`reportFilter.${s}`)}
          </Link>
        ))}
      </div>
      {reports.length === 0 ? (
        <EmptyState icon={Flag} title={t("noReports")} body={t("noReportsBody")} />
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="card space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-[#fde8ea] text-[#b9344a] inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold uppercase">{tr(`reasons.${r.reason}`)}</span>
                <span className="bg-bone-2 text-steel inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold uppercase">{tr(`targets.${r.targetType}`)}</span>
                <span className="text-steel text-xs">{format.dateTime(new Date(r.createdAt), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                <Link href={targetHref(r.targetType, r.targetId)} className="text-accent ml-auto text-xs font-semibold hover:underline">
                  {t("open")}
                </Link>
              </div>
              {r.details ? <p className="text-text text-sm whitespace-pre-line">{r.details}</p> : null}
              {r.status === "open" ? (
                <form action={resolveReport} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="target_type" value={r.targetType} />
                  <input type="hidden" name="target_id" value={r.targetId} />
                  <label className="min-w-[200px] flex-1">
                    <span className="text-steel mb-1 block text-xs font-semibold">{t("fields.resolution")}</span>
                    <Textarea name="resolution" rows={1} maxLength={1000} />
                  </label>
                  <Button type="submit" size="md" name="status" value="resolved">
                    <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    {t("resolve")}
                  </Button>
                  {r.targetType !== "trainer" ? (
                    <Button type="submit" size="md" variant="secondary" name="action" value="hide">
                      <EyeOff className="h-4 w-4" aria-hidden />
                      {t("resolveHide")}
                    </Button>
                  ) : null}
                  <Button type="submit" size="md" variant="ghost" name="status" value="dismissed">
                    {t("dismiss")}
                  </Button>
                </form>
              ) : (
                <p className="text-steel text-xs">{t(`reportStatus.${r.status}`)}{r.resolution ? ` · ${r.resolution}` : ""}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
