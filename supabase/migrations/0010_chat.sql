-- KINEZIS LIVE · private chat between a member and the trainer. Safe to run more than once.

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  author_id text references public.authors (id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz,
  last_read_by_user_at timestamptz,
  last_read_by_staff_at timestamptz
);
alter table public.conversations enable row level security;
drop policy if exists "conversations: own or staff read" on public.conversations;
drop policy if exists "conversations: own insert" on public.conversations;
drop policy if exists "conversations: own or staff update" on public.conversations;
create policy "conversations: own or staff read" on public.conversations for select using (auth.uid() = user_id or public.is_staff());
create policy "conversations: own insert" on public.conversations for insert with check (auth.uid() = user_id);
create policy "conversations: own or staff update" on public.conversations for update using (auth.uid() = user_id or public.is_staff()) with check (auth.uid() = user_id or public.is_staff());
grant select, insert, update on public.conversations to authenticated;

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  from_staff boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists messages_conversation_time on public.messages (conversation_id, created_at);
alter table public.messages enable row level security;
drop policy if exists "messages: participants read" on public.messages;
drop policy if exists "messages: participants insert" on public.messages;
create policy "messages: participants read" on public.messages for select
  using (public.is_staff() or exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()));
create policy "messages: participants insert" on public.messages for insert
  with check (
    auth.uid() = sender_id
    and (
      (public.is_staff() and from_staff = true)
      or (from_staff = false and exists (select 1 from public.conversations c where c.id = conversation_id and c.user_id = auth.uid()))
    )
  );
grant select, insert on public.messages to authenticated;

-- Keep last_message_at fresh
create or replace function public.touch_conversation()
returns trigger
language plpgsql
security definer set search_path = public
as $body$
begin
  update public.conversations set last_message_at = new.created_at where id = new.conversation_id;
  return new;
end;
$body$;
drop trigger if exists messages_touch_conversation on public.messages;
create trigger messages_touch_conversation after insert on public.messages for each row execute function public.touch_conversation();

-- Live updates
do $body$ begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'messages') then
    alter publication supabase_realtime add table public.messages;
  end if;
end $body$;
