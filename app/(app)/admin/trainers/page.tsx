import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BadgeCheck, Pause, Play, Users } from "lucide-react";
import { TrainerBadge } from "@/components/trainer/TrainerBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getSessionUser } from "@/lib/supabase/server";
import { setAuthorStatus, setAuthorVerified } from "@/lib/trainers/actions";
import { listAuthorsAdmin } from "@/lib/trainers/queries";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Admin: every author card; verification and publishing status are set here only after a real check. */
export default async function AdminTrainersPage({ searchParams }: PageProps) {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/admin");
  const t = await getTranslations("trainers.admin");
  const tt = await getTranslations("trainer");
  const sp = await searchParams;
  const authors = await listAuthorsAdmin();

  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("trainersTitle")} lead={t("trainersLead")} />
      {sp.saved ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("decided")}</p> : null}
      {authors.length === 0 ? (
        <EmptyState icon={Users} title={t("noTrainers")} body={t("noTrainersBody")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {authors.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
              <span className="section-deep text-frost inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full font-bold">
                {a.avatar_src ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={a.avatar_src} alt="" className="h-full w-full object-cover" />
                ) : (
                  a.name.slice(0, 1)
                )}
              </span>
              <div className="min-w-0 flex-1">
                <Link href={`/trainers/${a.id}`} className="text-ink hover:text-accent flex items-center gap-1.5 font-semibold transition-colors">
                  {a.name}
                  {a.verified ? <TrainerBadge label={tt("verified")} /> : null}
                </Link>
                <p className="text-steel text-xs">
                  {a.id} · {a.user_id ? t("linked") : t("unlinked")} · {a.status === "suspended" ? t("suspended") : t("active")}
                </p>
              </div>
              <form action={setAuthorVerified}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="verified" value={a.verified ? "false" : "true"} />
                <Button type="submit" size="sm" variant={a.verified ? "ghost" : "secondary"}>
                  <BadgeCheck className="h-4 w-4" aria-hidden />
                  {a.verified ? t("unverify") : t("verify")}
                </Button>
              </form>
              <form action={setAuthorStatus}>
                <input type="hidden" name="id" value={a.id} />
                <input type="hidden" name="status" value={a.status === "suspended" ? "active" : "suspended"} />
                <Button type="submit" size="sm" variant="ghost">
                  {a.status === "suspended" ? <Play className="h-4 w-4" aria-hidden /> : <Pause className="h-4 w-4" aria-hidden />}
                  {a.status === "suspended" ? t("activate") : t("suspend")}
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
      <p className="text-steel text-xs">{t("verifyNote")}</p>
    </div>
  );
}
