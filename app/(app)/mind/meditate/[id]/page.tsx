import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { MindEvidence } from "@/components/mind/MindEvidence";
import { MindPage } from "@/components/mind/MindPage";
import { MeditationPlayer } from "@/components/mind/MindPlayers";
import type { Locale } from "@/i18n/config";
import { pick } from "@/lib/content/localize";
import { meditationById } from "@/lib/mind/content";
import { getSessionUser } from "@/lib/supabase/server";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function MeditatePage({ params }: PageProps) {
  const { id } = await params;
  const m = meditationById[id];
  if (!m) notFound();
  const locale = (await getLocale()) as Locale;
  const user = await getSessionUser();
  return (
    <MindPage
      title={pick(m.title, locale)}
      lead={pick(m.purpose, locale)}
      footer={
        <div className="space-y-4">
          <ul className="bg-frost/70 text-steel list-disc space-y-1 rounded-2xl py-3 pr-4 pl-8 text-sm">
            {m.cautions.map((c, i) => (
              <li key={i}>{pick(c, locale)}</li>
            ))}
          </ul>
          <MindEvidence id={m.evidence} />
        </div>
      }
    >
      <div className="card p-5 sm:p-6">
        <MeditationPlayer id={m.id} signedIn={Boolean(user)} />
      </div>
    </MindPage>
  );
}
