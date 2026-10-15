"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { logMindSession } from "@/lib/profile/actions";
import { markHabit, type HabitKind } from "@/lib/store/habits";

/** Marks the habit locally (challenges) and, for signed-in members, logs the session to their activity. */
export function useFinishPractice(habit: HabitKind, practiceId: string, title: string, signedIn: boolean) {
  const router = useRouter();
  const [logged, setLogged] = useState(false);
  const finish = useCallback(
    (elapsedSec: number) => {
      markHabit(habit);
      if (!signedIn) return;
      void logMindSession(practiceId, title, elapsedSec / 60)
        .then((ok) => {
          if (ok) {
            setLogged(true);
            router.refresh();
          }
        })
        .catch(() => undefined);
    },
    [habit, practiceId, title, signedIn, router],
  );
  return { finish, logged };
}
