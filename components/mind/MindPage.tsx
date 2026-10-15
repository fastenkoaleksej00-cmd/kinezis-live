import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";

/** Shared frame for the Mind & rest sub-pages: back link, heading, content, footer note. */
export async function MindPage({ title, lead, eyebrow, children, footer }: { title: string; lead?: string; eyebrow?: string; children: React.ReactNode; footer?: React.ReactNode }) {
  const t = await getTranslations("mind");
  return (
    <Container as="section" className="max-w-[760px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/mind" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
        <SectionHeading as="h1" eyebrow={eyebrow ?? t("eyebrow")} title={title} lead={lead} />
      </Reveal>
      <Reveal delay={0.05}>{children}</Reveal>
      {footer ? <Reveal delay={0.1}>{footer}</Reveal> : null}
    </Container>
  );
}
