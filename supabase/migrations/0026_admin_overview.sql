-- 0026: platform overview for the admin home (aggregates only, no personal rows leave the database).
-- Depends on 0016 (is_admin), 0009 (comments), 0016 (content_reports). Safe to re-run.
create or replace function public.admin_overview()
returns table (members bigint, new_7d bigint, active_7d bigint, posts_7d bigint, open_reports bigint, pending_review bigint)
language sql
security definer set search_path = public
stable
as $body$
  select
    (select count(*) from auth.users),
    (select count(*) from auth.users u where u.created_at > now() - interval '7 days'),
    (select count(distinct l.user_id) from public.activity_log l where l.completed_at > now() - interval '7 days'),
    (select count(*) from public.posts p where p.user_id is not null and p.created_at > now() - interval '7 days'),
    (select count(*) from public.content_reports r where r.status = 'open'),
    (select count(*) from public.workouts w where w.review_status = 'pending') + (select count(*) from public.courses c where c.review_status = 'pending')
  where public.is_admin();
$body$;
grant execute on function public.admin_overview() to authenticated;
