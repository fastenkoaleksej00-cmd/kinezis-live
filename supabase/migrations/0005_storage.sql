-- KINEZIS LIVE · stage 7a: video and cover storage. Safe to run more than once.
-- Free plan limits: 1 GB storage, 2 GB egress per month, 50 MB per file.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('videos', 'videos', false, 52428800, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('covers', 'covers', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "videos: read" on storage.objects;
drop policy if exists "videos: staff insert" on storage.objects;
drop policy if exists "videos: staff update" on storage.objects;
drop policy if exists "videos: staff delete" on storage.objects;
drop policy if exists "covers: read" on storage.objects;
drop policy if exists "covers: staff insert" on storage.objects;
drop policy if exists "covers: staff update" on storage.objects;
drop policy if exists "covers: staff delete" on storage.objects;

-- Playback goes through short-lived signed URLs; premium gating is added with the subscription stage
create policy "videos: read" on storage.objects for select using (bucket_id = 'videos');
create policy "videos: staff insert" on storage.objects for insert with check (bucket_id = 'videos' and public.is_staff());
create policy "videos: staff update" on storage.objects for update using (bucket_id = 'videos' and public.is_staff());
create policy "videos: staff delete" on storage.objects for delete using (bucket_id = 'videos' and public.is_staff());

create policy "covers: read" on storage.objects for select using (bucket_id = 'covers');
create policy "covers: staff insert" on storage.objects for insert with check (bucket_id = 'covers' and public.is_staff());
create policy "covers: staff update" on storage.objects for update using (bucket_id = 'covers' and public.is_staff());
create policy "covers: staff delete" on storage.objects for delete using (bucket_id = 'covers' and public.is_staff());
