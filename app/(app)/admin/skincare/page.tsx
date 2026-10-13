import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listAllArticles, listAllProducts, listAllRoutines } from "@/lib/admin/queries";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminSkincarePage({ searchParams }: PageProps) {
  const t = await getTranslations("admin");
  const ts = await getTranslations("skincare");
  const params = await searchParams;
  const [routines, articles, products] = await Promise.all([listAllRoutines(), listAllArticles(), listAllProducts()]);

  const sections = [
    { key: "routines", title: ts("routines.title"), newLabel: t("newRoutine"), items: routines.map((r) => ({ id: r.id, title: r.title.en, meta: ts(`times.${r.time_of_day}`), published: r.published })) },
    { key: "articles", title: ts("articles.title"), newLabel: t("newArticle"), items: articles.map((a) => ({ id: a.id, title: a.title.en, meta: a.slug, published: a.published })) },
    { key: "products", title: ts("products.title"), newLabel: t("newProduct"), items: products.map((p) => ({ id: p.id, title: p.name, meta: `${p.brand} · ${ts(`categories.${p.category}`)}`, published: p.published })) },
  ];

  return (
    <div className="space-y-8">
      <SectionHeading as="h1" title={t("nav.skincare")} lead={t("skincareIntro")} />
      {params.saved ? <p className="bg-mint-soft text-mint-deep rounded-2xl px-4 py-3 text-sm font-semibold">{t("savedNotice")}</p> : null}
      {params.deleted ? <p className="bg-bone-2 text-steel rounded-2xl px-4 py-3 text-sm font-semibold">{t("deletedNotice")}</p> : null}

      {sections.map((s) => (
        <section key={s.key} className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-ink text-lg font-bold">{s.title}</h2>
            <Link href={`/admin/skincare/${s.key}/new`} className={buttonStyles("secondary", "sm")}>
              <Plus className="h-4 w-4" aria-hidden />
              {s.newLabel}
            </Link>
          </div>
          {s.items.length === 0 ? (
            <p className="card text-steel px-5 py-4 text-sm">{t("emptyList")}</p>
          ) : (
            <ul className="card divide-ink/8 divide-y overflow-hidden">
              {s.items.map((it) => (
                <li key={it.id}>
                  <Link href={`/admin/skincare/${s.key}/${it.id}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                    <span className="min-w-0 flex-1">
                      <span className="text-ink block truncate font-semibold">{it.title}</span>
                      <span className="text-steel block text-xs">{it.meta}</span>
                    </span>
                    <StatusBadge published={it.published} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
