# KINEZIS LIVE — app

A daily-use wellness platform by the KINEZIS brand: trainer feed, workout library, Face Fitness courses,
skincare, saved items, profile and a future subscription. Sibling of the KINEZIS site in `~/Desktop/webcentre1`
(read-only reference; never modify it).

## Stack
- Next.js 15 (App Router), React 19, TypeScript (strict)
- Tailwind CSS v4 (`@theme` in `app/globals.css`, no tailwind.config). Palette copied from the site:
  petrol `ink` #10242B → icy `ice` #F5F8F8, glow `#8EDCF0`, accent `#2A86B4`. App-only `mint` tones for beauty directions.
  Glass surfaces `.glass` / `.glass-dark`, dark `.section-deep`, cover placeholders `.cover`, `.cover-mint`, `.cover-light`.
- `next-intl` without URL prefixes: cookie `kl_locale`, default `en`, dictionaries in `messages/*.json` (en, uk, de).
- `motion` for animation, `lucide-react` for icons. No shadcn/ui, no Supabase yet (stage 5).
- Package manager: npm (pnpm cannot lock its store in the sandboxed shell). Fonts: Manrope + Caveat via `next/font`.

## Commands
- `npm run dev` / `npm run build` / `npm run lint` / `npm run typecheck`
- `node scripts/extract-logo.mjs <logo.png>` regenerates the temporary logo PNGs and icons in `public/brand`.

## Structure
- `app/(app)/` — the five tabs: `/` (Home, feed-first), `/explore`, `/library` (+ `/library/[slug]`, `/library/[slug]/watch`), `/saved`, `/profile` (+ `/profile/settings`)
- `components/layout/` — `AppShell`, `TopBar` (phone), `BottomNav` (phone), `SideNav` (md+)
- `components/ui/` — Button, Chip, Container, Cover, EmptyState, Logo, Reveal, SectionHeading
- `components/library/` — WorkoutCard, FilterBar (URL-driven, bottom sheet), SaveButton (any item key), SavedWorkouts
- `components/feed/` — PostCard, AuthorRow, SavedPosts, SavedEmpty; post page at `app/(app)/posts/[id]`
- `lib/content/posts.ts` — feed repository (sample posts now); `getTodayWorkout()` in `workouts.ts` rotates the session of the day
- `components/player/VideoPlayer.tsx` — HTML5 player with resume; honest empty state when `video` is null
- `components/home/ContinueCard.tsx` — last unfinished session from local progress
- `lib/content/` — `types.ts` (Workout, VideoSource, filters), `workouts.ts` (repository: sample data now, Supabase in stage 5), `localize.ts`
- `lib/store/` — localStorage stores for favourites (`kl_favorites`, keys from `keys.ts`: `workout:<id>`, `post:<id>`) and progress (`kl_progress`); same API will sync to accounts later
- `i18n/` — locale config and request config; `lib/locale.ts` — server action that sets the cookie
- `design/`, `fotkiinfo/` — reference material from the owner, not part of the build (gitignored)

## Rules
- Work only inside this folder.
- Server Components by default; `"use client"` only for state, events, motion.
- Named exports. No `any`. 2 spaces.
- Every UI string goes through `messages/*.json`; add the key to all three locales.
- Interface language ≠ content language: videos, posts and courses carry their own `language` field.
- Never invent facts: no made-up videos, lessons, products, ingredients, prices, reviews or medical claims.
  Wording: "prevention", "recovery through movement". Never "diagnosis", "treatment", "medical centre".
- No fake backends: a feature without a real data source shows an honest empty state, never a pretend success.
- Sample posts are labelled "Sample" in the UI; reactions/comments are model flags only, no sending UI.
- Sample workouts in `lib/content/workouts.ts` are marked `sample: true` and have `video: null`; keep names neutral, no results promised.
- Filters live in the URL (`?category=&duration=&goal=&level=`) and are parsed by `parseFilters`, unknown values are dropped.
- No stock photos. Use `Cover` placeholders until real covers arrive.
- Subscription and payments: architecture only until the owner decides the scheme.
- Animations respect `prefers-reduced-motion`. No infinite rotation.
- New dependencies only when truly needed.
