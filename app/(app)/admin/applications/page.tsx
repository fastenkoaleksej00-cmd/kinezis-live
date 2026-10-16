import { redirect } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { Check, Eye, UserRoundCheck, X } from "lucide-react";
import { Input, Textarea } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSessionUser } from "@/lib/supabase/server";
import { decideApplication } from "@/lib/trainers/actions";
import { listApplications } from "@/lib/trainers/queries";
import { createServerSupabase } from "@/lib/supabase/server";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Admin: review trainer applications. Approval creates the author card and grants the trainer role (database function). */
export default async function AdminApplicationsPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/admin");
  const t = await getTranslations("trainers.admin");
  const tl = await getTranslations("library");
  const format = await getFormatter();
  const sp = await searchParams;
  const apps = (await listApplications()).filter((a) => a.status !== "draft");
  const db = await createServerSupabase();
  // Signed links for qualification documents (private bucket, 1 hour)
  const docLinks: Record<string, string> = {};
  if (db) {
    for (const a of apps) {
      for (const path of a.documents.slice(0, 5)) {
        const { data } = await db.storage.from("trainer-docs").createSignedUrl(path, 3600);
        if (data?.signedUrl) docLinks[path] = data.signedUrl;
      }
    }
  }

  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("applicationsTitle")} lead={t("applicationsLead")} />
      {sp.decided ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("decided")}</p> : null}
      {apps.length === 0 ? (
        <EmptyState icon={UserRoundCheck} title={t("noApplications")} body={t("noApplicationsBody")} />
      ) : (
        <ul className="space-y-4">
          {apps.map((a) => (
            <li key={a.id} className="card space-y-4 p-5">
              <div className="flex items-start gap-4">
                <span className="section-deep text-frost inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full text-lg font-bold">
                  {a.photoSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.photoSrc} alt="" className="h-full w-full object-cover" />
                  ) : (
                    a.fullName.slice(0, 1) || "?"
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-ink font-bold">{a.fullName || "—"}</p>
                    <span className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold uppercase ${a.status === "approved" ? "bg-mint-soft text-mint-deep" : a.status === "rejected" ? "bg-alert-soft text-alert" : "bg-accent-soft text-accent"}`}>{t(`status.${a.status}`)}</span>
                  </div>
                  <p className="text-steel text-xs">{a.submittedAt ? format.dateTime(new Date(a.submittedAt), { day: "numeric", month: "short", year: "numeric" }) : ""}{a.experienceYears !== null ? ` · ${t("years", { count: a.experienceYears })}` : ""}</p>
                  {a.specialties.length > 0 ? <p className="text-steel mt-1 text-xs">{a.specialties.map((s) => tl(`categories.${s as "yoga"}`)).join(" · ")}</p> : null}
                </div>
              </div>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="bg-frost/70 rounded-2xl p-3">
                  <p className="text-steel text-xs font-semibold tracking-[0.12em] uppercase">{t("fields.bio")}</p>
                  <p className="text-text mt-1 whitespace-pre-line">{a.bio || "—"}</p>
                </div>
                <div className="bg-frost/70 rounded-2xl p-3">
                  <p className="text-steel text-xs font-semibold tracking-[0.12em] uppercase">{t("fields.qualifications")}</p>
                  <p className="text-text mt-1 whitespace-pre-line">{a.qualifications || "—"}</p>
                  {a.links.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      {a.links.map((l) => (
                        <li key={l}>
                          <a href={l} target="_blank" rel="noopener noreferrer" className="text-accent text-xs break-all hover:underline">
                            {l}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {a.documents.length > 0 ? (
                    <ul className="mt-2 flex flex-wrap gap-2">
                      {a.documents.map((d, i) => (
                        <li key={d}>
                          {docLinks[d] ? (
                            <a href={docLinks[d]} target="_blank" rel="noopener noreferrer" className="bg-accent-soft text-accent inline-flex h-7 items-center rounded-full px-2.5 text-xs font-semibold">
                              {t("document", { n: i + 1 })}
                            </a>
                          ) : (
                            <span className="bg-bone-2 text-steel inline-flex h-7 items-center rounded-full px-2.5 text-xs">{t("document", { n: i + 1 })}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
              {a.status === "submitted" || a.status === "review" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <form action={decideApplication} className="bg-mint-soft/60 space-y-2 rounded-2xl p-3">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="decision" value="approve" />
                    <label className="block">
                      <span className="text-steel mb-1 block text-xs font-semibold">{t("fields.slug")}</span>
                      <Input name="author_slug" pattern="[a-z0-9-]*" placeholder="anna-k" />
                    </label>
                    <Button type="submit" size="md">
                      <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                      {t("approve")}
                    </Button>
                    <p className="text-steel text-xs">{t("approveHint")}</p>
                  </form>
                  <form action={decideApplication} className="bg-frost/70 space-y-2 rounded-2xl p-3">
                    <input type="hidden" name="id" value={a.id} />
                    <input type="hidden" name="decision" value="reject" />
                    <label className="block">
                      <span className="text-steel mb-1 block text-xs font-semibold">{t("fields.note")}</span>
                      <Textarea name="note" rows={2} maxLength={1000} />
                    </label>
                    <div className="flex gap-2">
                      <Button type="submit" size="md" variant="secondary">
                        <X className="h-4 w-4" aria-hidden />
                        {t("reject")}
                      </Button>
                      {a.status === "submitted" ? (
                        <Button type="submit" size="md" variant="ghost" name="decision" value="review">
                          <Eye className="h-4 w-4" aria-hidden />
                          {t("markReview")}
                        </Button>
                      ) : null}
                    </div>
                  </form>
                </div>
              ) : a.adminNote ? (
                <p className="text-steel text-xs">{t("fields.note")}: {a.adminNote}</p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
