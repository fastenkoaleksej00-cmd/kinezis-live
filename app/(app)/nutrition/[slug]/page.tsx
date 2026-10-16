import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormatter, getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Coffee, Moon, Sandwich, Sun } from "lucide-react";
import { SaveButton } from "@/components/library/SaveButton";
import { Container } from "@/components/ui/Container";
import { Cover } from "@/components/ui/Cover";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick } from "@/lib/content/localize";
import { getMealPlan } from "@/lib/content/meals";
import type { MealSlot } from "@/lib/content/types";
import { getAuthor } from "@/lib/content/workouts";
import { mealKey } from "@/lib/store/keys";
import { ShoppingList } from "@/components/nutrition/ShoppingList";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const icons: Record<MealSlot, typeof Coffee> = { breakfast: Coffee, lunch: Sun, dinner: Moon, snacks: Sandwich };

export default async function MealPlanPage({ params }: PageProps) {
  const { slug } = await params;
  const plan = await getMealPlan(slug);
  if (!plan) notFound();
  const t = await getTranslations("nutrition");
  const tl = await getTranslations("library");
  const locale = await getLocale();
  const format = await getFormatter();
  const author = await getAuthor(plan.authorId);
  const date = plan.date ? format.dateTime(new Date(plan.date), { day: "numeric", month: "long", year: "numeric" }) : undefined;

  return (
    <Container as="article" className="max-w-[720px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/nutrition" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {t("title")}
        </Link>
      </Reveal>
      <Reveal delay={0.05}>
        <Cover tone="mint" ratio="aspect-[21/9]" label={date}>
          <div className="absolute top-3 right-3 z-20">
            <SaveButton itemKey={mealKey(plan.id)} look="glass" size="md" />
          </div>
          <div className="flex h-full flex-col justify-end p-5 sm:p-7">
            <h1 className="text-ink text-2xl leading-tight font-extrabold sm:text-3xl">{pick(plan.title, locale)}</h1>
            <p className="text-steel mt-1.5 text-sm font-medium">
              {author?.name} · {tl("trainer")}
            </p>
          </div>
        </Cover>
      </Reveal>
      <Reveal delay={0.08}>
        <p className="card text-steel px-5 py-4 text-sm">{t("disclaimer")}</p>
      </Reveal>
      <Reveal delay={0.12}>
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {plan.meals.map((m) => {
            const Icon = icons[m.slot];
            return (
              <li key={m.slot} className="flex items-start gap-4 px-5 py-4">
                <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="eyebrow mb-1">{t(`slots.${m.slot}`)}</p>
                  <p className="text-text text-[15px] leading-relaxed whitespace-pre-line">{pick(m.text, locale)}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Reveal>
      <Reveal delay={0.14}>
        <ShoppingList planId={plan.id} texts={plan.meals.map((m) => pick(m.text, locale))} />
      </Reveal>
      {plan.notes ? (
        <Reveal delay={0.16} as="section" className="card px-5 py-4">
          <h2 className="eyebrow mb-2">{t("notes")}</h2>
          <p className="text-text text-[15px] leading-relaxed whitespace-pre-line">{pick(plan.notes, locale)}</p>
        </Reveal>
      ) : null}
    </Container>
  );
}
