import type { Course, Lesson } from "./types";

/**
 * Face Fitness repository, stage 4. One sample course shows the structure
 * (modules → lessons → video, routine, recommendations). Names are placeholders
 * on purpose; the trainer's real courses replace them in the admin stage.
 */
const sampleCourses: Course[] = [
  {
    id: "c-sample-structure",
    slug: "sample-course-structure",
    title: { en: "Sample course structure", uk: "Зразок структури курсу", de: "Beispiel-Kursstruktur" },
    description: {
      en: "This is how a Face Fitness course is organised: modules, lessons inside them, and for each lesson a video, a step-by-step routine and recommendations. Real lessons are added by the trainer.",
      uk: "Так організовано курс Face Fitness: модулі, уроки всередині них, а в кожному уроці відео, покрокова рутина та рекомендації. Справжні уроки додає тренер.",
      de: "So ist ein Face-Fitness-Kurs aufgebaut: Module, darin Lektionen, und zu jeder Lektion ein Video, eine Schritt-für-Schritt-Routine und Empfehlungen. Echte Lektionen fügt die Trainerin hinzu.",
    },
    coverTone: "mint",
    level: "beginner",
    access: "free",
    language: "uk",
    authorId: "yuliia",
    publishedAt: "2026-10-13",
    sample: true,
    modules: [
      {
        id: "m-1",
        title: { en: "Module 1", uk: "Модуль 1", de: "Modul 1" },
        lessons: [
          {
            id: "l-1-1",
            slug: "lesson-1-1",
            title: { en: "Lesson 1.1", uk: "Урок 1.1", de: "Lektion 1.1" },
            summary: { en: "Placeholder for the first lesson.", uk: "Місце для першого уроку.", de: "Platzhalter für die erste Lektion." },
            video: null,
            routine: [
              { en: "Step 1 (to be written by the trainer)", uk: "Крок 1 (напише тренер)", de: "Schritt 1 (schreibt die Trainerin)" },
              { en: "Step 2 (to be written by the trainer)", uk: "Крок 2 (напише тренер)", de: "Schritt 2 (schreibt die Trainerin)" },
            ],
            access: "free",
          },
          {
            id: "l-1-2",
            slug: "lesson-1-2",
            title: { en: "Lesson 1.2", uk: "Урок 1.2", de: "Lektion 1.2" },
            video: null,
            access: "free",
          },
        ],
      },
      {
        id: "m-2",
        title: { en: "Module 2", uk: "Модуль 2", de: "Modul 2" },
        lessons: [
          {
            id: "l-2-1",
            slug: "lesson-2-1",
            title: { en: "Lesson 2.1", uk: "Урок 2.1", de: "Lektion 2.1" },
            video: null,
            access: "free",
          },
        ],
      },
    ],
  },
];

export function listCourses(): Course[] {
  return [...sampleCourses].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));
}

export function getCourse(slug: string): Course | undefined {
  return sampleCourses.find((c) => c.slug === slug);
}

export function getCourseById(id: string): Course | undefined {
  return sampleCourses.find((c) => c.id === id);
}

export function countLessons(course: Course): number {
  return course.modules.reduce((n, m) => n + m.lessons.length, 0);
}

export function flatLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

export function getLesson(course: Course, lessonSlug: string): { lesson: Lesson; index: number; next?: Lesson; prev?: Lesson } | undefined {
  const all = flatLessons(course);
  const index = all.findIndex((l) => l.slug === lessonSlug);
  if (index < 0) return undefined;
  return { lesson: all[index], index, next: all[index + 1], prev: all[index - 1] };
}
