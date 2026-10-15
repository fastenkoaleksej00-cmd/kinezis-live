import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { getContactEmail } from "@/content/legal";
import type { LegalDocument as Doc } from "@/content/legal/types";

interface LegalDocumentProps {
  doc: Doc;
  /** The sibling document link */
  other: { href: string; label: string };
}

export async function LegalDocument({ doc, other }: LegalDocumentProps) {
  const t = await getTranslations("legal");
  const tn = await getTranslations("nav");
  const contact = getContactEmail();

  return (
    <Container as="article" className="max-w-[760px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/profile/settings" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("profile")}
        </Link>
        <p className="eyebrow mb-2">{t("updated", { date: doc.updated })}</p>
        <h1 className="text-[1.9rem] leading-[1.05] font-extrabold sm:text-[2.4rem]">{doc.title}</h1>
        <p className="text-text mt-4 text-[15px] leading-relaxed">{doc.intro}</p>
      </Reveal>

      <div className="space-y-4">
        {doc.sections.map((s, i) => (
          <Reveal key={s.title} delay={Math.min(i, 6) * 0.03} as="section" className="card px-5 py-5 sm:px-7">
            <h2 className="text-ink text-lg font-bold">{s.title}</h2>
            {s.paragraphs.map((p, j) => (
              <p key={j} className="text-text mt-2 text-[15px] leading-relaxed">
                {p}
              </p>
            ))}
            {s.bullets && s.bullets.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {s.bullets.map((b, j) => (
                  <li key={j} className="text-text flex gap-3 text-[15px] leading-relaxed">
                    <span className="bg-accent mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full" aria-hidden />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2} as="section" className="card px-5 py-5 sm:px-7">
        <h2 className="text-ink text-lg font-bold">{t("contactTitle")}</h2>
        {contact ? (
          <p className="text-text mt-2 text-[15px]">
            <a href={`mailto:${contact}`} className="text-accent font-semibold hover:underline">
              {contact}
            </a>
          </p>
        ) : (
          <p className="text-steel mt-2 text-sm">{t("contactPending")}</p>
        )}
        <p className="text-steel mt-4 text-xs">
          <Link href={other.href} className="text-accent font-semibold hover:underline">
            {other.label}
          </Link>
        </p>
      </Reveal>
    </Container>
  );
}
