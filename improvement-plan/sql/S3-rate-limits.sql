-- PROPOSED, NOT APPLIED. Purpose: anti-abuse limits for reports and chat, same pattern as 0021.
-- Depends on: 0010 (messages), 0016 (content_reports, is_admin).
create or replace function public.reports_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $body$
declare
  recent int;
begin
  if public.is_admin() then
    return new;
  end if;
  select count(*) into recent from public.content_reports r where r.reporter_id = new.reporter_id and r.created_at > now() - interval '1 hour';
  if recent >= 10 then
    raise exception 'rate_limit';
  end if;
  return new;
end;
$body$;
drop trigger if exists reports_rate_limit on public.content_reports;
create trigger reports_rate_limit before insert on public.content_reports for each row execute function public.reports_rate_limit();

create or replace function public.messages_rate_limit()
returns trigger language plpgsql security definer set search_path = public as $body$
declare
  recent int;
begin
  if public.is_admin() or new.from_staff then
    return new;
  end if;
  select count(*) into recent from public.messages m where m.sender_id = new.sender_id and m.created_at > now() - interval '10 minutes';
  if recent >= 30 then
    raise exception 'rate_limit';
  end if;
  return new;
end;
$body$;
drop trigger if exists messages_rate_limit on public.messages;
create trigger messages_rate_limit before insert on public.messages for each row execute function public.messages_rate_limit();
