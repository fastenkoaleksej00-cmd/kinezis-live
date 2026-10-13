import Link from "next/link";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, BookOpenText, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick } from "@/lib/content/localize";
import { listArticles } from "@/lib/content/skincare";

export default async function SkincareArticlesPage() {
  const t = await getTranslations("skincare");
  const locale = await getLocale();
  const format = await getFormatter();
  const items = await listArticles();

  return (
    <Container as="section" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/skincare" className={buttonStyles("ghost", "sm", "-ml-3 mb-2")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
        <SectionHeading as="h1" title={t("articles.title")} lead={t("articles.body")} />
      </Reveal>
      <Reveal delay={0.06}>
        {items.length === 0 ? (
          <EmptyState icon={BookOpenText} title={t("articles.emptyTitle")} body={t("articles.emptyBody")} />
        ) : (
          <ul className="card divide-ink/8 divide-y overflow-hidden">
            {items.map((a) => (
              <li key={a.id}>
                <Link href={`/skincare/articles/${a.slug}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                  <span className="min-w-0 flex-1">
                    <span className="text-ink block truncate font-semibold">{pick(a.title, locale)}</span>
                    <span className="text-steel block text-xs">{format.dateTime(new Date(a.publishedAt), { day: "numeric", month: "long" })}</span>
                  </span>
                  <ChevronRight className="text-steel h-4 w-4" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Reveal>
    </Container>
  );
}
