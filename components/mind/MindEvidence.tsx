import { getLocale, getTranslations } from "next-intl/server";
import { ExternalLink } from "lucide-react";
import { EvidenceBadge } from "@/components/breath/EvidenceBadge";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { mindEvidence } from "@/lib/mind/content";

/** Evidence level + short honest note + sources, same pattern as the breathing pages. */
export async function MindEvidence({ id }: { id: string }) {
  const ev = mindEvidence[id];
  if (!ev) return null;
  const t = await getTranslations("breath.evidence");
  const locale = (await getLocale()) as Locale;
  return (
    <section className="card space-y-2 p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-ink text-base font-bold">{t("title")}</h2>
        <EvidenceBadge level={ev.level} />
      </div>
      <p className="text-text text-sm">{pick(ev.note, locale)}</p>
      {ev.sources.length > 0 ? (
        <ul className="space-y-1">
          {ev.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-accent inline-flex items-start gap-1 text-xs hover:underline">
                <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                <span>{s.citation}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
