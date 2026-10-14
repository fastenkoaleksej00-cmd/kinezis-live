import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { TrainerBadge } from "@/components/trainer/TrainerBadge";
import type { Author } from "@/lib/content/types";

interface AuthorRowProps {
  author: Author | undefined;
  roleLabel: string;
  meta?: string;
  tone?: "light" | "dark";
}

/** Avatar, name with verified mark, role and a meta line. Links to the trainer profile. */
export async function AuthorRow({ author, roleLabel, meta, tone = "light" }: AuthorRowProps) {
  const t = await getTranslations("trainer");
  const name = author?.name ?? "—";
  const dark = tone === "dark";
  const inner = (
    <>
      <span className="section-deep text-frost inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold">
        {author?.avatarSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={author.avatarSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          name.slice(0, 1)
        )}
      </span>
      <span className="min-w-0">
        <span className={dark ? "text-frost flex items-center gap-1.5 text-sm font-bold" : "text-ink flex items-center gap-1.5 text-sm font-bold"}>
          <span className="truncate">{name}</span>
          {author?.verified ? <TrainerBadge label={t("verified")} /> : null}
          <span className={dark ? "text-mist font-medium" : "text-steel font-medium"}>· {roleLabel}</span>
        </span>
        {meta ? <span className={dark ? "text-mist-2 block text-xs" : "text-steel block text-xs"}>{meta}</span> : null}
      </span>
    </>
  );

  return author ? (
    <Link href={`/trainers/${author.id}`} className="group flex items-center gap-3">
      {inner}
    </Link>
  ) : (
    <div className="flex items-center gap-3">{inner}</div>
  );
}
