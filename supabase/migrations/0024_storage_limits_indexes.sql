-- 0024: storage ownership (a trainer manages only own files), anti-abuse limits for reports and chat,
-- and indexes for the most frequent queries. Depends on 0005, 0010, 0016, 0021. Safe to re-run.

-- Part 1: storage ownership
drop policy if exists "covers: staff update" on storage.objects;
drop policy if exists "covers: staff delete" on storage.objects;
drop policy if exists "covers: owner or admin update" on storage.objects;
drop policy if exists "covers: owner or admin delete" on storage.objects;
create policy "covers: owner or admin update" on storage.objects for update
  using (bucket_id = 'covers' and (owner = auth.uid() or public.is_admin()));
create policy "covers: owner or admin delete" on storage.objects for delete
  using (bucket_id = 'covers' and (owner = auth.uid() or public.is_admin()));

drop policy if exists "videos: staff update" on storage.objects;
drop policy if exists "videos: staff delete" on storage.objects;
drop policy if exists "videos: owner or admin update" on storage.objects;
drop policy if exists "videos: owner or admin delete" on storage.objects;
create policy "videos: owner or admin update" on storage.objects for update
  using (bucket_id = 'videos' and (owner = auth.uid() or public.is_admin()));
create policy "videos: owner or admin delete" on storage.objects for delete
  using (bucket_id = 'videos' and (owner = auth.uid() or public.is_admin()));


-- Part 2: rate limits
create or replace function public.reports_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $body$
declare
  recent int;
begin
  if public.is_admin() then
    return new;
  end if;
  select count(*) into recent from public.content_reports r where r.reporter_id = new.reporter_id and r.created_at > now() - interval '1 hour';
  if recent >= 10 then
    raise exception 'rate_limit';
  end if;
  return new;
end;
$body$;
drop trigger if exists reports_rate_limit on public.content_reports;
create trigger reports_rate_limit before insert on public.content_reports for each row execute function public.reports_rate_limit();

create or replace function public.messages_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $body$
declare
  recent int;
begin
  if public.is_admin() or new.from_staff then
    return new;
  end if;
  select count(*) into recent from public.messages m where m.sender_id = new.sender_id and m.created_at > now() - interval '10 minutes';
  if recent >= 30 then
    raise exception 'rate_limit';
  end if;
  return new;
end;
$body$;
drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit before insert on public.messages for each row execute function public.messages_rate_limit();

-- Part 3: indexes
create index if not exists workouts_public_idx on public.workouts (published_at desc) where published and review_status = 'approved';
create index if not exists courses_public_idx on public.courses (published_at desc) where published and review_status = 'approved';
create index if not exists workouts_author_idx on public.workouts (author_id);
create index if not exists posts_feed_idx on public.posts (published_at desc) where published and not hidden;
create index if not exists posts_user_time_idx on public.posts (user_id, created_at desc) where user_id is not null;
create index if not exists posts_review_idx on public.posts (created_at desc) where needs_review;
create index if not exists comments_user_time_idx on public.comments (user_id, created_at desc);
create index if not exists reports_reporter_time_idx on public.content_reports (reporter_id, created_at desc);
create index if not exists messages_sender_time_idx on public.messages (sender_id, created_at desc);
create index if not exists lessons_workout_idx on public.lessons (workout_id) where workout_id is not null;
