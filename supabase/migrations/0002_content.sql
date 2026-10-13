-- KINEZIS LIVE · stage 6a: content tables (authors, workouts, posts) with staff-only writes.
-- Run in Supabase → SQL Editor. Safe to run more than once.

-- Staff = trainer or admin. Security definer so RLS policies can call it without recursion.
create or replace function public.is_staff()
returns boolean
language sql
security definer set search_path = public
stable
as $body$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('trainer', 'admin')
  );
$body$;

create table if not exists public.authors (
  id text primary key,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  role text not null default 'trainer' check (role in ('trainer', 'author')),
  created_at timestamptz not null default now()
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  category text not null check (category in ('kinesiotherapy','yoga','pilates','stretching','mobility','back')),
  duration_min integer not null default 10 check (duration_min > 0),
  level text not null default 'beginner' check (level in ('beginner','intermediate','advanced')),
  goals text[] not null default '{}',
  access text not null default 'free' check (access in ('free','premium')),
  language text not null default 'uk',
  cover_tone text not null default 'deep' check (cover_tone in ('deep','mint','light')),
  video jsonb,
  author_id text references public.authors (id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'news' check (kind in ('news','tip','session','video','photo')),
  author_id text references public.authors (id) on delete set null,
  title jsonb,
  body jsonb not null,
  attachment jsonb,
  language text not null default 'uk',
  access text not null default 'free' check (access in ('free','premium')),
  reactions_enabled boolean not null default true,
  comments_enabled boolean not null default true,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.authors enable row level security;
alter table public.workouts enable row level security;
alter table public.posts enable row level security;

drop policy if exists "authors: public read" on public.authors;
drop policy if exists "authors: staff write" on public.authors;
drop policy if exists "workouts: public read published" on public.workouts;
drop policy if exists "workouts: staff all" on public.workouts;
drop policy if exists "posts: public read published" on public.posts;
drop policy if exists "posts: staff all" on public.posts;

create policy "authors: public read" on public.authors for select using (true);
create policy "authors: staff write" on public.authors for all using (public.is_staff()) with check (public.is_staff());

create policy "workouts: public read published" on public.workouts for select using (published = true or public.is_staff());
create policy "workouts: staff all" on public.workouts for all using (public.is_staff()) with check (public.is_staff());

create policy "posts: public read published" on public.posts for select using (published = true or public.is_staff());
create policy "posts: staff all" on public.posts for all using (public.is_staff()) with check (public.is_staff());

grant select on public.authors, public.workouts, public.posts to anon, authenticated;
grant insert, update, delete on public.authors, public.workouts, public.posts to authenticated;

drop trigger if exists workouts_touch on public.workouts;
drop trigger if exists posts_touch on public.posts;
create trigger workouts_touch before update on public.workouts for each row execute function public.touch_updated_at();
create trigger posts_touch before update on public.posts for each row execute function public.touch_updated_at();

-- The trainer from the KINEZIS site
insert into public.authors (id, name, role) values ('yuliia', 'Юлія', 'trainer') on conflict (id) do nothing;

-- Staff may read every profile (needed to link authors to accounts in the admin panel)
drop policy if exists "profiles: staff read all" on public.profiles;
create policy "profiles: staff read all" on public.profiles for select using (public.is_staff());
