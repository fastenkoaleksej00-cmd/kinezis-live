import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { ProfileEditForm } from "@/components/profile/ProfileEditForm";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { getMyProfile } from "@/lib/profile/queries";

export default async function ProfileEditPage() {
  const profile = await getMyProfile();
  if (!profile) redirect("/auth/sign-in");
  const t = await getTranslations("profileEdit");
  const tn = await getTranslations("nav");
  return (
    <Container as="section" className="max-w-[720px] space-y-5 py-4 sm:py-8">
      <Reveal>
        <Link href="/profile" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("profile")}
        </Link>
        <SectionHeading as="h1" title={t("title")} lead={t("lead")} />
      </Reveal>
      <Reveal delay={0.06}>
        <ProfileEditForm profile={profile} />
      </Reveal>
    </Container>
  );
}
