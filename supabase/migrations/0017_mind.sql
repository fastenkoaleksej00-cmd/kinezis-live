-- Mind & rest: meditation / screen breaks / evening ritual are logged as activity type 'mind';
-- daily well-being check-ins (mood, energy, sleep, tension, gratitude). Owner-only, never public.
alter table public.activity_log drop constraint if exists activity_log_item_type_check;
alter table public.activity_log add constraint activity_log_item_type_check check (item_type in ('workout', 'lesson', 'breath', 'mind'));

create table if not exists public.wellbeing_checkins (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  mood smallint check (mood between 1 and 5),
  energy smallint check (energy between 1 and 5),
  sleep smallint check (sleep between 1 and 5),
  tension smallint check (tension between 1 and 5),
  gratitude text check (char_length(gratitude) <= 500),
  updated_at timestamptz not null default now(),
  primary key (user_id, day)
);
alter table public.wellbeing_checkins enable row level security;
drop policy if exists "wellbeing_checkins: own" on public.wellbeing_checkins;
create policy "wellbeing_checkins: own" on public.wellbeing_checkins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
grant select, insert, update, delete on public.wellbeing_checkins to authenticated;
