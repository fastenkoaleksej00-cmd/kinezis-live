-- KINEZIS LIVE · community posts by members. Safe to run more than once.

alter table public.posts add column if not exists user_id uuid references auth.users (id) on delete cascade;
alter table public.posts add column if not exists hidden boolean not null default false;
alter table public.posts add column if not exists category text;
create index if not exists posts_user on public.posts (user_id);

drop policy if exists "posts: public read published" on public.posts;
drop policy if exists "posts: staff all" on public.posts;
drop policy if exists "posts: member insert" on public.posts;
drop policy if exists "posts: own update" on public.posts;
drop policy if exists "posts: own delete" on public.posts;

create policy "posts: public read published" on public.posts for select
  using ((published = true and hidden = false) or public.is_staff() or auth.uid() = user_id);
create policy "posts: staff all" on public.posts for all using (public.is_staff()) with check (public.is_staff());
-- Members publish as themselves: no trainer author, always visible, never premium-gated
create policy "posts: member insert" on public.posts for insert
  with check (auth.uid() = user_id and author_id is null and access = 'free');
create policy "posts: own update" on public.posts for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id and author_id is null and hidden = false);
create policy "posts: own delete" on public.posts for delete using (auth.uid() = user_id);

-- Public profile extras (bio, interests, banner) only when the member allows it; activity counts only when shared.
create or replace function public.public_profile_extras(target uuid)
returns table (bio text, interests text[], banner_src text, banner_preset text, banner_position integer, show_activity boolean, visible boolean, sessions integer)
language sql
security definer set search_path = public
stable
as $body$
  select
    case when coalesce((p.privacy ->> 'profileVisible')::boolean, true) then p.bio else null end,
    case when coalesce((p.privacy ->> 'profileVisible')::boolean, true) then p.interests else '{}'::text[] end,
    case when coalesce((p.privacy ->> 'profileVisible')::boolean, true) then p.banner_src else null end,
    p.banner_preset,
    p.banner_position,
    coalesce((p.privacy ->> 'showActivity')::boolean, false),
    coalesce((p.privacy ->> 'profileVisible')::boolean, true),
    case when coalesce((p.privacy ->> 'showActivity')::boolean, false) then (select count(*)::int from public.activity_log a where a.user_id = p.id) else 0 end
  from public.profiles p
  where p.id = target;
$body$;
grant execute on function public.public_profile_extras(uuid) to anon, authenticated;

-- Member videos: private bucket, each member writes inside their own folder; anyone may read via signed URL
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('member-videos', 'member-videos', false, 52428800, array['video/mp4', 'video/quicktime', 'video/webm'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;
drop policy if exists "member-videos: read" on storage.objects;
drop policy if exists "member-videos: own insert" on storage.objects;
drop policy if exists "member-videos: own delete" on storage.objects;
create policy "member-videos: read" on storage.objects for select using (bucket_id = 'member-videos');
create policy "member-videos: own insert" on storage.objects for insert with check (bucket_id = 'member-videos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "member-videos: own delete" on storage.objects for delete using (bucket_id = 'member-videos' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_staff()));
