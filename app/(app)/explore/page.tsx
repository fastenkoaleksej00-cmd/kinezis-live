import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** Real covers live in public/covers/explore (owner's photos, WebP ≤ 70 kB); directions without one keep the brand gradient. */
const directions = [
  { key: "workouts", href: "/library", tone: "deep", image: "/covers/explore/workouts.webp" },
  { key: "faceFitness", href: "/face-fitness", tone: "mint", image: "/covers/explore/face-fitness.webp" },
  { key: "skincare", href: "/skincare", tone: "mint", image: null },
  { key: "nutrition", href: "/nutrition", tone: "mint", image: "/covers/explore/nutrition.webp" },
  { key: "body", href: "/body", tone: "deep", image: null },
  { key: "breathe", href: "/breathe", tone: "mint", image: null },
  { key: "mind", href: "/mind", tone: "deep", image: null },
] as const;

/** Explore: the directions of the platform. */
export default async function ExplorePage() {
  const t = await getTranslations("explore");

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {directions.map(({ key, href, tone, image }, i) => {
          return (
            <Reveal key={key} delay={0.06 * (i + 1)}>
              <Link href={href} className="group block">
                <Cover tone={tone} ratio="aspect-[16/10] lg:aspect-[4/5]" imageSrc={image ?? undefined} className="[&>img]:transition-transform [&>img]:duration-700 [&>img]:ease-[var(--ease-out-expo)] group-hover:[&>img]:scale-[1.03]">
                  <div className="flex h-full flex-col justify-end p-5">
                    <div className="flex items-end justify-between gap-3">
                      <div>
                        <h2 className="text-frost text-xl font-bold">{t(`${key}.title`)}</h2>
                        <p className="text-mist mt-1 text-sm">{t(`${key}.body`)}</p>
                      </div>
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/35 bg-white/10 text-white backdrop-blur-md transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5">
                        <ArrowUpRight className="h-4 w-4" aria-hidden />
                      </span>
                    </div>
                  </div>
                </Cover>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </Container>
  );
}
