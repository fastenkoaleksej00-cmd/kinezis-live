"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";
import { BellRing, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { setPremiumInterest } from "@/lib/access/actions";

interface InterestButtonProps {
  signedIn: boolean;
  interested: boolean;
}

/** "Tell me when Premium launches". Honest: nothing is bought here. */
export function InterestButton({ signedIn, interested }: InterestButtonProps) {
  const t = useTranslations("premium");
  const [state, setState] = useState(interested);
  const [pending, start] = useTransition();

  if (!signedIn) {
    return (
      <Link href="/auth/sign-up" className={buttonStyles("primary", "lg")}>
        {t("ctaSignUp")}
      </Link>
    );
  }

  return (
    <Button
      size="lg"
      variant={state ? "secondary" : "primary"}
      disabled={pending}
      aria-pressed={state}
      onClick={() =>
        start(async () => {
          const next = !state;
          const res = await setPremiumInterest(next);
          if (res.ok) setState(next);
        })
      }
    >
      {state ? <Check className="h-4 w-4" strokeWidth={2.5} aria-hidden /> : <BellRing className="h-4 w-4" aria-hidden />}
      {state ? t("ctaInterested") : t("ctaNotify")}
    </Button>
  );
}
