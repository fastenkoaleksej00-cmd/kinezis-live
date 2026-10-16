-- PROPOSED, NOT APPLIED. Purpose: a trainer can only replace or delete files they uploaded; admins can manage all.
-- Depends on: 0005 (covers, videos buckets), 0016 (is_admin). Uploads stay open to staff as before.
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

-- Optional (S9): member videos readable only while the post using them is visible.
-- Requires that member posts keep the storage path in attachment->source->path (they do, see memberPublish).
-- create or replace function public.can_read_member_video(obj_name text) returns boolean language sql security definer set search_path = public stable as $body$
--   select exists (select 1 from public.posts p where p.attachment -> 'source' ->> 'path' = obj_name and (p.hidden = false or p.user_id = auth.uid() or public.is_admin()));
-- $body$;
-- drop policy if exists "member-videos: read" on storage.objects;
-- create policy "member-videos: read visible" on storage.objects for select using (bucket_id = 'member-videos' and public.can_read_member_video(name));
