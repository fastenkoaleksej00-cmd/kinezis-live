import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BookOpen, Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listAllCourses } from "@/lib/admin/queries";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const t = await getTranslations("admin");
  const tl = await getTranslations("library");
  const params = await searchParams;
  const courses = await listAllCourses();

  return (
    <div className="space-y-5">
      <SectionHeading
        as="h1"
        title={t("nav.courses")}
        action={
          <Link href="/admin/courses/new" className={buttonStyles("primary", "md")}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("newCourse")}
          </Link>
        }
      />
      {params.deleted ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm font-semibold">{t("deletedNotice")}</p> : null}
      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title={t("emptyCoursesTitle")} body={t("emptyCoursesBody")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {courses.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/courses/${c.id}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                <span className="min-w-0 flex-1">
                  <span className="text-ink block truncate font-semibold">{c.title.en}</span>
                  <span className="text-steel block text-xs">{tl(`levels.${c.level}`)}</span>
                </span>
                <StatusBadge published={c.published} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
