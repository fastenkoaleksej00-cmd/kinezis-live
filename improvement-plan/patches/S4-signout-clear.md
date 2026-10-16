# S4 — очистка личных данных на устройстве при выходе (не применено)

Сервер не может очистить localStorage, поэтому очистку делает клиент перед вызовом серверного `signOut`.

## Новый файл `lib/store/clearPersonal.ts`
```ts
"use client";
/** Personal per-device data; appearance, language and tips stay. Synced data returns on next sign-in. */
const PERSONAL_KEYS = ["kl_checkins", "kl_water", "kl_habits", "kl_favorites", "kl_progress", "kl_lessons", "kl_shopping", "kl_challenges"];
export function clearPersonalData(): void {
  for (const k of PERSONAL_KEYS) {
    try { window.localStorage.removeItem(k); } catch { /* private mode */ }
  }
}
```

## Где вызвать
Формы выхода (`<form action={signOut}>` в профиле и настройках) получают `onSubmit={() => clearPersonalData()}`; для этого кнопку выхода выносим в маленький клиентский компонент `SignOutButton`.

## Проверка
Войти → отметить самочувствие и воду → выйти → Главная гостя без чужих данных → войти снова → данные вернулись из аккаунта.
