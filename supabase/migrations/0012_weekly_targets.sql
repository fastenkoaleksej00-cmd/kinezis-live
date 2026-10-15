-- KINEZIS LIVE · personal weekly targets for the activity rings. Safe to run more than once.
alter table public.profiles add column if not exists weekly_sessions_target integer not null default 3 check (weekly_sessions_target between 1 and 14);
alter table public.profiles add column if not exists weekly_minutes_target integer not null default 60 check (weekly_minutes_target between 10 and 1500);
