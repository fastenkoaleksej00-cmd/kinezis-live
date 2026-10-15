-- Multi-trainer platform: admin vs trainer rights, authorship ownership, trainer applications,
-- content review status, reports, extra workout metadata, programmes.
-- Idempotent. Existing data is kept: all current content is marked approved.

-- ---------------------------------------------------------------------------
-- Roles
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $body$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$body$;

-- Author status must exist before the function below is validated
alter table public.authors add column if not exists status text not null default 'active' check (status in ('active', 'suspended'));

-- The author row owned by the current user (null for members and for admins without an author row)
create or replace function public.my_author_id()
returns text
language sql
security definer set search_path = public
stable
as $body$
  select a.id from public.authors a where a.user_id = auth.uid() and a.status = 'active' limit 1;
$body$;

-- ---------------------------------------------------------------------------
-- Authors: status, qualifications, cover palette
alter table public.authors add column if not exists qualifications text;
alter table public.authors add column if not exists experience_years integer check (experience_years is null or (experience_years >= 0 and experience_years <= 70));
alter table public.authors add column if not exists links text[] not null default '{}';
alter table public.authors add column if not exists cover_preset text not null default 'midnight';
create unique index if not exists authors_user_id_unique on public.authors (user_id) where user_id is not null;

drop policy if exists "authors: staff write" on public.authors;
drop policy if exists "authors: admin all" on public.authors;
drop policy if exists "authors: own update" on public.authors;
create policy "authors: admin all" on public.authors for all using (public.is_admin()) with check (public.is_admin());
-- A trainer edits only their own card and can never flip verified/status/user_id (enforced by trigger below)
create policy "authors: own update" on public.authors for update using (user_id = auth.uid()) with check (user_id = auth.uid());

create or replace function public.authors_guard()
returns trigger
language plpgsql
security definer set search_path = public
as $body$
begin
  if not public.is_admin() then
    new.verified := old.verified;
    new.status := old.status;
    new.user_id := old.user_id;
    new.id := old.id;
    new.role := old.role;
  end if;
  return new;
end;
$body$;
drop trigger if exists authors_guard on public.authors;
create trigger authors_guard before update on public.authors for each row execute function public.authors_guard();

-- ---------------------------------------------------------------------------
-- Workouts: review status, equipment, body regions, safety notes
alter table public.workouts add column if not exists review_status text not null default 'approved' check (review_status in ('draft', 'pending', 'approved', 'rejected'));
alter table public.workouts add column if not exists review_note text;
alter table public.workouts add column if not exists equipment text[] not null default '{}';
alter table public.workouts add column if not exists body_regions text[] not null default '{}';
alter table public.workouts add column if not exists safety jsonb;

drop policy if exists "workouts: public read published" on public.workouts;
drop policy if exists "workouts: staff all" on public.workouts;
drop policy if exists "workouts: read" on public.workouts;
drop policy if exists "workouts: admin all" on public.workouts;
drop policy if exists "workouts: own trainer" on public.workouts;
create policy "workouts: read" on public.workouts for select
  using ((published = true and review_status = 'approved') or public.is_admin() or (author_id is not null and author_id = public.my_author_id()));
create policy "workouts: admin all" on public.workouts for all using (public.is_admin()) with check (public.is_admin());
create policy "workouts: own trainer" on public.workouts for all
  using (author_id is not null and author_id = public.my_author_id())
  with check (author_id is not null and author_id = public.my_author_id());

-- Trainers cannot self-approve: anything they publish waits for review
create or replace function public.review_guard()
returns trigger
language plpgsql
security definer set search_path = public
as $body$
begin
  if not public.is_admin() then
    if tg_op = 'INSERT' then
      if new.review_status in ('approved', 'rejected') then new.review_status := 'pending'; end if;
      new.review_note := null;
    else
      if new.review_status is distinct from old.review_status and new.review_status in ('approved', 'rejected') then
        new.review_status := case when old.review_status = 'approved' then 'approved' else 'pending' end;
      end if;
      -- A rejected item edited by its author goes back to the queue
      if old.review_status = 'rejected' and new.review_status = 'rejected' and new.published then new.review_status := 'pending'; end if;
      new.review_note := old.review_note;
    end if;
  end if;
  return new;
end;
$body$;
drop trigger if exists workouts_review_guard on public.workouts;
create trigger workouts_review_guard before insert or update on public.workouts for each row execute function public.review_guard();

-- ---------------------------------------------------------------------------
-- Courses and programmes
alter table public.courses add column if not exists review_status text not null default 'approved' check (review_status in ('draft', 'pending', 'approved', 'rejected'));
alter table public.courses add column if not exists review_note text;
alter table public.courses add column if not exists kind text not null default 'course' check (kind in ('course', 'program'));
alter table public.lessons add column if not exists workout_id uuid references public.workouts (id) on delete set null;

drop policy if exists "courses: public read published" on public.courses;
drop policy if exists "courses: staff all" on public.courses;
drop policy if exists "courses: read" on public.courses;
drop policy if exists "courses: admin all" on public.courses;
drop policy if exists "courses: own trainer" on public.courses;
create policy "courses: read" on public.courses for select
  using ((published = true and review_status = 'approved') or public.is_admin() or (author_id is not null and author_id = public.my_author_id()));
create policy "courses: admin all" on public.courses for all using (public.is_admin()) with check (public.is_admin());
create policy "courses: own trainer" on public.courses for all
  using (author_id is not null and author_id = public.my_author_id())
  with check (author_id is not null and author_id = public.my_author_id());
drop trigger if exists courses_review_guard on public.courses;
create trigger courses_review_guard before insert or update on public.courses for each row execute function public.review_guard();

create or replace function public.course_owned(cid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $body$
  select exists (select 1 from public.courses c where c.id = cid and c.author_id is not null and c.author_id = public.my_author_id());
$body$;

drop policy if exists "course_modules: staff all" on public.course_modules;
drop policy if exists "course_modules: admin all" on public.course_modules;
drop policy if exists "course_modules: own trainer" on public.course_modules;
create policy "course_modules: admin all" on public.course_modules for all using (public.is_admin()) with check (public.is_admin());
create policy "course_modules: own trainer" on public.course_modules for all using (public.course_owned(course_id)) with check (public.course_owned(course_id));

create or replace function public.module_owned(mid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $body$
  select exists (select 1 from public.course_modules m where m.id = mid and public.course_owned(m.course_id));
$body$;
drop policy if exists "lessons: staff all" on public.lessons;
drop policy if exists "lessons: admin all" on public.lessons;
drop policy if exists "lessons: own trainer" on public.lessons;
create policy "lessons: admin all" on public.lessons for all using (public.is_admin()) with check (public.is_admin());
create policy "lessons: own trainer" on public.lessons for all using (public.module_owned(module_id)) with check (public.module_owned(module_id));

-- ---------------------------------------------------------------------------
-- Trainer posts: own author only; members' own posts untouched
drop policy if exists "posts: staff all" on public.posts;
drop policy if exists "posts: admin all" on public.posts;
drop policy if exists "posts: own trainer" on public.posts;
create policy "posts: admin all" on public.posts for all using (public.is_admin()) with check (public.is_admin());
create policy "posts: own trainer" on public.posts for all
  using (author_id is not null and author_id = public.my_author_id())
  with check (author_id is not null and author_id = public.my_author_id());

-- Brand sections (skincare, nutrition) and comment moderation are admin-only from now on
drop policy if exists "skin_routines: staff all" on public.skin_routines;
drop policy if exists "skin_articles: staff all" on public.skin_articles;
drop policy if exists "products: staff all" on public.products;
drop policy if exists "skin_routines: admin all" on public.skin_routines;
drop policy if exists "skin_articles: admin all" on public.skin_articles;
drop policy if exists "products: admin all" on public.products;
create policy "skin_routines: admin all" on public.skin_routines for all using (public.is_admin()) with check (public.is_admin());
create policy "skin_articles: admin all" on public.skin_articles for all using (public.is_admin()) with check (public.is_admin());
create policy "products: admin all" on public.products for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "meal_plans: staff all" on public.meal_plans;
drop policy if exists "meal_plans: admin all" on public.meal_plans;
create policy "meal_plans: admin all" on public.meal_plans for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "comments: staff update" on public.comments;
drop policy if exists "comments: admin update" on public.comments;
create policy "comments: admin update" on public.comments for update using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Trainer applications
create table if not exists public.trainer_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  full_name text not null default '',
  photo_src text,
  specialties text[] not null default '{}',
  bio text not null default '',
  qualifications text not null default '',
  experience_years integer check (experience_years is null or (experience_years >= 0 and experience_years <= 70)),
  links text[] not null default '{}',
  documents text[] not null default '{}',
  consent boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'submitted', 'review', 'approved', 'rejected')),
  admin_note text,
  submitted_at timestamptz,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.trainer_applications enable row level security;
drop policy if exists "applications: own read" on public.trainer_applications;
drop policy if exists "applications: own insert" on public.trainer_applications;
drop policy if exists "applications: own update" on public.trainer_applications;
drop policy if exists "applications: admin all" on public.trainer_applications;
create policy "applications: own read" on public.trainer_applications for select using (auth.uid() = user_id);
create policy "applications: own insert" on public.trainer_applications for insert with check (auth.uid() = user_id and status in ('draft', 'submitted'));
-- Applicants edit drafts and rejected ones; once submitted it waits for the admin
create policy "applications: own update" on public.trainer_applications for update
  using (auth.uid() = user_id and status in ('draft', 'rejected'))
  with check (auth.uid() = user_id and status in ('draft', 'submitted'));
create policy "applications: admin all" on public.trainer_applications for all using (public.is_admin()) with check (public.is_admin());
grant select, insert, update on public.trainer_applications to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $body$
begin new.updated_at := now(); return new; end;
$body$;
drop trigger if exists trainer_applications_touch on public.trainer_applications;
create trigger trainer_applications_touch before update on public.trainer_applications for each row execute function public.touch_updated_at();

-- Private bucket for qualification documents: owner writes in their own folder, owner and admin read
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trainer-docs', 'trainer-docs', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do nothing;
drop policy if exists "trainer-docs: own or admin read" on storage.objects;
drop policy if exists "trainer-docs: own insert" on storage.objects;
drop policy if exists "trainer-docs: own delete" on storage.objects;
create policy "trainer-docs: own or admin read" on storage.objects for select
  using (bucket_id = 'trainer-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
create policy "trainer-docs: own insert" on storage.objects for insert
  with check (bucket_id = 'trainer-docs' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "trainer-docs: own delete" on storage.objects for delete
  using (bucket_id = 'trainer-docs' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- Approval creates the author card and grants the trainer role; only admins can call it
create or replace function public.approve_trainer_application(app_id uuid, author_slug text)
returns text
language plpgsql
security definer set search_path = public
as $body$
declare
  app public.trainer_applications%rowtype;
  slug text := lower(regexp_replace(coalesce(author_slug, ''), '[^a-z0-9-]+', '-', 'g'));
  existing text;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  select * into app from public.trainer_applications where id = app_id;
  if app.id is null then raise exception 'not found'; end if;
  select id into existing from public.authors where user_id = app.user_id;
  if existing is null then
    if slug = '' or slug is null then slug := 'trainer-' || left(replace(app.user_id::text, '-', ''), 8); end if;
    if exists (select 1 from public.authors where id = slug) then slug := slug || '-' || left(replace(app.user_id::text, '-', ''), 4); end if;
    insert into public.authors (id, user_id, name, role, bio, specialties, avatar_src, qualifications, experience_years, links, status)
    values (slug, app.user_id, coalesce(nullif(app.full_name, ''), 'Trainer'), 'trainer', jsonb_build_object('en', app.bio), app.specialties, app.photo_src, app.qualifications, app.experience_years, app.links, 'active');
    existing := slug;
  else
    update public.authors set status = 'active' where id = existing;
  end if;
  update public.profiles set role = 'trainer' where id = app.user_id and role = 'user';
  update public.trainer_applications set status = 'approved', decided_at = now() where id = app_id;
  return existing;
end;
$body$;

create or replace function public.reject_trainer_application(app_id uuid, note text)
returns void
language plpgsql
security definer set search_path = public
as $body$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  update public.trainer_applications set status = 'rejected', admin_note = left(coalesce(note, ''), 1000), decided_at = now() where id = app_id;
end;
$body$;

-- Suspend/activate publishing for a trainer (keeps their account and content; suspended authors cannot write)
create or replace function public.set_author_status(aid text, new_status text)
returns void
language plpgsql
security definer set search_path = public
as $body$
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  if new_status not in ('active', 'suspended') then raise exception 'bad status'; end if;
  update public.authors set status = new_status where id = aid;
end;
$body$;

-- ---------------------------------------------------------------------------
-- Reports from members
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('workout', 'post', 'course', 'trainer', 'comment')),
  target_id text not null,
  reason text not null check (reason in ('unsafe', 'medical', 'misleading', 'inappropriate', 'copyright', 'other')),
  details text,
  status text not null default 'open' check (status in ('open', 'resolved', 'dismissed')),
  resolution text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);
create index if not exists content_reports_status on public.content_reports (status, created_at desc);
alter table public.content_reports enable row level security;
drop policy if exists "reports: own insert" on public.content_reports;
drop policy if exists "reports: own read" on public.content_reports;
drop policy if exists "reports: admin all" on public.content_reports;
create policy "reports: own insert" on public.content_reports for insert with check (auth.uid() = reporter_id);
create policy "reports: own read" on public.content_reports for select using (auth.uid() = reporter_id);
create policy "reports: admin all" on public.content_reports for all using (public.is_admin()) with check (public.is_admin());
grant select, insert on public.content_reports to authenticated;
grant update on public.content_reports to authenticated;

-- ---------------------------------------------------------------------------
-- Trainer statistics from members' own logs, aggregated only (no per-user rows leave the table)
create or replace function public.author_stats(aid text)
returns table (completions bigint, likes bigint, published bigint)
language sql
security definer set search_path = public
stable
as $body$
  select
    (select count(*) from public.activity_log l join public.workouts w on w.id::text = l.item_id where w.author_id = aid and l.item_type = 'workout'),
    (select count(*) from public.reactions r join public.workouts w on w.id::text = r.target_id where w.author_id = aid and r.target_type = 'workout'),
    (select count(*) from public.workouts w where w.author_id = aid and w.published and w.review_status = 'approved')
  where public.is_admin() or aid = public.my_author_id();
$body$;
