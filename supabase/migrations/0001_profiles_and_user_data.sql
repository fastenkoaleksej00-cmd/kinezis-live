-- KINEZIS LIVE · stage 5: profiles, roles and per-user data.
-- Run in Supabase → SQL Editor → New query → paste → Run.

-- Roles: regular user, trainer (content author), admin (platform owner)
create type public.user_role as enum ('user', 'trainer', 'admin');

-- One profile per auth user, created automatically on sign-up
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role public.user_role not null default 'user',
  locale text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Saved items: "workout:<id>", "post:<id>", "course:<id>"
create table public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_key text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, item_key)
);

-- Video watch position per workout or lesson
create table public.watch_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id text not null,
  position_sec double precision not null default 0,
  duration_sec double precision not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

-- Completed course lessons
create table public.lesson_progress (
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

-- Row Level Security: everyone sees and edits only their own rows
alter table public.profiles enable row level security;
alter table public.favorites enable row level security;
alter table public.watch_progress enable row level security;
alter table public.lesson_progress enable row level security;

create policy "profiles: read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles: update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "favorites: own" on public.favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "watch_progress: own" on public.watch_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lesson_progress: own" on public.lesson_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The project was created with "automatically expose new tables" off, so grant access explicitly
grant usage on schema public to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.watch_progress to authenticated;
grant select, insert, update, delete on public.lesson_progress to authenticated;

-- Create the profile row when a user signs up; display name comes from sign-up metadata
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, nullif(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles for each row execute function public.touch_updated_at();
create trigger watch_progress_touch before update on public.watch_progress for each row execute function public.touch_updated_at();
create trigger lesson_progress_touch before update on public.lesson_progress for each row execute function public.touch_updated_at();
