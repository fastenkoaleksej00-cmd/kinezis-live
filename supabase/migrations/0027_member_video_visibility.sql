-- 0027: member videos are readable only while their post is visible (S9).
-- Before: any signed-in or anonymous client could sign a URL for any file in `member-videos`,
-- so a post hidden by a moderator still played by direct link.
-- After: reading needs a post that points at this file and is not hidden;
-- the author and staff (moderation) can still read it. Safe to run more than once.

create or replace function public.can_read_member_video(obj_name text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.posts p
    where p.attachment -> 'source' ->> 'bucket' = 'member-videos'
      and p.attachment -> 'source' ->> 'path' = obj_name
      and (coalesce(p.hidden, false) = false or p.user_id = auth.uid() or public.is_staff())
  )
  -- the owner can always read files in their own folder (e.g. right after upload, before the post exists)
  or (storage.foldername(obj_name))[1] = auth.uid()::text;
$$;

grant execute on function public.can_read_member_video(text) to anon, authenticated;

drop policy if exists "member-videos: read" on storage.objects;
drop policy if exists "member-videos: read visible" on storage.objects;
create policy "member-videos: read visible" on storage.objects
  for select using (bucket_id = 'member-videos' and public.can_read_member_video(name));
