-- Primary goal + target weight on the profile; per-day water log synced from the device.
alter table public.profiles add column if not exists primary_goal text;
alter table public.profiles add column if not exists target_weight_kg numeric(5,1);

create table if not exists public.water_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  ml integer not null default 0 check (ml >= 0 and ml <= 20000),
  goal_ml integer not null default 2000 check (goal_ml >= 200 and goal_ml <= 10000),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.water_days enable row level security;
drop policy if exists "water_days: own" on public.water_days;
create policy "water_days: own" on public.water_days for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.water_days to authenticated;
