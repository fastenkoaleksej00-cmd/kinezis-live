import { getTranslations } from "next-intl/server";
import { BookOpenText, ListChecks, Sparkles } from "lucide-react";
import { SectionLink } from "@/components/skincare/SectionLink";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listArticles, listProducts, listRoutines } from "@/lib/content/skincare";

export default async function SkincarePage() {
  const t = await getTranslations("skincare");
  const sections = [
    { href: "/skincare/routines", icon: ListChecks, title: t("routines.title"), body: t("routines.body"), count: listRoutines().length },
    { href: "/skincare/articles", icon: BookOpenText, title: t("articles.title"), body: t("articles.body"), count: listArticles().length },
    { href: "/skincare/products", icon: Sparkles, title: t("products.title"), body: t("products.body"), count: listProducts().length },
  ];

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" eyebrow={t("eyebrow")} title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal delay={0.05}>
        <Cover tone="mint" ratio="aspect-[21/9]">
          <div className="flex h-full flex-col justify-end p-5 sm:p-7">
            <p className="text-ink max-w-lg text-sm font-medium sm:text-base">{t("intro")}</p>
          </div>
        </Cover>
      </Reveal>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <Reveal key={s.href} delay={0.1 + i * 0.05}>
            <SectionLink href={s.href} icon={s.icon} title={s.title} body={s.body} countLabel={t("count", { count: s.count })} />
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.25}>
        <p className="text-steel text-center text-xs">{t("note")}</p>
      </Reveal>
    </Container>
  );
}
