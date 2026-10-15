-- KINEZIS LIVE · premium videos are protected at the storage layer, not only in the UI. Safe to run more than once.

-- Who may read a file in the private "videos" bucket:
--  staff: always; published free workouts/lessons/posts: everyone; premium: active premium plans only; drafts: staff only.
create or replace function public.can_read_video(object_name text)
returns boolean
language plpgsql
security definer set search_path = public
stable
as $body$
declare
  acc text;
  current_plan text;
  until timestamptz;
begin
  if public.is_staff() then
    return true;
  end if;

  select w.access into acc from public.workouts w
  where w.published and w.video ->> 'path' = object_name limit 1;

  if acc is null then
    select case when c.access = 'premium' or l.access = 'premium' then 'premium' else 'free' end into acc
    from public.lessons l
    join public.course_modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where c.published and l.video ->> 'path' = object_name limit 1;
  end if;

  if acc is null then
    if exists (
      select 1 from public.posts p
      where p.published and p.hidden = false and p.attachment -> 'source' ->> 'path' = object_name
    ) then
      return true;
    end if;
    return false;
  end if;

  if acc = 'free' then
    return true;
  end if;

  select p.plan, p.plan_until into current_plan, until from public.profiles p where p.id = auth.uid();
  return current_plan in ('premium', 'premium_plus') and (until is null or until > now());
end;
$body$;
grant execute on function public.can_read_video(text) to anon, authenticated;

drop policy if exists "videos: read" on storage.objects;
drop policy if exists "videos: read entitled" on storage.objects;
create policy "videos: read entitled" on storage.objects for select
  using (bucket_id = 'videos' and public.can_read_video(name));
