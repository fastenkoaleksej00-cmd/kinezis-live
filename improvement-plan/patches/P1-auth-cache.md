# P1-auth-cache — один запрос к Supabase Auth на показ страницы (не применено)

## Изменение в `lib/supabase/server.ts`
```ts
/** The signed-in auth user for this request, fetched once (React cache). */
export const getAuthUser = cache(async () => {
  const supabase = await createServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
});
```
`getSessionUser` начинает с `const user = await getAuthUser();` вместо собственного `auth.getUser()`.

## Где заменить `supabase.auth.getUser()` на `getAuthUser()` (только чтения в серверных компонентах)
- `lib/profile/queries.ts` (`getMyProfile`, `listMeasurements`, …)
- `lib/social/queries.ts` (`getSocialCounts`, `listComments`)
- `lib/chat/queries.ts` (`countMyUnread`, …)

## Где НЕ трогать
- Серверные действия (`lib/*/actions.ts`): они выполняются отдельным запросом, `cache()` там не даёт выигрыша, а явная проверка пользователя — часть защиты.
- `lib/supabase/middleware.ts`: обновляет cookies сессии, должен вызывать `getUser()` сам.
- `app/api/export/route.ts`: один вызов, оставить.

## Проверка после применения
1. typecheck, lint, build.
2. Вход/выход, Главная, Профиль, страница поста с лайками и комментариями.
3. В логах Supabase (Auth → Logs) число запросов `/user` на одно открытие Главной падает с 4–5 до 1–2.
