-- KINEZIS LIVE · personal profile, settings, health dashboard, activity log. Safe to run more than once.

-- Profile fields (public ones are shown only when privacy allows)
alter table public.profiles add column if not exists avatar_src text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists interests text[] not null default '{}';
alter table public.profiles add column if not exists banner_src text;
alter table public.profiles add column if not exists banner_preset text not null default 'deep';
alter table public.profiles add column if not exists banner_position integer not null default 50;
alter table public.profiles add column if not exists privacy jsonb not null default '{"profileVisible": true, "showActivity": false, "allowComments": true}'::jsonb;
alter table public.profiles add column if not exists notification_prefs jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists reminders jsonb not null default '[]'::jsonb;

-- Health profile: private to the owner (RLS: own row only), never exposed on public pages
alter table public.profiles add column if not exists height_cm numeric(5,1);
alter table public.profiles add column if not exists birth_date date;
alter table public.profiles add column if not exists fitness_goal text;
alter table public.profiles add column if not exists activity_level text;
alter table public.profiles add column if not exists experience text;

-- Body measurements history
create table if not exists public.measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  measured_on date not null default current_date,
  weight_kg numeric(5,1),
  waist_cm numeric(5,1),
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, measured_on)
);
alter table public.measurements enable row level security;
drop policy if exists "measurements: own" on public.measurements;
create policy "measurements: own" on public.measurements for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.measurements to authenticated;

-- Completed sessions (manual "done" marks and player completions)
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_type text not null check (item_type in ('workout', 'lesson')),
  item_id text not null,
  title text,
  duration_min integer,
  completed_at timestamptz not null default now()
);
create index if not exists activity_log_user_time on public.activity_log (user_id, completed_at desc);
alter table public.activity_log enable row level security;
drop policy if exists "activity_log: own" on public.activity_log;
create policy "activity_log: own" on public.activity_log for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.activity_log to authenticated;

-- Avatars and profile banners: public bucket, each user writes only inside their own folder
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "avatars: read" on storage.objects;
drop policy if exists "avatars: own insert" on storage.objects;
drop policy if exists "avatars: own update" on storage.objects;
drop policy if exists "avatars: own delete" on storage.objects;
create policy "avatars: read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars: own insert" on storage.objects for insert with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: own update" on storage.objects for update using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars: own delete" on storage.objects for delete using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- Account deletion by the owner. Removes the auth user; profile, favourites, progress, measurements and logs cascade.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer set search_path = public, auth
as $body$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$body$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
