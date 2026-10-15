"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { markRead } from "@/lib/chat/actions";
import type { ChatMessage } from "@/lib/chat/types";
import { getBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface ChatThreadProps {
  conversationId: string;
  initial: ChatMessage[];
  meId: string;
  /** Whether the viewer is staff (messages go out as from_staff) */
  staff: boolean;
  counterpartName: string;
  counterpartAvatar?: string | null;
  locale: string;
}

/**
 * Live thread: initial messages from the server, new ones via Supabase Realtime.
 * Sending inserts directly through the browser client (RLS decides who may write where).
 */
export function ChatThread({ conversationId, initial, meId, staff, counterpartName, counterpartAvatar, locale }: ChatThreadProps) {
  const t = useTranslations("chat");
  const [messages, setMessages] = useState<ChatMessage[]>(initial);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  useEffect(() => {
    void markRead(conversationId);
    const supabase = getBrowserClient();
    if (!supabase) return;
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload) => {
        const r = payload.new as { id: string; conversation_id: string; sender_id: string; body: string; from_staff: boolean; created_at: string };
        setMessages((prev) => (prev.some((m) => m.id === r.id) ? prev : [...prev, { id: r.id, conversationId: r.conversation_id, senderId: r.sender_id, body: r.body, fromStaff: r.from_staff, createdAt: r.created_at }]));
        if (r.sender_id !== meId) void markRead(conversationId);
      })
      .subscribe((status) => setLive(status === "SUBSCRIBED"));
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, meId]);

  async function send() {
    const body = text.trim();
    if (!body || sending) return;
    const supabase = getBrowserClient();
    if (!supabase) {
      setError(t("errors.notConfigured"));
      return;
    }
    setSending(true);
    setError(null);
    const { data, error: err } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: meId, body, from_staff: staff }).select("id, conversation_id, sender_id, body, from_staff, created_at").single();
    setSending(false);
    if (err || !data) {
      setError(t("errors.sendFailed"));
      return;
    }
    const r = data as { id: string; conversation_id: string; sender_id: string; body: string; from_staff: boolean; created_at: string };
    setMessages((prev) => (prev.some((m) => m.id === r.id) ? prev : [...prev, { id: r.id, conversationId: r.conversation_id, senderId: r.sender_id, body: r.body, fromStaff: r.from_staff, createdAt: r.created_at }]));
    setText("");
  }

  const fmt = (iso: string) => new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  const dayOf = (iso: string) => new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(new Date(iso));

  return (
    <div className="card flex min-h-[60dvh] flex-col overflow-hidden">
      <div className="border-ink/8 flex items-center gap-3 border-b px-4 py-3">
        <span className="section-deep text-frost inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold">
          {counterpartAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={counterpartAvatar} alt="" className="h-full w-full object-cover" />
          ) : (
            counterpartName.slice(0, 1).toUpperCase()
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ink truncate text-sm font-bold">{counterpartName}</p>
          <p className="text-steel text-xs">{live ? t("live") : t("connecting")}</p>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? <p className="text-steel py-10 text-center text-sm">{staff ? t("emptyStaff") : t("emptyMember")}</p> : null}
        {messages.map((m, i) => {
          const mine = m.senderId === meId;
          const showDay = i === 0 || dayOf(messages[i - 1].createdAt) !== dayOf(m.createdAt);
          return (
            <div key={m.id}>
              {showDay ? <p className="text-steel my-3 text-center text-[11px] font-semibold tracking-[0.12em] uppercase">{dayOf(m.createdAt)}</p> : null}
              <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[82%] rounded-3xl px-4 py-2.5 text-[15px] leading-relaxed whitespace-pre-line", mine ? "rounded-br-md bg-linear-to-b from-ink-2 to-ink text-white" : "bg-frost text-text rounded-bl-md")}>
                  {m.body}
                  <span className={cn("mt-1 block text-[10px] tabular-nums", mine ? "text-mist" : "text-steel")}>{fmt(m.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="border-ink/8 flex items-end gap-2 border-t p-3"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={1}
          maxLength={2000}
          placeholder={t("placeholder")}
          aria-label={t("placeholder")}
          className="text-ink placeholder:text-steel/60 border-ink/10 max-h-40 min-h-11 flex-1 resize-none rounded-2xl border bg-white/80 px-4 py-2.5 text-[15px] outline-none"
        />
        <button type="submit" disabled={sending || !text.trim()} aria-label={t("send")} className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-b from-ink-2 to-ink text-white disabled:opacity-40">
          <Send className="h-4 w-4" aria-hidden />
        </button>
      </form>
      {error ? <p className="px-4 pb-3 text-sm text-[#8a2f2f]">{error}</p> : null}
    </div>
  );
}
