import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus, Trash2 } from "lucide-react";
import { deleteModule, saveModule } from "@/lib/admin/actions";
import type { LessonRow, ModuleRow } from "@/lib/content/db";
import { buttonStyles } from "@/components/ui/buttonStyles";
import { Input } from "./fields";

interface ModuleEditorProps {
  courseId: string;
  modules: ModuleRow[];
  lessons: LessonRow[];
}

/** Modules with inline rename, delete, and their lessons. Plain server-action forms. */
export async function ModuleEditor({ courseId, modules, lessons }: ModuleEditorProps) {
  const t = await getTranslations("admin");
  const tc = await getTranslations("common");

  return (
    <section className="space-y-4">
      <h2 className="text-ink text-lg font-bold">{t("courseStructure")}</h2>
      {modules.length === 0 ? <p className="text-steel text-sm">{t("noModules")}</p> : null}

      {modules.map((m, mi) => {
        const own = lessons.filter((l) => l.module_id === m.id);
        return (
          <div key={m.id} className="card space-y-3 p-4 sm:p-5">
            <form action={saveModule} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="course_id" value={courseId} />
              <input type="hidden" name="id" value={m.id} />
              <label className="min-w-[200px] flex-1">
                <span className="eyebrow mb-1.5 block">{t("fields.module")} {mi + 1}</span>
                <Input name="title_en" defaultValue={m.title.en} required aria-label={t("moduleTitle")} />
              </label>
              <label className="w-full sm:w-auto">
                <span className="eyebrow mb-1.5 block">uk</span>
                <Input name="title_uk" defaultValue={m.title.uk ?? ""} />
              </label>
              <label className="w-full sm:w-auto">
                <span className="eyebrow mb-1.5 block">de</span>
                <Input name="title_de" defaultValue={m.title.de ?? ""} />
              </label>
              <label className="w-24">
                <span className="eyebrow mb-1.5 block">{t("fields.position")}</span>
                <Input name="position" type="number" min={0} defaultValue={m.position} />
              </label>
              <button type="submit" className={buttonStyles("secondary", "md")}>
                {t("save")}
              </button>
              <button type="submit" formAction={deleteModule} formNoValidate className="text-steel inline-flex h-11 items-center gap-2 rounded-full px-3 text-sm font-semibold hover:text-danger" aria-label={t("deleteModule")}>
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            </form>

            <ul className="divide-ink/8 border-ink/8 divide-y rounded-2xl border">
              {own.length === 0 ? <li className="text-steel px-4 py-3 text-sm">{t("noLessons")}</li> : null}
              {own.map((l, li) => (
                <li key={l.id}>
                  <Link href={`/admin/courses/${courseId}/lessons/${l.id}`} className="hover:bg-frost/60 flex items-center gap-3 px-4 py-3 transition-colors">
                    <span className="bg-mint-soft text-mint-deep inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                      {mi + 1}.{li + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="text-ink block truncate text-sm font-semibold">{l.title.en}</span>
                      <span className="text-steel block text-xs">
                        {l.duration_min ? `${tc("minutes", { count: l.duration_min })} · ` : ""}
                        {l.video ? t("video.file") : t("video.none")}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/admin/courses/${courseId}/lessons/new?module=${m.id}`} className={buttonStyles("ghost", "sm")}>
              <Plus className="h-4 w-4" aria-hidden />
              {t("addLesson")}
            </Link>
          </div>
        );
      })}

      <form action={saveModule} className="card flex flex-wrap items-end gap-2 p-4 sm:p-5">
        <input type="hidden" name="course_id" value={courseId} />
        <input type="hidden" name="position" value={modules.length} />
        <label className="min-w-[200px] flex-1">
          <span className="eyebrow mb-1.5 block">{t("newModule")}</span>
          <Input name="title_en" required placeholder={t("moduleTitle")} />
        </label>
        <button type="submit" className={buttonStyles("primary", "md")}>
          <Plus className="h-4 w-4" aria-hidden />
          {t("newModule")}
        </button>
      </form>
    </section>
  );
}
