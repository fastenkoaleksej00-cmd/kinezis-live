-- PROPOSED, NOT APPLIED. Purpose: record moderation decisions (EU Digital Services Act: statement of reasons).
-- Depends on: 0016 (is_admin). The app writes a row from each moderation action (hide post, reject content,
-- suspend trainer, resolve report); members never read this table.
create table if not exists public.moderation_log (
  id bigint generated always as identity primary key,
  actor_id uuid not null references auth.users (id) on delete set null,
  action text not null check (action in ('hide_post', 'unhide_post', 'reject_content', 'approve_content', 'suspend_trainer', 'activate_trainer', 'verify_trainer', 'resolve_report', 'dismiss_report', 'delete_comment')),
  target_type text not null,
  target_id text not null,
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now()
);
create index if not exists moderation_log_time on public.moderation_log (created_at desc);
alter table public.moderation_log enable row level security;
drop policy if exists "moderation_log: admin all" on public.moderation_log;
create policy "moderation_log: admin all" on public.moderation_log for all using (public.is_admin()) with check (public.is_admin() and actor_id = auth.uid());
grant select, insert on public.moderation_log to authenticated;
