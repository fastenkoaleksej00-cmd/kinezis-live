import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, UserRound } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { listPostsByUser } from "@/lib/content/posts";
import { getPublicMemberProfile } from "@/lib/profile/public";
import { getSocialCounts } from "@/lib/social/queries";
import { getSessionUser } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Public member page. Respects "profile visible"; health data is never here. */
export default async function MemberPage({ params }: PageProps) {
  const { id } = await params;
  const profile = await getPublicMemberProfile(id);
  if (!profile) notFound();
  const t = await getTranslations("members");
  const tn = await getTranslations("nav");
  const tl = await getTranslations("library");
  const tpe = await getTranslations("profileEdit");
  const viewer = await getSessionUser();
  const own = viewer?.id === id;

  if (!profile.visible && !own) {
    return (
      <Container as="section" className="max-w-[720px] space-y-6 py-6 sm:py-8">
        <Link href="/" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("home")}
        </Link>
        <EmptyState icon={UserRound} title={t("privateTitle")} body={t("privateBody")} />
      </Container>
    );
  }

  const posts = await listPostsByUser(id);
  const social = await getSocialCounts("post", posts.map((p) => p.id));
  const bannerClass = profile.bannerPreset === "mint" ? "cover cover-mint" : profile.bannerPreset === "light" ? "cover cover-light" : "cover";
  const interestLabel = (i: string) =>
    i in { kinesiotherapy: 1, yoga: 1, pilates: 1, stretching: 1, mobility: 1, back: 1 } ? tl(`categories.${i as "yoga"}`) : tpe(`interests.${i as "face"}`);

  return (
    <Container as="section" className="max-w-[720px] space-y-6 py-4 sm:py-8">
      <Reveal>
        <Link href="/" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("home")}
        </Link>
      </Reveal>
      <Reveal delay={0.05}>
        <div className="card overflow-hidden">
          <div className={cn("relative h-32 sm:h-40", !profile.bannerSrc && bannerClass)}>
            {profile.bannerSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.bannerSrc} alt="" className="h-full w-full object-cover" style={{ objectPosition: `50% ${profile.bannerPosition}%` }} />
            ) : null}
          </div>
          <div className="relative z-10 px-5 pb-5">
            <div className="-mt-9 flex items-end gap-4">
              <span className="section-deep text-frost inline-flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white text-2xl font-bold">
                {profile.avatarSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarSrc} alt="" className="h-full w-full object-cover object-[50%_30%]" />
                ) : (
                  (profile.displayName ?? "?").slice(0, 1).toUpperCase()
                )}
              </span>
            </div>
            <p className="text-ink mt-3 text-xl font-extrabold">{profile.displayName ?? t("member")}</p>
            {profile.bio ? <p className="text-text mt-2 text-[15px] leading-relaxed">{profile.bio}</p> : null}
            {profile.interests.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {profile.interests.map((i) => (
                  <li key={i} className="bg-frost text-steel rounded-full px-3 py-1 text-xs font-semibold">
                    {interestLabel(i)}
                  </li>
                ))}
              </ul>
            ) : null}
            {own ? (
              <Link href="/profile/edit" className={buttonStyles("secondary", "sm", "mt-4")}>
                {t("editMine")}
              </Link>
            ) : null}
          </div>
        </div>
      </Reveal>
      <section className="space-y-4">
        <Reveal delay={0.1}>
          <h2 className="text-ink text-lg font-bold">{t("posts", { count: posts.length })}</h2>
        </Reveal>
        {posts.length === 0 ? <p className="card text-steel px-5 py-4 text-sm">{t("noPosts")}</p> : null}
        {posts.map((p, i) => (
          <Reveal key={p.id} delay={0.12 + Math.min(i, 4) * 0.04}>
            <PostCard post={p} social={social[p.id]} signedIn={Boolean(viewer)} member={{ displayName: profile.displayName, avatarSrc: profile.avatarSrc }} viewerId={viewer?.id ?? null} />
          </Reveal>
        ))}
      </section>
    </Container>
  );
}
