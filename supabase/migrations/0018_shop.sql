-- Shop: curated equipment for home practice. Items link out to a partner/supplier page (dropshipping or
-- affiliate) until direct payments exist. Only admins add items; everyone reads published ones.
create table if not exists public.shop_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category text not null check (category in ('mats', 'props', 'bands', 'balance', 'weights', 'recovery', 'suspension', 'accessories')),
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  image_src text,
  price numeric(10, 2) check (price is null or price >= 0),
  currency text not null default 'UAH' check (currency in ('UAH', 'EUR', 'USD', 'PLN', 'GBP')),
  purchase_url text check (purchase_url is null or purchase_url ~ '^https://'),
  partner text,
  featured boolean not null default false,
  position integer not null default 0,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists shop_items_category on public.shop_items (category, position);
alter table public.shop_items enable row level security;
drop policy if exists "shop_items: read published" on public.shop_items;
drop policy if exists "shop_items: admin all" on public.shop_items;
create policy "shop_items: read published" on public.shop_items for select using (published = true or public.is_admin());
create policy "shop_items: admin all" on public.shop_items for all using (public.is_admin()) with check (public.is_admin());
grant select on public.shop_items to anon, authenticated;
grant insert, update, delete on public.shop_items to authenticated;
drop trigger if exists shop_items_touch on public.shop_items;
create trigger shop_items_touch before update on public.shop_items for each row execute function public.touch_updated_at();
