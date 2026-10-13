import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PostForm } from "@/components/admin/PostForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getPostRow, listAllWorkouts, listAuthorRows } from "@/lib/admin/queries";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params;
  const [post, authors, workouts] = await Promise.all([getPostRow(id), listAuthorRows(), listAllWorkouts()]);
  if (!post) notFound();
  const t = await getTranslations("admin");
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("editPost")} lead={post.title?.en ?? post.body.en.slice(0, 80)} />
      <PostForm post={post} authors={authors} workouts={workouts.map((w) => ({ id: w.id, title: w.title, published: w.published }))} />
    </div>
  );
}
