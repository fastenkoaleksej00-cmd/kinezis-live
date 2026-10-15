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
- `motion` for animation, `lucide-react` for icons. No shadcn/ui.
- Supabase (`@supabase/ssr` + `supabase-js`): auth with email + password, `profiles` with roles user/trainer/admin, per-user tables `favorites`, `watch_progress`, `lesson_progress` (RLS: own rows only). Schema in `supabase/migrations/` (0001 users, 0002 workouts/posts with `is_staff()` policies, 0003 first-user-admin, 0004 courses + skincare, 0005 storage buckets, 0006 plans + trainer profile columns, 0007 meal_plans, 0008 profile/health/settings + `avatars` bucket + `delete_my_account()`). Public env in `.env.local` (gitignored); never store the service_role key in the repo.
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
- Personal area: `lib/profile/` (types, queries `getMyProfile/listMeasurements/listActivity`, actions), `lib/health/stats.ts` (pure streak/BMI/period helpers), pages `/profile` (banner, avatar, stats, achievements), `/profile/edit`, `/profile/activity`, `/health`, `/profile/settings` (language, notifications + reminders, privacy, accessibility, account incl. email/password change and `delete_my_account()` RPC). Charts are dependency-free SVG in `components/health/`. Health rows are owner-only via RLS and never rendered publicly. Accessibility (text size, reduce motion) is per-device in localStorage via `AccessibilityProvider`.
- Trainer profiles: `/trainers/[id]` from `authors` (bio, specialties, verified, avatar_src, instagram); `TrainerBadge` only when `verified`. `QuickPostButton` (+) on Home for staff → /admin/posts/new.
- Animations respect `prefers-reduced-motion`. No infinite rotation. Screen transitions: `app/(app)/template.tsx` + `.page-enter` (CSS, 280 ms); active tab indicators slide with motion `layoutId` in BottomNav/SideNav.
- Product roadmap and audit (Russian): `docs/ROADMAP.md`. Keep it updated when stages land.
- New dependencies only when truly needed.
