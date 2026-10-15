import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ChatMessage, Conversation, InboxItem } from "./types";

interface ConvRow {
  id: string;
  user_id: string;
  author_id: string | null;
  created_at: string;
  last_message_at: string | null;
  last_read_by_user_at: string | null;
  last_read_by_staff_at: string | null;
}
interface MsgRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  from_staff: boolean;
  created_at: string;
}

const convColumns = "id, user_id, author_id, created_at, last_message_at, last_read_by_user_at, last_read_by_staff_at";
const msgColumns = "id, conversation_id, sender_id, body, from_staff, created_at";

const toConv = (r: ConvRow): Conversation => ({ id: r.id, userId: r.user_id, authorId: r.author_id, createdAt: r.created_at, lastMessageAt: r.last_message_at, lastReadByUserAt: r.last_read_by_user_at, lastReadByStaffAt: r.last_read_by_staff_at });
const toMsg = (r: MsgRow): ChatMessage => ({ id: r.id, conversationId: r.conversation_id, senderId: r.sender_id, body: r.body, fromStaff: r.from_staff, createdAt: r.created_at });

/** The member's single conversation with the trainer, created on first visit. */
export async function getOrCreateMyConversation(): Promise<Conversation | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("conversations").select(convColumns).eq("user_id", user.id).maybeSingle();
  if (data) return toConv(data as ConvRow);
  const { data: created } = await supabase.from("conversations").insert({ user_id: user.id, author_id: "yuliia" }).select(convColumns).single();
  return created ? toConv(created as ConvRow) : null;
}

export async function getConversation(id: string): Promise<Conversation | null> {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.from("conversations").select(convColumns).eq("id", id).maybeSingle();
  return data ? toConv(data as ConvRow) : null;
}

export async function listMessages(conversationId: string, limit = 200): Promise<ChatMessage[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("messages").select(msgColumns).eq("conversation_id", conversationId).order("created_at", { ascending: true }).limit(limit);
  return ((data ?? []) as MsgRow[]).map(toMsg);
}

/** Unread messages from the trainer, for the member's profile badge. */
export const countMyUnread = cache(async (): Promise<number> => {
  const supabase = await createServerSupabase();
  if (!supabase) return 0;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data: conv } = await supabase.from("conversations").select("id, last_read_by_user_at").eq("user_id", user.id).maybeSingle();
  if (!conv) return 0;
  const c = conv as { id: string; last_read_by_user_at: string | null };
  let q = supabase.from("messages").select("id", { count: "exact", head: true }).eq("conversation_id", c.id).eq("from_staff", true);
  if (c.last_read_by_user_at) q = q.gt("created_at", c.last_read_by_user_at);
  const { count } = await q;
  return count ?? 0;
});

/** Staff inbox: every conversation, newest activity first, with the member's name and last message. */
export async function listInbox(): Promise<InboxItem[]> {
  const supabase = await createServerSupabase();
  if (!supabase) return [];
  const { data } = await supabase.from("conversations").select(convColumns).order("last_message_at", { ascending: false, nullsFirst: false }).limit(200);
  const convs = ((data ?? []) as ConvRow[]).map(toConv);
  if (convs.length === 0) return [];
  const userIds = convs.map((c) => c.userId);
  const [{ data: profiles }, { data: lastMsgs }] = await Promise.all([
    supabase.from("profiles").select("id, display_name, avatar_src").in("id", userIds),
    supabase.from("messages").select(msgColumns).in("conversation_id", convs.map((c) => c.id)).order("created_at", { ascending: false }).limit(1000),
  ]);
  const byUser = new Map(((profiles ?? []) as Array<{ id: string; display_name: string | null; avatar_src: string | null }>).map((p) => [p.id, p]));
  const lastByConv = new Map<string, MsgRow>();
  for (const m of (lastMsgs ?? []) as MsgRow[]) if (!lastByConv.has(m.conversation_id)) lastByConv.set(m.conversation_id, m);
  return convs.map((c) => {
    const p = byUser.get(c.userId);
    const last = lastByConv.get(c.id);
    const unreadForStaff = Boolean(last && !last.from_staff && (!c.lastReadByStaffAt || last.created_at > c.lastReadByStaffAt));
    return { ...c, userName: p?.display_name ?? null, userAvatar: p?.avatar_src ?? null, lastMessage: last?.body ?? null, unreadForStaff };
  });
}

export async function countStaffUnread(): Promise<number> {
  return (await listInbox()).filter((i) => i.unreadForStaff).length;
}
