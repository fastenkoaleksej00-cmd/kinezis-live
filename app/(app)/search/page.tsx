import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, Search, ShoppingBag, Sparkles, Wind } from "lucide-react";
import { CourseCard } from "@/components/courses/CourseCard";
import { WorkoutCard } from "@/components/library/WorkoutCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Locale } from "@/i18n/config";
import { listPractices } from "@/lib/breath/practices";
import { listCommunityPosts } from "@/lib/community/queries";
import { listCourses } from "@/lib/content/courses";
import { pick, toCardData } from "@/lib/content/localize";
import type { LocalizedText } from "@/lib/content/types";
import { listAuthors, listWorkouts } from "@/lib/content/workouts";
import { meditations } from "@/lib/mind/content";
import { listShopItems } from "@/lib/shop/queries";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Matches when every word of the query appears in any language version of the text */
function matches(text: LocalizedText | string | undefined, words: string[]): boolean {
  if (!text) return false;
  const hay = (typeof text === "string" ? text : Object.values(text).join(" ")).toLowerCase();
  return words.every((w) => hay.includes(w));
}

/** One search across sessions, programmes, breathing and mind practices, community posts and the shop. */
export default async function SearchPage({ searchParams }: PageProps) {
  const t = await getTranslations("search");
  const locale = (await getLocale()) as Locale;
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 80);
  const words = q.toLowerCase().split(/\s+/).filter((w) => w.length >= 2);
  const active = words.length > 0;

  const [workouts, courses, authors, shop, posts] = active
    ? await Promise.all([listWorkouts(), listCourses(), listAuthors(), listShopItems(), listCommunityPosts({ q, sort: "new" })])
    : [[], [], [], [], []];
  const nameOf = (id: string) => authors.find((a) => a.id === id)?.name;
  const foundWorkouts = workouts.filter((w) => matches(w.title, words) || matches(w.description, words) || matches(nameOf(w.authorId), words)).slice(0, 12);
  const foundCourses = courses.filter((c) => matches(c.title, words) || matches(c.description, words)).slice(0, 6);
  const foundPractices = [
    ...listPractices().filter((p) => matches(p.title, words) || matches(p.purpose, words)).map((p) => ({ href: `/breathe/${p.id}`, title: pick(p.title, locale), body: pick(p.purpose, locale), icon: Wind })),
    ...meditations.filter((m) => matches(m.title, words) || matches(m.purpose, words)).map((m) => ({ href: `/mind/meditate/${m.id}`, title: pick(m.title, locale), body: pick(m.purpose, locale), icon: Sparkles })),
  ].slice(0, 6);
  const foundShop = shop.filter((i) => matches(i.title, words) || matches(i.description, words)).slice(0, 6);
  const foundPosts = posts.slice(0, 5);
  const total = foundWorkouts.length + foundCourses.length + foundPractices.length + foundShop.length + foundPosts.length;

  return (
    <Container as="section" className="space-y-6 py-4 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal delay={0.03}>
        <form action="/search" className="card flex items-center gap-2 px-3 py-2" role="search">
          <Search className="text-steel h-4 w-4 shrink-0" aria-hidden />
          <input name="q" defaultValue={q} maxLength={80} autoFocus={!active} placeholder={t("placeholder")} aria-label={t("placeholder")} className="text-ink min-w-0 flex-1 bg-transparent py-2 text-[15px] outline-none" />
          <button type="submit" className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-white">
            {t("go")}
          </button>
        </form>
      </Reveal>

      {!active ? (
        <Reveal delay={0.05}>
          <div className="flex flex-wrap gap-2">
            {(t.raw("suggestions") as string[]).map((s) => (
              <Link key={s} href={`/search?q=${encodeURIComponent(s)}`} className="border-ink/10 text-ink inline-flex h-9 items-center rounded-full border bg-white/70 px-4 text-sm font-semibold hover:bg-white">
                {s}
              </Link>
            ))}
          </div>
        </Reveal>
      ) : total === 0 ? (
        <EmptyState icon={Search} illustration="search" title={t("emptyTitle", { q })} body={t("emptyBody")} />
      ) : (
        <div className="space-y-8">
          {foundWorkouts.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-ink text-lg font-bold">{t("sessions")}</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {foundWorkouts.map((w) => (
                  <WorkoutCard key={w.id} workout={toCardData(w, locale, nameOf(w.authorId))} />
                ))}
              </div>
            </section>
          ) : null}
          {foundCourses.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-ink text-lg font-bold">{t("programs")}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {foundCourses.map((c) => (
                  <CourseCard key={c.id} course={c} />
                ))}
              </div>
            </section>
          ) : null}
          {foundPractices.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-ink text-lg font-bold">{t("practices")}</h2>
              <ul className="card divide-ink/8 divide-y overflow-hidden">
                {foundPractices.map(({ href, title, body, icon: Icon }) => (
                  <li key={href}>
                    <Link href={href} className="hover:bg-frost/60 flex items-center gap-3 px-4 py-3 transition-colors">
                      <span className="bg-mint-soft text-mint-deep inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl">
                        <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="text-ink block text-sm font-bold">{title}</span>
                        <span className="text-steel block truncate text-xs">{body}</span>
                      </span>
                      <ArrowUpRight className="text-steel h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {foundPosts.length > 0 ? (
            <section className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-ink text-lg font-bold">{t("community")}</h2>
                <Link href={`/community?q=${encodeURIComponent(q)}`} className="text-accent text-sm font-semibold hover:underline">
                  {t("all")}
                </Link>
              </div>
              <ul className="card divide-ink/8 divide-y overflow-hidden">
                {foundPosts.map((p) => (
                  <li key={p.id}>
                    <Link href={`/posts/${p.id}`} className="hover:bg-frost/60 block px-4 py-3 text-sm transition-colors">
                      <span className="text-text line-clamp-2">{pick(p.body, locale)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {foundShop.length > 0 ? (
            <section className="space-y-3">
              <h2 className="text-ink text-lg font-bold">{t("shop")}</h2>
              <ul className="card divide-ink/8 divide-y overflow-hidden">
                {foundShop.map((i) => (
                  <li key={i.id}>
                    <Link href={`/shop/${i.category}`} className="hover:bg-frost/60 flex items-center gap-3 px-4 py-3 text-sm transition-colors">
                      <ShoppingBag className="text-mint-deep h-4 w-4 shrink-0" aria-hidden />
                      <span className="text-ink min-w-0 flex-1 truncate font-semibold">{pick(i.title, locale)}</span>
                      <ArrowUpRight className="text-steel h-4 w-4" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </Container>
  );
}
