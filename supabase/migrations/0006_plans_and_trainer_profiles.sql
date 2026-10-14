-- KINEZIS LIVE · plans (no payments yet) and trainer profiles. Safe to run more than once.

-- Plan lives on the profile. Payments (web and store) will set it later; staff can set it by hand for testing.
alter table public.profiles add column if not exists plan text not null default 'free';
alter table public.profiles add column if not exists plan_until timestamptz;
alter table public.profiles add column if not exists premium_interest boolean not null default false;
alter table public.profiles add column if not exists goals text[] not null default '{}';

do $body$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_plan_check') then
    alter table public.profiles add constraint profiles_plan_check check (plan in ('free', 'premium', 'premium_plus'));
  end if;
end $body$;

-- Users may update their own interest flag and goals, never their plan or role
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and plan = (select p.plan from public.profiles p where p.id = auth.uid())
    and plan_until is not distinct from (select p.plan_until from public.profiles p where p.id = auth.uid())
  );

-- Trainer profile fields
alter table public.authors add column if not exists bio jsonb;
alter table public.authors add column if not exists specialties text[] not null default '{}';
alter table public.authors add column if not exists verified boolean not null default false;
alter table public.authors add column if not exists avatar_src text;
alter table public.authors add column if not exists instagram text;

update public.authors
set verified = true,
    instagram = coalesce(instagram, 'https://www.instagram.com/julruz_'),
    specialties = case when cardinality(specialties) = 0 then array['yoga', 'stretching', 'mobility', 'kinesiotherapy'] else specialties end
where id = 'yuliia';
