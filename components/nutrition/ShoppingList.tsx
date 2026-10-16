"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { Check, ClipboardCopy, Plus, ShoppingBasket, X } from "lucide-react";
import { createLocalStore } from "@/lib/store/localStore";
import { cn } from "@/lib/utils";

interface ListItem {
  text: string;
  done: boolean;
}

const listsStore = createLocalStore<Record<string, ListItem[]>>("kl_shopping", {});

/** Turns the meal descriptions into list lines: one per comma, "and", semicolon or line break. */
function split(texts: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const t of texts) {
    for (const raw of t.split(/[\n,;•·]+|\s(?:and|и|та|і|und)\s/i)) {
      const line = raw.replace(/^[\s\-–—:]+|[\s.]+$/g, "").trim();
      if (line.length < 2 || line.length > 80) continue;
      const key = line.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(line.charAt(0).toUpperCase() + line.slice(1));
    }
  }
  return out;
}

/** Shopping list built from the trainer's day; editable and kept on this device. */
export function ShoppingList({ planId, texts }: { planId: string; texts: string[] }) {
  const t = useTranslations("nutrition.list");
  const all = listsStore.useStore();
  const suggested = useMemo(() => split(texts), [texts]);
  const [mounted, setMounted] = useState(false);
  const [draft, setDraft] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => setMounted(true), []);
  const list = mounted ? all[planId] : undefined;

  const save = (next: ListItem[]) => listsStore.write({ ...all, [planId]: next });

  if (!list) {
    return (
      <section className="card flex flex-wrap items-center gap-4 p-5">
        <span className="bg-mint-soft text-mint-deep inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl">
          <ShoppingBasket className="h-5 w-5" strokeWidth={1.8} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-ink font-bold">{t("title")}</p>
          <p className="text-steel text-sm">{t("lead")}</p>
        </div>
        <button type="button" onClick={() => save(suggested.map((s) => ({ text: s, done: false })))} className="bg-linear-to-b from-ink-2 to-ink inline-flex h-10 items-center rounded-full px-4 text-sm font-semibold text-white">
          {t("make")}
        </button>
      </section>
    );
  }

  const left = list.filter((i) => !i.done).length;
  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-ink inline-flex items-center gap-2 font-bold">
          <ShoppingBasket className="text-mint-deep h-4 w-4" aria-hidden />
          {t("title")}
        </p>
        <span className="text-steel text-xs">{t("left", { count: left })}</span>
      </div>
      <ul className="space-y-1.5">
        {list.map((item, i) => (
          <li key={`${item.text}-${i}`} className="flex items-center gap-2">
            <button type="button" aria-pressed={item.done} onClick={() => save(list.map((x, j) => (j === i ? { ...x, done: !x.done } : x)))} className={cn("inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors", item.done ? "bg-mint-deep border-transparent text-white" : "border-ink/20 bg-white/70")}>
              {item.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /> : null}
            </button>
            <span className={cn("min-w-0 flex-1 text-sm", item.done ? "text-steel line-through" : "text-text")}>{item.text}</span>
            <button type="button" onClick={() => save(list.filter((_, j) => j !== i))} aria-label={t("remove")} className="text-steel hover:text-ink inline-flex h-7 w-7 items-center justify-center rounded-full">
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const v = draft.trim().slice(0, 80);
          if (v) save([...list, { text: v, done: false }]);
          setDraft("");
        }}
      >
        <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("add")} className="border-ink/10 text-ink h-10 min-w-0 flex-1 rounded-xl border bg-white/80 px-3 text-sm" />
        <button type="submit" aria-label={t("add")} className="border-ink/10 text-ink inline-flex h-10 w-10 items-center justify-center rounded-full border bg-white/70">
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </form>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            const text = list.filter((x) => !x.done).map((x) => `• ${x.text}`).join("\n");
            void navigator.clipboard?.writeText(text).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1800);
            });
          }}
          className="text-accent inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
        >
          <ClipboardCopy className="h-4 w-4" aria-hidden />
          {copied ? t("copied") : t("copy")}
        </button>
        <button
          type="button"
          onClick={() => {
            const next = { ...all };
            delete next[planId];
            listsStore.write(next);
          }}
          className="text-steel hover:text-ink text-xs font-semibold"
        >
          {t("reset")}
        </button>
      </div>
      <p className="text-steel text-xs">{t("note")}</p>
    </section>
  );
}
