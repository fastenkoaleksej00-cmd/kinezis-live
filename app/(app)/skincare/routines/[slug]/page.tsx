import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick } from "@/lib/content/localize";
import { getRoutine } from "@/lib/content/skincare";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function RoutinePage({ params }: PageProps) {
  const { slug } = await params;
  const routine = await getRoutine(slug);
  if (!routine) notFound();
  const t = await getTranslations("skincare");
  const locale = await getLocale();

  return (
    <Container as="article" className="max-w-[720px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/skincare/routines" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("routines.title")}
        </Link>
      </Reveal>
      <Reveal delay={0.05}>
        <Cover tone="mint" ratio="aspect-[21/9]" label={t(`times.${routine.time}`)}>
          <div className="flex h-full flex-col justify-end p-5 sm:p-7">
            <h1 className="text-ink text-2xl leading-tight font-extrabold sm:text-3xl">{pick(routine.title, locale)}</h1>
            <p className="text-steel mt-1.5 text-sm font-medium">{t("stepsCount", { count: routine.steps.length })}</p>
          </div>
        </Cover>
      </Reveal>
      <Reveal delay={0.1}>
        <ol className="card divide-ink/8 divide-y overflow-hidden">
          {routine.steps.map((step, i) => (
            <li key={i} className="flex items-start gap-4 px-5 py-4">
              <span className="bg-mint-soft text-mint-deep inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">{i + 1}</span>
              <p className="text-text pt-1 text-[15px] leading-relaxed">{pick(step, locale)}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    </Container>
  );
}
