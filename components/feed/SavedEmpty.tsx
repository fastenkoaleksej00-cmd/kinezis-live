"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bookmark } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { useFavorites } from "@/lib/store/favorites";

/** Shown only when nothing at all is saved. */
export function SavedEmpty() {
  const t = useTranslations("saved");
  const { ids } = useFavorites();
  if (ids.length > 0) return null;
  return (
    <EmptyState
      icon={Bookmark}
      illustration="saved"
      title={t("title")}
      body={t("empty")}
      action={
        <Link href="/library" className={buttonStyles("primary", "md")}>
          {t("goToLibrary")}
        </Link>
      }
    />
  );
}
