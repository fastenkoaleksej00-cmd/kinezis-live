import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick } from "@/lib/content/localize";
import { getArticle } from "@/lib/content/skincare";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const t = await getTranslations("skincare");
  const locale = await getLocale();
  const format = await getFormatter();

  return (
    <Container as="article" className="max-w-[720px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/skincare/articles" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("articles.title")}
        </Link>
      </Reveal>
      <Reveal delay={0.05}>
        <p className="eyebrow mb-2">{format.dateTime(new Date(article.publishedAt), { day: "numeric", month: "long", year: "numeric" })}</p>
        <h1 className="text-[1.9rem] leading-[1.05] font-extrabold sm:text-[2.4rem]">{pick(article.title, locale)}</h1>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="card text-text space-y-4 px-5 py-5 text-[15px] leading-relaxed sm:px-7 sm:py-6">
          {pick(article.body, locale)
            .split(/\n{2,}/)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}
        </div>
      </Reveal>
      <Reveal delay={0.14}>
        <p className="text-steel text-center text-xs">{t("disclaimer")}</p>
      </Reveal>
    </Container>
  );
}
