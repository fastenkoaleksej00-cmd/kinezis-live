import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Lock, MessageCircle } from "lucide-react";
import { ChatThread } from "@/components/chat/ChatThread";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { canAccess } from "@/lib/access/plans";
import { regionIds, type RegionId } from "@/lib/body/regions";
import { chatOpenForAll } from "@/lib/chat/config";
import { getOrCreateMyConversation, listMessages } from "@/lib/chat/queries";
import { getAuthor } from "@/lib/content/workouts";
import { getSessionUser, isStaff } from "@/lib/supabase/server";

interface MessagesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Member side of the trainer chat. */
export default async function MessagesPage({ searchParams }: MessagesPageProps) {
  const sp = await searchParams;
  const tb = await getTranslations("body");
  const topic = typeof sp.topic === "string" && (regionIds as readonly string[]).includes(sp.topic) ? (sp.topic as RegionId) : null;
  const prefill = topic ? tb("chatPrefill", { region: tb(`regions.${topic}`) }) : undefined;
  const t = await getTranslations("chat");
  const tn = await getTranslations("nav");
  const locale = await getLocale();
  const user = await getSessionUser();

  if (!user) {
    return (
      <Container as="section" className="max-w-[720px] space-y-6 py-6 sm:py-8">
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
        <EmptyState icon={MessageCircle} title={t("signedOutTitle")} body={t("signedOutBody")} action={<Link href="/auth/sign-in" className={buttonStyles("primary", "md")}>{t("signIn")}</Link>} />
      </Container>
    );
  }

  const allowed = chatOpenForAll() || isStaff(user) || canAccess({ access: "premium", plan: user.plan, planUntil: user.planUntil });
  if (!allowed) {
    return (
      <Container as="section" className="max-w-[720px] space-y-6 py-6 sm:py-8">
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
        <EmptyState icon={Lock} title={t("premiumTitle")} body={t("premiumBody")} action={<Link href="/premium" className={buttonStyles("primary", "md")}>{t("premiumCta")}</Link>} />
      </Container>
    );
  }

  const conversation = await getOrCreateMyConversation();
  if (!conversation) {
    return (
      <Container as="section" className="max-w-[720px] space-y-6 py-6 sm:py-8">
        <SectionHeading as="h1" title={t("title")} />
        <EmptyState icon={MessageCircle} title={t("errors.notConfigured")} />
      </Container>
    );
  }
  const [messages, trainer] = await Promise.all([listMessages(conversation.id), getAuthor(conversation.authorId ?? "yuliia")]);

  return (
    <Container as="section" className="max-w-[720px] space-y-4 py-4 sm:py-8">
      <Reveal>
        <Link href="/profile" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("profile")}
        </Link>
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal delay={0.05}>
        <ChatThread conversationId={conversation.id} initial={messages} meId={user.id} staff={false} counterpartName={trainer?.name ?? "KINEZIS"} counterpartAvatar={trainer?.avatarSrc} locale={locale} prefill={prefill} />
      </Reveal>
      <Reveal delay={0.08}>
        <p className="text-steel text-xs">{chatOpenForAll() ? t("prelaunchNote") : t("replyNote")}</p>
        <p className="text-steel mt-1 text-xs">{t("disclaimer")}</p>
      </Reveal>
    </Container>
  );
}
