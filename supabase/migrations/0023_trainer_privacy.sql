-- 0023: a trainer sees only conversations addressed to them and the profiles of those members; admins keep
-- full access. Before 0023 every approved trainer could read all member chats and profiles (is_staff()).
-- Depends on: 0002, 0010, 0016. Safe to re-run.

-- 0) Make sure the main trainer card is linked to the trainer account, otherwise she would lose her inbox.
--    Only when the card is unlinked and there is exactly one trainer account (the current set-up).
update public.authors a
set user_id = (select p.id from public.profiles p where p.role = 'trainer' limit 1)
where a.id = 'yuliia'
  and a.user_id is null
  and (select count(*) from public.profiles p where p.role = 'trainer') = 1
  and not exists (select 1 from public.authors x where x.user_id = (select p.id from public.profiles p where p.role = 'trainer' limit 1));

-- 1) Existing conversations belong to the main trainer
update public.conversations set author_id = 'yuliia'
where author_id is null and exists (select 1 from public.authors where id = 'yuliia');
alter table public.conversations alter column author_id set default 'yuliia';

create or replace function public.can_see_conversation(cid uuid)
returns boolean
language sql
security definer set search_path = public
stable
as $body$
  select exists (
    select 1 from public.conversations c
    where c.id = cid
      and (c.user_id = auth.uid() or public.is_admin() or (c.author_id is not null and c.author_id = public.my_author_id()))
  );
$body$;

-- 2) Conversations
drop policy if exists "conversations: own or staff read" on public.conversations;
drop policy if exists "conversations: own or staff update" on public.conversations;
drop policy if exists "conversations: participants read" on public.conversations;
drop policy if exists "conversations: participants update" on public.conversations;
create policy "conversations: participants read" on public.conversations for select
  using (auth.uid() = user_id or public.is_admin() or (author_id is not null and author_id = public.my_author_id()));
create policy "conversations: participants update" on public.conversations for update
  using (auth.uid() = user_id or public.is_admin() or (author_id is not null and author_id = public.my_author_id()))
  with check (auth.uid() = user_id or public.is_admin() or (author_id is not null and author_id = public.my_author_id()));

-- 3) Messages
drop policy if exists "messages: participants read" on public.messages;
drop policy if exists "messages: participants insert" on public.messages;
create policy "messages: participants read" on public.messages for select using (public.can_see_conversation(conversation_id));
create policy "messages: participants insert" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and public.can_see_conversation(conversation_id)
    and (
      (from_staff = true and (public.is_admin() or exists (select 1 from public.conversations c where c.id = conversation_id and c.author_id = public.my_author_id())))
      or (from_staff = false and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()))
    )
  );

-- 4) Profiles: admins read all; a trainer reads only members who write to them
drop policy if exists "profiles: staff read all" on public.profiles;
drop policy if exists "profiles: admin read all" on public.profiles;
drop policy if exists "profiles: trainer reads own chat members" on public.profiles;
create policy "profiles: admin read all" on public.profiles for select using (public.is_admin());
create policy "profiles: trainer reads own chat members" on public.profiles for select
  using (exists (select 1 from public.conversations c where c.user_id = profiles.id and c.author_id is not null and c.author_id = public.my_author_id()));
