// PROPOSED (not applied). Target path: app/(app)/error.tsx
"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonStyles } from "@/components/ui/buttonStyles";

/** Branded error state for any screen inside the app shell. Keeps the tab bar, offers a retry. */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("errors");
  useEffect(() => {
    // Hook for error monitoring later (see 02/03 reports); nothing is sent today
    void error.digest;
  }, [error]);
  return (
    <Container as="section" className="max-w-[640px] py-10">
      <EmptyState
        icon={RefreshCw}
        title={t("title")}
        body={t("body")}
        action={
          <div className="flex flex-wrap justify-center gap-2">
            <button type="button" onClick={reset} className={buttonStyles("primary", "md")}>
              {t("retry")}
            </button>
            <Link href="/" className={buttonStyles("secondary", "md")}>
              {t("home")}
            </Link>
          </div>
        }
      />
    </Container>
  );
}
