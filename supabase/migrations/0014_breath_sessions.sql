-- KINEZIS LIVE · breathing sessions count as activity. Safe to run more than once.
alter table public.activity_log drop constraint if exists activity_log_item_type_check;
alter table public.activity_log add constraint activity_log_item_type_check check (item_type in ('workout', 'lesson', 'breath'));
