import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronRight, History, MessageCircle, Settings, Sparkles, UserRound } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export default async function ProfilePage() {
  const t = await getTranslations("profile");
  const tc = await getTranslations("common");

  const rows = [
    { icon: History, title: t("history"), body: t("historyEmpty") },
    { icon: Sparkles, title: t("subscription"), body: t("subscriptionFree") },
    { icon: MessageCircle, title: t("support"), body: t("supportHint") },
  ];

  return (
    <Container as="section" className="space-y-6 py-6 sm:py-8">
      <Reveal>
        <SectionHeading as="h1" title={t("title")} />
      </Reveal>

      <Reveal delay={0.06}>
        <div className="section-deep relative overflow-hidden rounded-3xl p-5 text-white sm:p-6">
          <div className="grid-bg-dark pointer-events-none absolute inset-0" aria-hidden />
          <div className="relative flex items-center gap-4">
            <span className="glass-dark inline-flex h-14 w-14 items-center justify-center rounded-full">
              <UserRound className="h-6 w-6" strokeWidth={1.6} aria-hidden />
            </span>
            <div>
              <p className="text-frost text-lg font-bold">{t("guest")}</p>
              <p className="text-mist text-sm">{t("guestHint")}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {rows.map(({ icon: Icon, title, body }) => (
            <li key={title} className="flex items-center gap-4 px-5 py-4">
              <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-ink font-semibold">{title}</p>
                <p className="text-steel text-sm">{body}</p>
              </div>
            </li>
          ))}
          <li>
            <Link href="/profile/settings" className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
              <span className="bg-accent-soft text-accent inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                <Settings className="h-[18px] w-[18px]" strokeWidth={1.8} aria-hidden />
              </span>
              <p className="text-ink flex-1 font-semibold">{tc("settings")}</p>
              <ChevronRight className="text-steel h-4 w-4" aria-hidden />
            </Link>
          </li>
        </ul>
      </Reveal>
    </Container>
  );
}
