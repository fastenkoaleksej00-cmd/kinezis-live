import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { ChatThread } from "@/components/chat/ChatThread";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { getConversation, listMessages } from "@/lib/chat/queries";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminThreadPage({ params }: PageProps) {
  const { id } = await params;
  const [conversation, user] = await Promise.all([getConversation(id), getSessionUser()]);
  if (!conversation || !user) notFound();
  const t = await getTranslations("chat");
  const ta = await getTranslations("admin");
  const locale = await getLocale();
  const supabase = await createServerSupabase();
  const { data: member } = supabase ? await supabase.from("profiles").select("display_name, avatar_src").eq("id", conversation.userId).maybeSingle() : { data: null };
  const m = member as { display_name: string | null; avatar_src: string | null } | null;
  const messages = await listMessages(conversation.id);

  return (
    <div className="space-y-4">
      <Link href="/admin/messages" className={buttonStyles("ghost", "sm", "-ml-3")}>
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {ta("nav.messages")}
      </Link>
      <SectionHeading as="h1" title={m?.display_name ?? t("member")} />
      <ChatThread conversationId={conversation.id} initial={messages} meId={user.id} staff counterpartName={m?.display_name ?? t("member")} counterpartAvatar={m?.avatar_src} locale={locale} />
    </div>
  );
}
