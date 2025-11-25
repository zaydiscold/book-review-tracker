-- Supabase bootstrap for Reading Journal
-- Run in the SQL editor. Adjust names if you prefer a different schema.

-- Books table
create table if not exists public.books (
  id bigint generated always as identity primary key,
  user_id uuid null default auth.uid(),
  title text not null,
  titleLower text null,
  author text null,
  authorLower text null,
  status text not null default 'wishlist',
  cover text null,
  openLibraryUrl text null,
  openLibraryIdentifiers jsonb null,
  availability jsonb null,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);

-- Safely add user_id if it was missing from a previous create
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'books' and column_name = 'user_id') then
    alter table public.books add column user_id uuid null default auth.uid();
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'books' and column_name = 'createdAt') then
    alter table public.books add column "createdAt" timestamptz not null default now();
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'books' and column_name = 'updatedAt') then
    alter table public.books add column "updatedAt" timestamptz not null default now();
  end if;
end $$;

-- Reviews table
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  bookId bigint not null references public.books(id) on delete cascade,
  user_id uuid null default auth.uid(),
  rating numeric null,
  text text null,
  status text null,
  unread boolean null,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now()
);

-- Safely add columns if they were missing from a previous create
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'reviews' and column_name = 'user_id') then
    alter table public.reviews add column user_id uuid null default auth.uid();
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'reviews' and column_name = 'createdAt') then
    alter table public.reviews add column "createdAt" timestamptz not null default now();
  end if;

  if not exists (select 1 from information_schema.columns where table_name = 'reviews' and column_name = 'updatedAt') then
    alter table public.reviews add column "updatedAt" timestamptz not null default now();
  end if;
end $$;

-- Helpful indexes
create index if not exists books_user_status_idx on public.books (user_id, status);
create index if not exists books_titlelower_idx on public.books (titleLower);
create index if not exists books_authorlower_idx on public.books (authorLower);
create index if not exists reviews_book_idx on public.reviews (bookId);

-- Enable Row Level Security
alter table public.books enable row level security;
alter table public.reviews enable row level security;

-- Policies: allow users to manage their own rows, and allow rows without user_id for anonymous use.
-- Drop existing policies to avoid errors on re-run
drop policy if exists "Books: owners or anonymous can read" on public.books;
create policy "Books: owners or anonymous can read"
  on public.books for select
  using (auth.uid() = user_id or user_id is null);

drop policy if exists "Books: owners or anonymous can insert" on public.books;
create policy "Books: owners or anonymous can insert"
  on public.books for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Books: owners or anonymous can update" on public.books;
create policy "Books: owners or anonymous can update"
  on public.books for update
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Books: owners or anonymous can delete" on public.books;
create policy "Books: owners or anonymous can delete"
  on public.books for delete
  using (auth.uid() = user_id or user_id is null);

drop policy if exists "Reviews: owners or anonymous can read" on public.reviews;
create policy "Reviews: owners or anonymous can read"
  on public.reviews for select
  using (auth.uid() = user_id or user_id is null);

drop policy if exists "Reviews: owners or anonymous can insert" on public.reviews;
create policy "Reviews: owners or anonymous can insert"
  on public.reviews for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Reviews: owners or anonymous can update" on public.reviews;
create policy "Reviews: owners or anonymous can update"
  on public.reviews for update
  using (auth.uid() = user_id or user_id is null)
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "Reviews: owners or anonymous can delete" on public.reviews;
create policy "Reviews: owners or anonymous can delete"
  on public.reviews for delete
  using (auth.uid() = user_id or user_id is null);

-- Optional: keep timestamps fresh on update
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new."updatedAt" = now();
  return new;
  return new;
end;
$$;

drop trigger if exists books_touch_updated_at on public.books;
create trigger books_touch_updated_at
before update on public.books
for each row execute function public.touch_updated_at();

drop trigger if exists reviews_touch_updated_at on public.reviews;
create trigger reviews_touch_updated_at
before update on public.reviews
for each row execute function public.touch_updated_at();
