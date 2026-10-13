import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Film, Newspaper } from "lucide-react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listAllPosts, listAllWorkouts } from "@/lib/admin/queries";
import { getSessionUser } from "@/lib/supabase/server";

export default async function AdminPage() {
  const t = await getTranslations("admin");
  const user = await getSessionUser();
  const [workouts, posts] = await Promise.all([listAllWorkouts(), listAllPosts()]);
  const cards = [
    { href: "/admin/workouts", icon: Film, title: t("nav.workouts"), total: workouts.length, published: workouts.filter((w) => w.published).length },
    { href: "/admin/posts", icon: Newspaper, title: t("nav.posts"), total: posts.length, published: posts.filter((p) => p.published).length },
  ];

  return (
    <div className="space-y-6">
      <SectionHeading as="h1" title={t("title")} lead={t("lead", { name: user?.displayName ?? user?.email ?? "" })} />
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map(({ href, icon: Icon, title, total, published }) => (
          <Link key={href} href={href} className="card group flex items-center gap-4 p-5 transition-[transform,box-shadow] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5">
            <span className="bg-accent-soft text-accent inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl">
              <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="text-ink block font-bold">{title}</span>
              <span className="text-steel block text-sm">{t("counts", { total, published })}</span>
            </span>
            <ArrowUpRight className="text-steel group-hover:text-ink h-4 w-4 transition-colors" aria-hidden />
          </Link>
        ))}
      </div>
      <p className="text-steel text-xs">{t("sampleHint")}</p>
    </div>
  );
}
