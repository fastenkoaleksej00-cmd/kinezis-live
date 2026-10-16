-- Trainer booking: a link to the trainer's own calendar (Cal.com, Calendly, Google booking page...).
-- No payments or scheduling inside the app yet; the member books on the trainer's page.
alter table public.authors add column if not exists booking_url text;
alter table public.authors drop constraint if exists authors_booking_url_check;
alter table public.authors add constraint authors_booking_url_check check (booking_url is null or booking_url ~ '^https://');
