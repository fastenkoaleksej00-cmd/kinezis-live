import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Compass } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { buttonStyles } from "@/components/ui/buttonStyles";

export default async function NotFound() {
  const t = await getTranslations("errors");
  return (
    <Container as="section" className="max-w-[640px] py-10">
      <EmptyState
        icon={Compass}
        illustration="search"
        title={t("notFoundTitle")}
        body={t("notFoundBody")}
        action={
          <Link href="/" className={buttonStyles("primary", "md")}>
            {t("home")}
          </Link>
        }
      />
    </Container>
  );
}
