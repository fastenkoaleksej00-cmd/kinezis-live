import type { Author } from "@/lib/content/types";

interface AuthorRowProps {
  author: Author | undefined;
  roleLabel: string;
  meta?: string;
  tone?: "light" | "dark";
}

/** Avatar initial on petrol, name, role and a small meta line (date or label). */
export function AuthorRow({ author, roleLabel, meta, tone = "light" }: AuthorRowProps) {
  const name = author?.name ?? "—";
  const dark = tone === "dark";
  return (
    <div className="flex items-center gap-3">
      <span className="section-deep text-frost inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
        {name.slice(0, 1)}
      </span>
      <span className="min-w-0">
        <span className={dark ? "text-frost block text-sm font-bold" : "text-ink block text-sm font-bold"}>
          {name} <span className={dark ? "text-mist font-medium" : "text-steel font-medium"}>· {roleLabel}</span>
        </span>
        {meta ? <span className={dark ? "text-mist-2 block text-xs" : "text-steel block text-xs"}>{meta}</span> : null}
      </span>
    </div>
  );
}
