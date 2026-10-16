-- Community, phase 1: topics, post types, tags, "checked by a specialist" endorsements, moderation flag,
-- full-text search and anti-spam rate limits. Builds on member posts (0011), likes and comments (0009),
-- reports (0016). Existing posts keep working; old member posts simply have no topic yet.
alter table public.posts add column if not exists topic text;
alter table public.posts drop constraint if exists posts_topic_check;
alter table public.posts add constraint posts_topic_check check (topic is null or topic in ('back', 'mobility', 'recovery', 'nutrition', 'breath', 'mind', 'face', 'general'));
alter table public.posts add column if not exists post_type text;
alter table public.posts drop constraint if exists posts_post_type_check;
alter table public.posts add constraint posts_post_type_check check (post_type is null or post_type in ('story', 'question', 'tip'));
alter table public.posts add column if not exists tags text[] not null default '{}';
alter table public.posts drop constraint if exists posts_tags_check;
alter table public.posts add constraint posts_tags_check check (cardinality(tags) <= 5);
alter table public.posts add column if not exists endorsed_by text references public.authors (id) on delete set null;
alter table public.posts add column if not exists endorsed_at timestamptz;
alter table public.posts add column if not exists needs_review boolean not null default false;
alter table public.posts add column if not exists review_reason text;

-- Search over title and body in every language ('simple' config: no stemming, works for ru/uk/de/en alike)
alter table public.posts add column if not exists search tsvector
  generated always as (
    to_tsvector('simple',
      coalesce(title ->> 'en', '') || ' ' || coalesce(title ->> 'ru', '') || ' ' || coalesce(title ->> 'uk', '') || ' ' ||
      coalesce(body ->> 'en', '') || ' ' || coalesce(body ->> 'ru', '') || ' ' || coalesce(body ->> 'uk', '') || ' ' || coalesce(body ->> 'de', ''))
  ) stored;
create index if not exists posts_search_idx on public.posts using gin (search);
create index if not exists posts_topic_idx on public.posts (topic, published_at desc) where user_id is not null;
create index if not exists posts_tags_idx on public.posts using gin (tags);

-- Guard: members cannot endorse themselves or clear a moderation flag; only the endorse function and admins can
create or replace function public.posts_member_guard()
returns trigger
language plpgsql
security definer set search_path = public
as $body$
begin
  if public.is_admin() then return new; end if;
  if tg_op = 'INSERT' then
    new.endorsed_by := null;
    new.endorsed_at := null;
    return new;
  end if;
  if coalesce(current_setting('kl.endorse', true), '') <> 'on' then
    new.endorsed_by := old.endorsed_by;
    new.endorsed_at := old.endorsed_at;
  end if;
  if old.needs_review and not new.needs_review then
    new.needs_review := true;
    new.review_reason := old.review_reason;
  end if;
  return new;
end;
$body$;
drop trigger if exists posts_member_guard on public.posts;
create trigger posts_member_guard before insert or update on public.posts for each row execute function public.posts_member_guard();

-- Verified, active trainers mark a member post as checked (or remove their mark)
create or replace function public.endorse_post(pid uuid, on_off boolean)
returns boolean
language plpgsql
security definer set search_path = public
as $body$
declare
  aid text;
begin
  select a.id into aid from public.authors a where a.user_id = auth.uid() and a.status = 'active' and a.verified;
  if aid is null then return false; end if;
  perform set_config('kl.endorse', 'on', true);
  update public.posts
    set endorsed_by = case when on_off then aid else null end,
        endorsed_at = case when on_off then now() else null end
    where id = pid and user_id is not null and (on_off or endorsed_by = aid);
  return found;
end;
$body$;
grant execute on function public.endorse_post(uuid, boolean) to authenticated;

-- Anti-spam: members post at most 5 times an hour (2 in the first day, without links); comments at most 20 per 10 minutes
create or replace function public.posts_rate_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $body$
declare
  recent int;
  young boolean := false;
  max_posts int := 5;
begin
  if new.user_id is null or public.is_admin() then return new; end if;
  select coalesce(u.created_at > now() - interval '24 hours', false) into young from auth.users u where u.id = new.user_id;
  if young then
    max_posts := 2;
  end if;
  select count(*) into recent from public.posts p where p.user_id = new.user_id and p.created_at > now() - interval '1 hour';
  if recent >= max_posts then
    raise exception 'rate_limit';
  end if;
  if young and (new.body::text ~* 'https?://|www[.]') then
    raise exception 'links_new_account';
  end if;
  return new;
end;
$body$;
drop trigger if exists posts_rate_limit on public.posts;
create trigger posts_rate_limit before insert on public.posts for each row execute function public.posts_rate_limit();

create or replace function public.comments_rate_limit()
returns trigger
language plpgsql
security definer set search_path = public
as $body$
declare
  recent int;
begin
  if public.is_admin() then return new; end if;
  select count(*) into recent from public.comments c where c.user_id = new.user_id and c.created_at > now() - interval '10 minutes';
  if recent >= 20 then
    raise exception 'rate_limit';
  end if;
  return new;
end;
$body$;
drop trigger if exists comments_rate_limit on public.comments;
create trigger comments_rate_limit before insert on public.comments for each row execute function public.comments_rate_limit();
