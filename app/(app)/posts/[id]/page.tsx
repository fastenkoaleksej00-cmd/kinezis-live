import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { PostCard } from "@/components/feed/PostCard";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { pick } from "@/lib/content/localize";
import { getPost } from "@/lib/content/posts";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post?.title) return {};
  const locale = await getLocale();
  return { title: pick(post.title, locale) };
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();
  const t = await getTranslations("feed");
  const tn = await getTranslations("nav");

  return (
    <Container as="section" className="max-w-[720px] space-y-5 py-4 sm:py-8">
      <Reveal>
        <Link href="/" className={buttonStyles("ghost", "sm", "-ml-3")}>
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {tn("home")}
        </Link>
      </Reveal>
      <Reveal delay={0.05}>
        <PostCard post={post} expanded />
      </Reveal>
      {post.reactionsEnabled || post.commentsEnabled ? (
        <Reveal delay={0.1}>
          <p className="text-steel text-center text-xs">{t("socialLater")}</p>
        </Reveal>
      ) : null}
    </Container>
  );
}
