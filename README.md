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

Copy `.env.example` to `.env.local`. Nothing is required yet.

## Testing the player with your own file

Put an mp4 into `public/videos/` and point one sample workout's `video` field in `lib/content/workouts.ts` to it, e.g. `{ kind: "file", src: "/videos/test.mp4" }`. Do not commit large videos.

## Stages

1. Shell, design system, navigation, language switcher — done
2. Workout Library with categories, filters, player, favourites — done (sample sessions, videos not connected yet)
3. Home feed and trainer posts — done (sample posts, session of the day)
4. Face Fitness courses and Skincare structure — done (sample course skeleton, empty skincare sections)
5. Accounts and data (Supabase), video hosting
6. Trainer admin panel
7. iOS / Android packaging, subscription
