"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { SaveButton } from "@/components/library/SaveButton";
import { useFavorites } from "@/lib/store/favorites";
import { postKey } from "@/lib/store/keys";

export interface SavedPostData {
  id: string;
  title: string;
  kind: string;
  date: string;
}

interface SavedPostsProps {
  posts: SavedPostData[];
}

/** Bookmarked posts, resolved in the browser from local favourites. Renders nothing when empty. */
export function SavedPosts({ posts }: SavedPostsProps) {
  const t = useTranslations("saved");
  const { ids } = useFavorites();
  const saved = ids.map((key) => posts.find((p) => postKey(p.id) === key)).filter((p): p is SavedPostData => Boolean(p));
  if (saved.length === 0) return null;

  return (
    <section className="space-y-3">
      <p className="eyebrow">{t("sectionPosts")}</p>
      <ul className="card divide-ink/8 divide-y overflow-hidden">
        {saved.map((p) => (
          <li key={p.id} className="flex items-center gap-3 px-4 py-3.5">
            <Link href={`/posts/${p.id}`} className="group min-w-0 flex-1">
              <span className="text-ink group-hover:text-accent block truncate font-semibold transition-colors">{p.title}</span>
              <span className="text-steel block text-xs">
                {p.date} · {p.kind}
              </span>
            </Link>
            <SaveButton itemKey={postKey(p.id)} look="solid" />
            <Link href={`/posts/${p.id}`} aria-label={p.title} className="text-steel hover:text-ink inline-flex h-9 w-9 items-center justify-center rounded-full">
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
