create table if not exists public.book_backgrounds (
  kitab text primary key,
  content text not null,
  updated_at timestamptz not null default now(),
  constraint book_backgrounds_content_not_empty check (length(trim(content)) > 0),
  constraint book_backgrounds_content_size check (length(content) <= 120000)
);

alter table public.book_backgrounds enable row level security;

drop policy if exists "Public can read book backgrounds" on public.book_backgrounds;
create policy "Public can read book backgrounds" on public.book_backgrounds
  for select using (true);

drop policy if exists "Admins can manage book backgrounds" on public.book_backgrounds;
create policy "Admins can manage book backgrounds" on public.book_backgrounds
  for all to authenticated
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

create or replace function public.set_book_backgrounds_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new;
end;
$$;

drop trigger if exists book_backgrounds_updated_at on public.book_backgrounds;
create trigger book_backgrounds_updated_at before update on public.book_backgrounds
for each row execute function public.set_book_backgrounds_updated_at();
