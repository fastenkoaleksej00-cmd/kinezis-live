-- Shop, step 2: collections (fast delivery, finds, coming soon) and offers per store and delivery country.
-- One product can have several offers (Amazon DE, AliExpress, a local supplier...), each with its own
-- affiliate link, price and the store's stated delivery window. Admin-only writes; public reads.
alter table public.shop_items add column if not exists collections text[] not null default '{}';
alter table public.shop_items drop constraint if exists shop_items_collections_check;
alter table public.shop_items add constraint shop_items_collections_check check (collections <@ array['fast', 'deals', 'soon']::text[]);

create table if not exists public.shop_offers (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references public.shop_items (id) on delete cascade,
  source text not null check (source in ('amazon', 'temu', 'aliexpress', 'rozetka', 'prom', 'partner')),
  store_name text,
  -- ISO 3166-1 alpha-2 codes the store ships this offer to; empty = not specified (shown with "check delivery")
  countries text[] not null default '{}',
  url text not null check (url ~ '^https://'),
  price numeric(10, 2) check (price is null or price >= 0),
  currency text not null default 'EUR' check (currency in ('UAH', 'EUR', 'USD', 'PLN', 'GBP')),
  delivery_min_days integer check (delivery_min_days is null or delivery_min_days between 0 and 120),
  delivery_max_days integer check (delivery_max_days is null or delivery_max_days between 0 and 120),
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists shop_offers_item on public.shop_offers (item_id, position);
alter table public.shop_offers enable row level security;
drop policy if exists "shop_offers: read published" on public.shop_offers;
drop policy if exists "shop_offers: admin all" on public.shop_offers;
create policy "shop_offers: read published" on public.shop_offers for select
  using (exists (select 1 from public.shop_items i where i.id = item_id and (i.published or public.is_admin())));
create policy "shop_offers: admin all" on public.shop_offers for all using (public.is_admin()) with check (public.is_admin());
grant select on public.shop_offers to anon, authenticated;
grant insert, update, delete on public.shop_offers to authenticated;
