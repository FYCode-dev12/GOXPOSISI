create extension if not exists pgcrypto;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  kitab text not null,
  pasal integer not null check (pasal > 0),
  title text not null,
  summary text,
  tags jsonb not null default '[]'::jsonb check (jsonb_typeof(tags) = 'array'),
  author text not null,
  date date not null,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kitab, pasal)
);

alter table public.articles enable row level security;

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles" on public.articles
  for select using (status = 'published');

drop policy if exists "Admins can manage articles" on public.articles;
create policy "Admins can manage articles" on public.articles
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create index if not exists articles_status_kitab_pasal_idx on public.articles(status, kitab, pasal);

create or replace function public.set_articles_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists articles_updated_at on public.articles;
create trigger articles_updated_at before update on public.articles
for each row execute function public.set_articles_updated_at();

-- Set admin role via Supabase dashboard or server-side admin tooling:
-- update auth.users set raw_app_meta_data = raw_app_meta_data || '{"role":"admin"}'::jsonb where email = 'admin@example.com';
