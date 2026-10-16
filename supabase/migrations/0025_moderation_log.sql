-- 0025: moderation log (EU Digital Services Act: decisions must be explainable). Admin-only; the app writes
-- one row per moderation action. Depends on 0016 (is_admin). Safe to re-run.
create table if not exists public.moderation_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id) on delete set null,
  action text not null check (action in (
    'hide_post', 'unhide_post', 'hide_comment', 'unhide_comment', 'approve_content', 'reject_content',
    'suspend_trainer', 'activate_trainer', 'verify_trainer', 'unverify_trainer',
    'approve_application', 'reject_application', 'review_application',
    'resolve_report', 'dismiss_report', 'clear_review')),
  target_type text not null,
  target_id text not null,
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);
create index if not exists moderation_log_time on public.moderation_log (created_at desc);
alter table public.moderation_log enable row level security;
drop policy if exists "moderation_log: admin all" on public.moderation_log;
drop policy if exists "moderation_log: admin read" on public.moderation_log;
drop policy if exists "moderation_log: admin insert" on public.moderation_log;
create policy "moderation_log: admin read" on public.moderation_log for select using (public.is_admin());
create policy "moderation_log: admin insert" on public.moderation_log for insert with check (public.is_admin() and actor_id = auth.uid());
grant select, insert on public.moderation_log to authenticated;
