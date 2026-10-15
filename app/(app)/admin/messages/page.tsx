import Link from "next/link";
import { getFormatter, getTranslations } from "next-intl/server";
import { MessageCircle } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listInbox } from "@/lib/chat/queries";
import { cn } from "@/lib/utils";

/** Trainer inbox: one row per member, unread first. */
export default async function AdminMessagesPage() {
  const t = await getTranslations("chat");
  const ta = await getTranslations("admin");
  const format = await getFormatter();
  const inbox = await listInbox();
  const sorted = [...inbox].sort((a, b) => Number(b.unreadForStaff) - Number(a.unreadForStaff));

  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={ta("nav.messages")} lead={t("inboxLead")} />
      {sorted.length === 0 ? (
        <EmptyState icon={MessageCircle} title={t("inboxEmptyTitle")} body={t("inboxEmptyBody")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {sorted.map((c) => (
            <li key={c.id}>
              <Link href={`/admin/messages/${c.id}`} className="hover:bg-frost/60 flex items-center gap-4 px-5 py-4 transition-colors">
                <span className="section-deep text-frost inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold">
                  {c.userAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={c.userAvatar} alt="" className="h-full w-full object-cover" />
                  ) : (
                    (c.userName ?? "?").slice(0, 1).toUpperCase()
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("text-ink block truncate text-sm", c.unreadForStaff ? "font-extrabold" : "font-semibold")}>{c.userName ?? t("member")}</span>
                  <span className="text-steel block truncate text-xs">{c.lastMessage ?? t("noMessagesYet")}</span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1">
                  {c.lastMessageAt ? <span className="text-steel text-xs">{format.dateTime(new Date(c.lastMessageAt), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span> : null}
                  {c.unreadForStaff ? <span className="bg-accent h-2.5 w-2.5 rounded-full" aria-label={t("unread")} /> : null}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
