# KINEZIS LIVE — app

A daily-use wellness platform by the KINEZIS brand: trainer feed, workout library, Face Fitness courses,
skincare, saved items, profile and a future subscription. Sibling of the KINEZIS site in `~/Desktop/webcentre1`
(read-only reference; never modify it).

## Stack
- Next.js 15 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4 (`@theme` in `app/globals.css`, no tailwind.config). Palette copied from the site:
  petrol `ink` #10242B → icy `ice` #F5F8F8, glow `#8EDCF0`, accent `#2A86B4`. App-only `mint` tones for beauty directions.
  Glass surfaces `.glass` / `.glass-dark`, dark `.section-deep`, cover placeholders `.cover`, `.cover-mint`, `.cover-light`.
- `next-intl` without URL prefixes: cookie `kl_locale`, default `en`, dictionaries in `messages/*.json` (en, uk, de, ru). Add every new key to all four files; a key-parity check script pattern lives in git history of this file's commits.
- `motion` for animation, `lucide-react` for icons, `three` (lazy-loaded only on `/body`). No shadcn/ui.
- Supabase (`@supabase/ssr` + `supabase-js`): auth with email + password, `profiles` with roles user/trainer/admin, per-user tables `favorites`, `watch_progress`, `lesson_progress` (RLS: own rows only). Schema in `supabase/migrations/` (0001 users, 0002 workouts/posts with `is_staff()` policies, 0003 first-user-admin, 0004 courses + skincare, 0005 storage buckets, 0006 plans + trainer profile columns, 0007 meal_plans, 0008 profile/health/settings + `avatars` bucket + `delete_my_account()`, 0009 reactions/comments + views, 0010 chat + realtime publication, 0011 member posts + member-videos bucket + public_profile_extras(), 0012 weekly targets, 0013 storage-level video entitlement). Public env in `.env.local` (gitignored); never store the service_role key in the repo.
- Package manager: npm (pnpm cannot lock its store in the sandboxed shell). Fonts: Manrope + Caveat via `next/font`.

## Commands
- `npm run dev` / `npm run build` / `npm run lint` / `npm run typecheck`
- `npm run cap:sync` / `npm run cap:ios` / `npm run cap:android` — native shells (need Xcode / Android Studio)
- `node scripts/extract-logo.mjs <logo.png>` regenerates the temporary logo PNGs and icons in `public/brand`.

## Structure
- `app/(app)/` — the five tabs: `/` (Home, feed-first), `/explore`, `/library` (+ `/library/[slug]`, `/library/[slug]/watch`), `/saved`, `/profile` (+ `/profile/settings`)
- `components/layout/` — `AppShell`, `TopBar` (phone), `BottomNav` (phone), `SideNav` (md+)
- `components/ui/` — Button, Chip, Container, Cover, EmptyState, Logo, Reveal, SectionHeading
- `components/library/` — WorkoutCard, FilterBar (URL-driven, bottom sheet), SaveButton (any item key), SavedWorkouts
- `components/feed/` — PostCard, AuthorRow, SavedPosts, SavedEmpty; post page at `app/(app)/posts/[id]`
- `components/courses/` — CourseCard, CourseProgress, LessonRow, LessonDoneButton, SavedCourses; routes `/face-fitness`, `/face-fitness/[slug]`, `/face-fitness/[slug]/[lesson]`
- `components/skincare/SectionLink.tsx`; routes `/skincare` (hub), `/skincare/routines|articles|products` (empty until the trainer adds items)
- `lib/content/courses.ts` — DB-first (courses → course_modules → lessons) with the sample skeleton as fallback; `lib/content/skincare.ts` — DB only (skin_routines, skin_articles, products), no sample data by design; public detail pages at `/skincare/<section>/[slug]`
- `lib/content/posts.ts` — feed repository (sample posts now); `getTodayWorkout()` in `workouts.ts` rotates the session of the day
- `components/player/VideoPlayer.tsx` — HTML5 player with resume; honest empty state when `video` is null
- `components/home/ContinueCard.tsx` — last unfinished session from local progress
- `lib/content/` — `types.ts`, `db.ts` (row types + mappers), `workouts.ts` / `posts.ts` (async repositories: published rows from Supabase, sample fallback while the table is empty), `localize.ts`
- `lib/admin/` — `queries.ts` (staff reads incl. drafts), `actions.ts` (saveWorkout/deleteWorkout/savePost/deletePost; staff check + RLS)
- `components/admin/` + `app/(app)/admin/**` — trainer panel: overview; workouts, posts, courses (with ModuleEditor: modules inline, lessons via LessonForm), skincare (routines, articles, products). Layout redirects non-staff to /profile.
- `lib/store/` — localStorage stores for favourites (`kl_favorites`, keys from `keys.ts`: `workout:<id>`, `post:<id>`, `course:<id>`), watch progress (`kl_progress`) and completed lessons (`kl_lessons`); same API will sync to accounts later
- `lib/supabase/` — `env.ts` (null when not configured), `client.ts` (browser), `server.ts` (cookies + `getSessionUser()`), `middleware.ts` (session refresh, wired in root `middleware.ts`)
- `lib/video/resolve.ts` — video host adapter: turns a `VideoSource` (file | hls | storage) into a playable URL; Supabase Storage sources get a 3-hour signed URL. Adding Cloudflare Stream/Mux later = one more `kind` here.
- `components/admin/VideoField.tsx` — source picker with direct browser upload to the private `videos` bucket (50 MB free-plan limit); writes `<name>_kind/_path/_src/_poster` hidden inputs.
- `lib/auth/actions.ts` — signIn / signUp / signOut / requestPasswordReset / updatePassword / signInWithGoogle (Google button only when `NEXT_PUBLIC_AUTH_GOOGLE=true`; setup in `docs/AUTH.md`); pages `/auth/forgot`, `/auth/reset`; pages `app/(app)/auth/sign-in|sign-up`, callback `app/auth/callback/route.ts`
- `components/auth/` — AuthForm (useActionState), UserDataSync (pulls account rows on sign-in, merges with local stores, pushes every local change)
- `i18n/` — locale config and request config; `lib/locale.ts` — server action that sets the cookie
- `capacitor.config.ts`, `ios/`, `android/`, `mobile/` — native shells (Capacitor 8) that load the hosted web app via `server.url` (env `CAPACITOR_SERVER_URL`); `mobile/assets` are the icon/splash sources, `mobile/www` the offline placeholder. Guide: `docs/MOBILE.md`. Never put app logic in the native folders.
- `design/`, `fotkiinfo/` — reference material from the owner, not part of the build (gitignored)

## Rules
- Work only inside this folder.
- Server Components by default; `"use client"` only for state, events, motion.
- Named exports. No `any`. 2 spaces.
- Every UI string goes through `messages/*.json`; add the key to all three locales.
- Interface language ≠ content language: videos, posts and courses carry their own `language` field.
- Never invent facts: no made-up videos, lessons, products, ingredients, prices, reviews or medical claims.
  Wording: "prevention", "recovery through movement". Never "diagnosis", "treatment", "medical centre".
- The app must keep working with Supabase unconfigured: stores stay local, auth pages show an honest notice.
- Never estimate calories, heart rate or sleep; Apple Health needs the native app (plan in `docs/HEALTH_INTEGRATION.md`). Notification preferences are stored but nothing is pushed yet; say so in the UI.
- No fake backends: a feature without a real data source shows an honest empty state, never a pretend success.
- Skincare never ships invented products, brands, ingredients or claims: the repositories stay empty until the trainer enters real items. No shop, no checkout.
- The sample Face Fitness course has placeholder names only (Module 1, Lesson 1.1); do not write lesson content.
- Sample posts are labelled "Sample" in the UI; reactions/comments are model flags only, no sending UI.
- Sample workouts in `lib/content/workouts.ts` are marked `sample: true` and have `video: null`; keep names neutral, no results promised.
- Filters live in the URL (`?category=&duration=&goal=&level=`) and are parsed by `parseFilters`, unknown values are dropped.
- No stock photos. Use `Cover` placeholders until real covers arrive.
- Subscription: plans free | premium | premium_plus live on `profiles.plan` (+ `plan_until`, `premium_interest`); `lib/access/plans.ts` → `canAccess()` is the single entitlement check; watch/lesson pages render `Paywall` when not allowed; cards show `LockBadge`. `/premium` page + Home `PremiumBanner` collect interest and say "launching soon". No payment provider until the owner picks the legal country (see `docs/SUBSCRIPTION.md`). Never let the client change `plan`.
- `/compose` (staff): Instagram-style quick publish (photo → `covers` bucket public URL, video → `videos` bucket) via `quickPublish`; the Home "+" points here. PostCard renders real photos when `attachment.src` exists and plays video attachments on `/posts/[id]`.
- Nutrition: `meal_plans` table (migration 0007), `lib/content/meals.ts` (DB only, no samples), `/nutrition`, `/nutrition/[slug]`, admin `/admin/nutrition`. Always show the "one person's day, not a plan for everyone" disclaimer.
- Personal area: `lib/profile/` (types, queries `getMyProfile/listMeasurements/listActivity`, actions), `lib/health/stats.ts` (pure streak/BMI/period helpers), pages `/profile` (banner, avatar, stats, achievements), `/profile/edit`, `/profile/activity`, `/health`, `/profile/settings` (language, notifications + reminders, privacy, accessibility, account incl. email/password change and `delete_my_account()` RPC). Charts are dependency-free SVG in `components/health/`. Health rows are owner-only via RLS and never rendered publicly. Accessibility (text size, reduce motion) and theme (system | light | dark) are per-device in localStorage via `AccessibilityProvider`; the root layout's inline script applies them before paint.
- Themes: system | light | mint | dark (`AccessibilityProvider`); `Logo` default tone "auto" renders ink and white variants and CSS (`.logo-ink` / `.logo-white`) picks per theme. Mint overrides live next to the dark ones in `globals.css`.
- Onboarding: `app/welcome` (outside the shell), `OnboardingGate` in the root layout redirects first-time devices (localStorage `kl_onboarded`); language picker on slide 1; optional intro video via `NEXT_PUBLIC_INTRO_VIDEO_URL`. Weekly ring targets live on `profiles.weekly_sessions_target/weekly_minutes_target` (migration 0012), edited in /health.
- `components/ui/Illustration.tsx`: brand SVG illustrations (saved, sessions, messages, measurements, search, community) using theme tokens; pass `illustration` to `EmptyState`. Home order: greeting → QuickLinks (body, nutrition, library) → TodayRings → today's session → reminders → Premium → continue → NewSessions strip → feed.
- Motion helpers in `globals.css`: `.ring-progress` (ActivityRing), `.bar-progress` (ProgressBar), `.pop-in` (success), `.skeleton` (route `loading.tsx`); all respect reduced motion.
- Trainer quick publish: `/compose/workout` (`WorkoutComposer`: video → title → category → cover upload or frame grabbed from the video via canvas → preview → publish/draft; `quickPublishWorkout`). The Home "+" (`QuickAddMenu`) offers post or workout to staff, post only to members. Covers: `VideoSource.poster` → `WorkoutCardData.poster` → `Cover imageSrc`.
- Goal calculator `/health/calculator` (`lib/health/calculator.ts`: Mifflin–St Jeor × 1.2/1.45/1.7, 0.25–0.5 kg/week, floors 1200/1500 kcal, under-18 refusal, underweight-target warning). Weekly ring targets are constants in `components/home/TodayRings.tsx` (3 sessions, 60 min).
- Dark theme lives at the end of `app/globals.css` under `html[data-theme="dark"]`: it re-points page/card/input/text utilities (including escaped class overrides like `.bg-white\/70`) and lifts the primary gradient into the accent range. Petrol surfaces, covers and glass-dark stay as is. When adding a new light-only surface, add its dark override there. Keep `--color-frost` and `--color-mist` unchanged (they are light text on dark surfaces).
- Social: `lib/social/` (reactions + comments; `public_profiles` view exposes name/avatar only when `privacy.profileVisible`), `LikeButton` (optimistic), `Comments` (own delete, staff delete), moderation at `/admin/comments` (hide/delete). Likes on posts and workouts; comments on posts (if `comments_enabled`) and workouts. Sample items never get social controls.
- Chat: `lib/chat/` (one conversation per member, `messages` with `from_staff`, Supabase Realtime on `messages`), member page `/messages`, trainer inbox `/admin/messages` + `/admin/messages/[id]`. `NEXT_PUBLIC_CHAT_OPEN_FOR_ALL` (default true) opens it to every member pre-launch; `false` gates it behind Premium via `canAccess`. Never promise reply times.
- Community posts: `posts.user_id` marks member posts (`author_id` null, `access` free, `category`), `hidden` is staff moderation. Members publish via `MemberComposer` (`memberPublish`), delete their own (`deleteOwnPost`), videos go to the private `member-videos` bucket under their own folder, photos to `avatars/<uid>/`. Feed filter `?feed=trainer|community`. Public member page `/members/[id]` uses `public_profiles` + `public_profile_extras()` RPC (privacy-aware). Moderation at `/admin/community`.
- Legal: `content/legal/{en,uk,ru,de}.ts` (privacy + terms as structured sections), pages `/privacy` and `/terms` (indexable), consent line on sign-up, links in Settings. Contact email comes from `NEXT_PUBLIC_CONTACT_EMAIL`; without it an honest placeholder is shown. Legal entity line is a placeholder until the owner provides it. A lawyer should review before store submission.
- Body map scene rules: render on demand (`needsRender`), pause when hidden, `touch-action: pan-y` so one-finger vertical swipes scroll the page and horizontal drags rotate, DPR ≤ 1.5 on touch devices, WebGL context loss handled, selection/view persisted in sessionStorage `kl_body_state`.
- Shared server reads are wrapped in React `cache()` (`createServerSupabase`, `getSessionUser`, `getMyProfile`, `listActivity`, content `fetchAll`s); keep new repositories consistent.
- Premium videos are enforced in storage by `can_read_video()` (migration 0013); `docs/SECURITY.md` records what was checked.
- Body map: `/body` tab (nav: Home · Explore · Body · Library · Profile; Saved lives in Profile/Explore). Model `public/models/kinezis-body.glb` (copy of `skelet/kinezis-body (1).glb`, single mesh, no rig; `skelet/` is reference-only and gitignored). `lib/body/regions.ts` holds 13 world-space boxes on the normalised skeleton (1.75 m, feet y=0, facing +z); a tap raycasts the mesh and maps the hit point to a region, so selection is by area, not per bone, and the UI says so. `BodyScene` tints vertices of the selected region; `BodySilhouette` is the SVG fallback when WebGL fails. `lib/body/recommend.ts` ranks real library sessions only. Pain flow: red-flag kinds (severe, sudden, numbness, weakness) show a see-a-doctor card and no exercises. Saved areas use favourites key `body:<id>`; "Ask the trainer" opens `/messages?topic=<id>` which prefills the composer.
- Trainer profiles: `/trainers/[id]` from `authors` (bio, specialties, verified, avatar_src, instagram); `TrainerBadge` only when `verified`. `QuickPostButton` (+) on Home for staff → /admin/posts/new.
- Animations respect `prefers-reduced-motion`. No infinite rotation. Screen transitions: `app/(app)/template.tsx` + `.page-enter` (CSS, 280 ms); active tab indicators slide with motion `layoutId` in BottomNav/SideNav.
- Product roadmap and audit (Russian): `docs/ROADMAP.md`. Keep it updated when stages land.
- New dependencies only when truly needed.
