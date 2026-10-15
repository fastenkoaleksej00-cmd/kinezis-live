# KINEZIS LIVE

Wellness platform app of the KINEZIS brand: trainer feed, workout library, Face Fitness courses, skincare,
saved items and profile. Built with Next.js 15, React 19, Tailwind CSS v4 and next-intl.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. The interface starts in English; change the language in Profile → Settings.

## Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and fill in the Supabase URL and publishable (anon) key. Without them the app runs with local-only saved items and no accounts.

## Database

Run the files in `supabase/migrations/` in order in the Supabase SQL Editor (0001 users, 0002 workouts and posts, 0003 makes the first account admin, 0004 courses and skincare, 0005 storage buckets, 0006 plans and trainer profiles, 0007 meal plans, 0008 profile, health and settings). In Authentication → URL Configuration set Site URL to the app URL (e.g. `http://localhost:3001`) and add `http://localhost:3001/**` to Redirect URLs.

## Testing the player with your own file

Put an mp4 into `public/videos/` and point one sample workout's `video` field in `lib/content/workouts.ts` to it, e.g. `{ kind: "file", src: "/videos/test.mp4" }`. Do not commit large videos.

## Stages

1. Shell, design system, navigation, language switcher — done
2. Workout Library with categories, filters, player, favourites — done (sample sessions, videos not connected yet)
3. Home feed and trainer posts — done (sample posts, session of the day)
4. Face Fitness courses and Skincare structure — done (sample course skeleton, empty skincare sections)
5. Accounts and data (Supabase) — done; video hosting moves to stage 7
6. Trainer admin panel — done (workouts, posts, courses with modules and lessons, skincare routines, articles, products)
7. Video upload to Supabase Storage — done (free plan: 50 MB per file)
8. iOS / Android shells with Capacitor — done, see `docs/MOBILE.md` (needs a deployment + Xcode / Android Studio)
9. Russian locale, password reset, Google sign-in (flag-gated, see `docs/AUTH.md`), quick composer, nutrition section — done
10. Settings, profile editor, health dashboard, activity stats — done (Apple Health: plan in `docs/HEALTH_INTEGRATION.md`)
11. Subscription — foundation done (plans, paywall, Premium page, interest list); payments pending the legal-entity decision, see `docs/SUBSCRIPTION.md`
