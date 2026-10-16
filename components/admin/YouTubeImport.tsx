"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Field, Input, Select } from "@/components/admin/fields";
import { Button } from "@/components/ui/Button";
import { importYouTube, type AdminState } from "@/lib/admin/actions";
import { categoryIds, levels } from "@/lib/content/types";

const initial: AdminState = {};

/** Paste a YouTube link (or pick one from the channel's new uploads), set length and category, get a draft. */
export function YouTubeImport({ suggestions }: { suggestions: Array<{ id: string; title: string }> }) {
  const t = useTranslations("admin.youtube");
  const tl = useTranslations("library");
  const ta = useTranslations("admin");
  const [state, action, pending] = useActionState(importYouTube, initial);
  const [url, setUrl] = useState("");

  return (
    <section className="card space-y-4 p-5">
      <div>
        <h2 className="text-ink text-base font-bold">{t("title")}</h2>
        <p className="text-steel mt-1 text-sm">{t("lead")}</p>
      </div>
      {suggestions.length > 0 ? (
        <div className="space-y-2">
          <p className="eyebrow">{t("newOnChannel", { count: suggestions.length })}</p>
          <div className="scroll-row -mx-5 flex gap-2 overflow-x-auto px-5">
            {suggestions.map((s) => (
              <button key={s.id} type="button" onClick={() => setUrl(`https://www.youtube.com/watch?v=${s.id}`)} className="border-ink/10 hover:bg-white w-44 shrink-0 overflow-hidden rounded-2xl border bg-white/70 text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`https://i.ytimg.com/vi/${s.id}/mqdefault.jpg`} alt="" loading="lazy" className="aspect-video w-full object-cover" />
                <span className="text-ink line-clamp-2 block p-2 text-xs font-semibold">{s.title}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <form action={action} className="grid gap-4 sm:grid-cols-2" aria-busy={pending}>
        <Field label={t("link")} className="sm:col-span-2">
          <Input name="youtube_url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=…" required />
        </Field>
        <Field label={ta("fields.duration")} hint={t("durationHint")}>
          <Input name="duration_min" type="number" min={1} max={240} required />
        </Field>
        <Field label={ta("fields.category")}>
          <Select name="category" defaultValue="yoga">
            {categoryIds.map((c) => (
              <option key={c} value={c}>
                {tl(`categories.${c}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={ta("fields.level")}>
          <Select name="level" defaultValue="beginner">
            {levels.map((l) => (
              <option key={l} value={l}>
                {tl(`levels.${l}`)}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={ta("fields.language")}>
          <Select name="language" defaultValue="ru">
            {(["ru", "uk", "en", "de"] as const).map((l) => (
              <option key={l} value={l}>
                {tl(`videoLanguages.${l}`)}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <Button type="submit" size="md" disabled={pending}>
            <Plus className="h-4 w-4" aria-hidden />
            {t("add")}
          </Button>
          {state.error ? <p className="text-sm text-[#8a2f2f]">{t(state.error === "invalid" ? "invalid" : "failed")}</p> : null}
        </div>
        <p className="text-steel text-xs sm:col-span-2">{t("note")}</p>
      </form>
    </section>
  );
}
