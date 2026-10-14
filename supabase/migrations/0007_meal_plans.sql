-- KINEZIS LIVE · trainer's daily meal plans ("my day on a plate"). Safe to run more than once.

create table if not exists public.meal_plans (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  plan_date date,
  meals jsonb not null default '[]'::jsonb,
  notes jsonb,
  author_id text references public.authors (id) on delete set null,
  language text not null default 'uk',
  access text not null default 'free' check (access in ('free','premium')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.meal_plans enable row level security;
drop policy if exists "meal_plans: public read published" on public.meal_plans;
drop policy if exists "meal_plans: staff all" on public.meal_plans;
create policy "meal_plans: public read published" on public.meal_plans for select using (published = true or public.is_staff());
create policy "meal_plans: staff all" on public.meal_plans for all using (public.is_staff()) with check (public.is_staff());
grant select on public.meal_plans to anon, authenticated;
grant insert, update, delete on public.meal_plans to authenticated;
drop trigger if exists meal_plans_touch on public.meal_plans;
create trigger meal_plans_touch before update on public.meal_plans for each row execute function public.touch_updated_at();
