import { getTranslations } from "next-intl/server";
import { PostForm } from "@/components/admin/PostForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { listAllWorkouts, listAuthorRows } from "@/lib/admin/queries";

export default async function NewPostPage() {
  const t = await getTranslations("admin");
  const [authors, workouts] = await Promise.all([listAuthorRows(), listAllWorkouts()]);
  return (
    <div className="space-y-5">
      <SectionHeading as="h1" title={t("newPost")} />
      <PostForm authors={authors} workouts={workouts.map((w) => ({ id: w.id, title: w.title, published: w.published }))} />
    </div>
  );
}
