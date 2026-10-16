import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, BookOpen, ClipboardCheck, Film, Flag, Newspaper, UserRoundCheck, Users } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listAllCourses, listAllPosts, listAllWorkouts } from "@/lib/admin/queries";
import { getAdminOverview, getAuthorStats, listApplications, listPendingContent, listReports } from "@/lib/trainers/queries";
import { getSessionUser } from "@/lib/supabase/server";

/** Overview: trainers see their own content and reach; admins also see the queues. */
export default async function AdminPage() {
  const t = await getTranslations("admin");
  const user = await getSessionUser();
  const admin = user?.role === "admin";
  const scope = admin ? null : (user?.authorId ?? null);
  const [workouts, posts, courses] = await Promise.all([listAllWorkouts(scope), listAllPosts(scope), listAllCourses(scope)]);
  const stats = user?.authorId ? await getAuthorStats(user.authorId) : null;
  const queues = admin ? await Promise.all([listPendingContent(), listApplications("submitted"), listReports("open")]) : null;

  const cards = [
    { href: "/admin/workouts", icon: Film, title: t("nav.workouts"), sub: t("counts", { total: workouts.length, published: workouts.filter((w) => w.published && w.review_status === "approved").length }), tone: "accent" },
    { href: "/admin/courses", icon: BookOpen, title: t("nav.courses"), sub: t("counts", { total: courses.length, published: courses.filter((c) => c.published && c.review_status === "approved").length }), tone: "mint" },
    { href: "/admin/posts", icon: Newspaper, title: t("nav.posts"), sub: t("counts", { total: posts.length, published: posts.filter((p) => p.published).length }), tone: "accent" },
    ...(queues
      ? [
          { href: "/admin/review", icon: ClipboardCheck, title: t("nav.review"), sub: t("queue", { count: queues[0].workouts.length + queues[0].courses.length }), tone: "mint" },
          { href: "/admin/applications", icon: UserRoundCheck, title: t("nav.applications"), sub: t("queue", { count: queues[1].length }), tone: "accent" },
          { href: "/admin/reports", icon: Flag, title: t("nav.reports"), sub: t("queue", { count: queues[2].length }), tone: "mint" },
          { href: "/admin/trainers", icon: Users, title: t("nav.trainers"), sub: t("trainersHint"), tone: "accent" },
        ]
      : []),
  ];
  const overview = admin ? await getAdminOverview() : null;
  const pendingOwn = workouts.filter((w) => w.review_status === "pending").length + courses.filter((c) => c.review_status === "pending").length;

  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={admin ? t("title") : t("trainerTitle")} lead={t("lead", { name: user?.displayName ?? user?.email ?? "" })} />
      {overview ? (
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {([
            ["members", overview.members],
            ["new7d", overview.new7d],
            ["active7d", overview.active7d],
            ["posts7d", overview.posts7d],
            ["openReports", overview.openReports],
            ["pendingReview", overview.pendingReview],
          ] as const).map(([k, v]) => (
            <div key={k} className="card px-4 py-3.5">
              <p className="text-ink text-2xl font-extrabold">{v}</p>
              <p className="text-steel text-xs">{t(`overview.${k}`)}</p>
            </div>
          ))}
        </section>
      ) : null}
      {!admin && !user?.authorId ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm">{t("noAuthorCard")}</p> : null}
      {stats ? (
        <section className="grid grid-cols-3 gap-3 sm:max-w-md">
          {[
            { label: t("stats.published"), value: stats.published },
            { label: t("stats.completions"), value: stats.completions },
            { label: t("stats.likes"), value: stats.likes },
          ].map((c) => (
            <div key={c.label} className="card px-4 py-3.5">
              <p className="text-ink text-2xl font-extrabold">{c.value}</p>
              <p className="text-steel text-xs">{c.label}</p>
            </div>
          ))}
        </section>
      ) : null}
      {!admin && pendingOwn > 0 ? <p className="bg-accent-soft text-accent rounded-2xl px-4 py-3 text-sm font-semibold">{t("pendingOwn", { count: pendingOwn })}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ href, icon: Icon, title, sub, tone }) => (
          <Link key={href} href={href} className="card group flex items-center gap-4 p-5 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
            <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${tone === "mint" ? "bg-mint-soft text-mint-deep" : "bg-accent-soft text-accent"}`}>
              <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-ink block font-bold">{title}</span>
              <span className="text-steel block text-sm">{sub}</span>
            </span>
            <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 transition-colors" aria-hidden />
          </Link>
        ))}
      </div>
      {!admin ? <p className="text-steel text-xs">{t("trainerRules")}</p> : <p className="text-steel text-xs">{t("sampleHint")}</p>}
    </div>
  );
}
