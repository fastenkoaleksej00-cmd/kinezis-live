# Вход и безопасность аккаунта

Система авторизации: Supabase Auth. Всё ниже работает на её основе, без других сервисов.

## Что уже реализовано в коде

| Функция | Где | Статус |
|---|---|---|
| Email + пароль, регистрация и вход | `/auth/sign-up`, `/auth/sign-in` | работает |
| Подтверждение email | `app/auth/callback/route.ts` | работает; в Supabase сейчас выключено для тестов на localhost, включить перед запуском |
| «Забыли пароль?» | `/auth/forgot` → письмо → `/auth/callback?next=/auth/reset` → `/auth/reset` | работает после настройки Site URL / Redirect URLs в Supabase (уже сделано) |
| Состояния: загрузка, ошибка, неверные данные, истёкшая ссылка | формы показывают текст ошибки, кнопка «Подожди…» на время запроса, экран «ссылка устарела» со ссылкой на новый запрос | работает |
| Вход через Google | кнопка «Продолжить с Google» на экранах входа и регистрации | код готов, кнопка скрыта, пока `NEXT_PUBLIC_AUTH_GOOGLE` не равен `true` |
| Подсказка «аккаунт создан через Google» | при ошибке «неверный пароль» показывается подсказка про кнопку Google, если Google включён | работает |

Пользователь не может узнать по форме сброса, существует ли адрес: ответ всегда «проверь почту».

## Как включить Google (нужно один раз, бесплатно)

1. **Google Cloud Console** (console.cloud.google.com) → создать проект `KINEZIS LIVE`.
2. APIs & Services → **OAuth consent screen**: тип External, название приложения, email поддержки, логотип по желанию. Scopes оставить стандартные (email, profile). Сохранить. Пока приложение в статусе Testing, добавьте свои адреса в Test users; для всех пользователей нажмите Publish app.
3. APIs & Services → **Credentials** → Create credentials → **OAuth client ID** → тип Web application.
   - Authorized JavaScript origins: `https://kinezis-live.vercel.app` и `http://localhost:3001`
   - Authorized redirect URIs: `https://mjwyglmyfbnnlerqcknb.supabase.co/auth/v1/callback`
   - Сохранить и скопировать **Client ID** и **Client secret**.
4. **Supabase** → Authentication → Sign In / Providers → **Google** → включить, вставить Client ID и Client secret → Save. Секрет живёт только в Supabase, в код и GitHub он не попадает.
5. В `.env.local` и в переменных Vercel поставить `NEXT_PUBLIC_AUTH_GOOGLE=true`, перезапустить сервер или передеплоить. Кнопка появится.

## Связывание способов входа

Supabase по умолчанию связывает аккаунты автоматически: если человек зарегистрировался по email и паролю, а потом входит через Google с тем же подтверждённым адресом, он попадает в тот же аккаунт. В обратную сторону, когда аккаунт создан через Google, а человек пробует пароль, которого нет, он увидит «Неверный email или пароль» и подсказку воспользоваться кнопкой Google. Задать пароль такому аккаунту можно через «Забыли пароль?».

## Перед запуском

- Включить подтверждение email в Supabase (Authentication → Sign In / Providers → Email → Confirm email).
- Проверить, что Site URL указывает на боевой адрес, а в Redirect URLs есть `https://kinezis-live.vercel.app/**`.
- Настроить собственный SMTP в Supabase (например Resend, бесплатно до 3 000 писем в месяц): встроенная отправка ограничена несколькими письмами в час и подходит только для тестов.
