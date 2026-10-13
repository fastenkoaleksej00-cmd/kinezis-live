-- KINEZIS LIVE · stage 6b: Face Fitness courses and Skincare content. Safe to run more than once.

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  description jsonb not null default '{}'::jsonb,
  cover_tone text not null default 'mint' check (cover_tone in ('deep','mint','light')),
  level text not null default 'beginner' check (level in ('beginner','intermediate','advanced')),
  access text not null default 'free' check (access in ('free','premium')),
  language text not null default 'uk',
  author_id text references public.authors (id) on delete set null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title jsonb not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.course_modules (id) on delete cascade,
  slug text not null,
  title jsonb not null,
  summary jsonb,
  duration_min integer,
  video jsonb,
  routine jsonb not null default '[]'::jsonb,
  recommendations jsonb,
  access text not null default 'free' check (access in ('free','premium')),
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table if not exists public.skin_routines (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  time_of_day text not null default 'morning' check (time_of_day in ('morning','evening','weekly')),
  steps jsonb not null default '[]'::jsonb,
  language text not null default 'uk',
  access text not null default 'free' check (access in ('free','premium')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.skin_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null,
  body jsonb not null,
  language text not null default 'uk',
  access text not null default 'free' check (access in ('free','premium')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  brand text not null default '',
  category text not null default 'other' check (category in ('cleanser','toner','serum','moisturizer','spf','mask','tool','other')),
  description jsonb not null default '{}'::jsonb,
  ingredients text[] not null default '{}',
  usage jsonb not null default '{}'::jsonb,
  purchase_url text,
  image_src text,
  language text not null default 'uk',
  access text not null default 'free' check (access in ('free','premium')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.skin_routines enable row level security;
alter table public.skin_articles enable row level security;
alter table public.products enable row level security;

drop policy if exists "courses: public read published" on public.courses;
drop policy if exists "courses: staff all" on public.courses;
drop policy if exists "course_modules: public read" on public.course_modules;
drop policy if exists "course_modules: staff all" on public.course_modules;
drop policy if exists "lessons: public read" on public.lessons;
drop policy if exists "lessons: staff all" on public.lessons;
drop policy if exists "skin_routines: public read published" on public.skin_routines;
drop policy if exists "skin_routines: staff all" on public.skin_routines;
drop policy if exists "skin_articles: public read published" on public.skin_articles;
drop policy if exists "skin_articles: staff all" on public.skin_articles;
drop policy if exists "products: public read published" on public.products;
drop policy if exists "products: staff all" on public.products;

create policy "courses: public read published" on public.courses for select using (published = true or public.is_staff());
create policy "courses: staff all" on public.courses for all using (public.is_staff()) with check (public.is_staff());

-- Modules and lessons are visible when their course is
create policy "course_modules: public read" on public.course_modules for select
  using (public.is_staff() or exists (select 1 from public.courses c where c.id = course_id and c.published));
create policy "course_modules: staff all" on public.course_modules for all using (public.is_staff()) with check (public.is_staff());

create policy "lessons: public read" on public.lessons for select
  using (public.is_staff() or exists (
    select 1 from public.course_modules m join public.courses c on c.id = m.course_id
    where m.id = module_id and c.published));
create policy "lessons: staff all" on public.lessons for all using (public.is_staff()) with check (public.is_staff());

create policy "skin_routines: public read published" on public.skin_routines for select using (published = true or public.is_staff());
create policy "skin_routines: staff all" on public.skin_routines for all using (public.is_staff()) with check (public.is_staff());
create policy "skin_articles: public read published" on public.skin_articles for select using (published = true or public.is_staff());
create policy "skin_articles: staff all" on public.skin_articles for all using (public.is_staff()) with check (public.is_staff());
create policy "products: public read published" on public.products for select using (published = true or public.is_staff());
create policy "products: staff all" on public.products for all using (public.is_staff()) with check (public.is_staff());

grant select on public.courses, public.course_modules, public.lessons, public.skin_routines, public.skin_articles, public.products to anon, authenticated;
grant insert, update, delete on public.courses, public.course_modules, public.lessons, public.skin_routines, public.skin_articles, public.products to authenticated;

drop trigger if exists courses_touch on public.courses;
drop trigger if exists lessons_touch on public.lessons;
drop trigger if exists skin_routines_touch on public.skin_routines;
drop trigger if exists skin_articles_touch on public.skin_articles;
drop trigger if exists products_touch on public.products;
create trigger courses_touch before update on public.courses for each row execute function public.touch_updated_at();
create trigger lessons_touch before update on public.lessons for each row execute function public.touch_updated_at();
create trigger skin_routines_touch before update on public.skin_routines for each row execute function public.touch_updated_at();
create trigger skin_articles_touch before update on public.skin_articles for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
