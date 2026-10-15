-- KINEZIS LIVE · likes and comments. Safe to run more than once.

-- Public, privacy-respecting view of profiles for showing who liked or commented.
-- Owner is postgres, so it bypasses the owner-only RLS on profiles on purpose and exposes only safe fields.
create or replace view public.public_profiles as
  select
    p.id,
    case when coalesce((p.privacy ->> 'profileVisible')::boolean, true) then p.display_name else null end as display_name,
    case when coalesce((p.privacy ->> 'profileVisible')::boolean, true) then p.avatar_src else null end as avatar_src,
    p.role
  from public.profiles p;
grant select on public.public_profiles to anon, authenticated;

create table if not exists public.reactions (
  user_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'workout', 'course', 'meal')),
  target_id text not null,
  kind text not null default 'like' check (kind in ('like')),
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id, kind)
);
create index if not exists reactions_target on public.reactions (target_type, target_id);
alter table public.reactions enable row level security;
drop policy if exists "reactions: read" on public.reactions;
drop policy if exists "reactions: own insert" on public.reactions;
drop policy if exists "reactions: own delete" on public.reactions;
create policy "reactions: read" on public.reactions for select using (true);
create policy "reactions: own insert" on public.reactions for insert with check (auth.uid() = user_id);
create policy "reactions: own delete" on public.reactions for delete using (auth.uid() = user_id);
grant select on public.reactions to anon, authenticated;
grant insert, delete on public.reactions to authenticated;

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_type text not null check (target_type in ('post', 'workout')),
  target_id text not null,
  body text not null check (char_length(body) between 1 and 1000),
  hidden boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists comments_target on public.comments (target_type, target_id, created_at);
alter table public.comments enable row level security;
drop policy if exists "comments: read visible" on public.comments;
drop policy if exists "comments: own insert" on public.comments;
drop policy if exists "comments: own update" on public.comments;
drop policy if exists "comments: staff update" on public.comments;
drop policy if exists "comments: own or staff delete" on public.comments;
create policy "comments: read visible" on public.comments for select using (hidden = false or auth.uid() = user_id or public.is_staff());
create policy "comments: own insert" on public.comments for insert with check (auth.uid() = user_id);
create policy "comments: own update" on public.comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id and hidden = false);
create policy "comments: staff update" on public.comments for update using (public.is_staff()) with check (public.is_staff());
create policy "comments: own or staff delete" on public.comments for delete using (auth.uid() = user_id or public.is_staff());
grant select on public.comments to anon, authenticated;
grant insert, update, delete on public.comments to authenticated;
drop trigger if exists comments_touch on public.comments;
create trigger comments_touch before update on public.comments for each row execute function public.touch_updated_at();

-- Aggregates readable by everyone
create or replace view public.reaction_counts as
  select target_type, target_id, count(*)::int as likes from public.reactions where kind = 'like' group by target_type, target_id;
grant select on public.reaction_counts to anon, authenticated;

create or replace view public.comment_counts as
  select target_type, target_id, count(*)::int as comments from public.comments where hidden = false group by target_type, target_id;
grant select on public.comment_counts to anon, authenticated;
