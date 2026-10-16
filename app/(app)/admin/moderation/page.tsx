import { redirect } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";
import { ScrollText } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";

interface LogRow {
  id: number;
  actor_id: string | null;
  action: string;
  target_type: string;
  target_id: string;
  note: string | null;
  created_at: string;
}

/** Admin: last 100 moderation decisions with who made them and why (DSA statement of reasons). */
export default async function ModerationLogPage() {
  const user = await getSessionUser();
  if (user?.role !== "admin") redirect("/admin");
  const t = await getTranslations("admin.moderationLog");
  const format = await getFormatter();
  const db = await createServerSupabase();
  const { data, error } = db ? await db.from("moderation_log").select("id, actor_id, action, target_type, target_id, note, created_at").order("created_at", { ascending: false }).limit(100) : { data: null, error: null };
  const rows = (error ? [] : (data ?? [])) as LogRow[];
  const actorIds = [...new Set(rows.map((r) => r.actor_id).filter((x): x is string => Boolean(x)))];
  const { data: actors } = db && actorIds.length > 0 ? await db.from("profiles").select("id, display_name").in("id", actorIds) : { data: [] };
  const nameOf = new Map(((actors ?? []) as Array<{ id: string; display_name: string | null }>).map((a) => [a.id, a.display_name]));

  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      {rows.length === 0 ? (
        <EmptyState icon={ScrollText} title={t("empty")} body={t("emptyBody")} />
      ) : (
        <ul className="card divide-ink/8 divide-y overflow-hidden">
          {rows.map((r) => (
            <li key={r.id} className="px-5 py-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-accent-soft text-accent inline-flex h-6 items-center rounded-full px-2.5 text-xs font-semibold">{t(`actions.${r.action as "hide_post"}`)}</span>
                <span className="text-steel text-xs">
                  {r.target_type} · {r.target_id.slice(0, 8)}
                </span>
                <span className="text-steel ml-auto text-xs">{format.dateTime(new Date(r.created_at), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="text-steel mt-1 text-xs">{t("by", { name: (r.actor_id && nameOf.get(r.actor_id)) || "—" })}</p>
              {r.note ? <p className="text-text mt-1">{r.note}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
