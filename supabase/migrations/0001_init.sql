-- 0001_init.sql — schema, RLS, and admin RPC for the ranking site.
-- Run in the Supabase SQL editor (or via supabase CLI migrations).

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user; role gates all writes.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile whenever a user signs up / is created.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- SECURITY DEFINER so RLS policies can call it without recursing into the
-- profiles policies themselves.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- categories & ranking_items
-- ---------------------------------------------------------------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  nav_group text not null,
  methodology text not null default '',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ranking_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories (id) on delete cascade,
  rank integer not null check (rank between 1 and 20),
  name text not null,
  slug text not null,
  blurb text not null default '',
  score numeric(5, 1),
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ranking_items_category_slug_key unique (category_id, slug),
  -- Deferrable so reorders that swap ranks within one transaction don't trip
  -- the constraint mid-update.
  constraint ranking_items_category_rank_key unique (category_id, rank)
    deferrable initially deferred
);

create index ranking_items_category_rank_idx
  on public.ranking_items (category_id, rank);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create trigger ranking_items_set_updated_at
before update on public.ranking_items
for each row execute function public.set_updated_at();

-- Replace a category's full item list atomically. SECURITY INVOKER: RLS still
-- applies, so only admins can actually delete/insert through this.
create or replace function public.replace_ranking_items(
  p_category_id uuid,
  p_items jsonb
)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  delete from public.ranking_items where category_id = p_category_id;
  insert into public.ranking_items (category_id, rank, name, slug, blurb, score, url)
  select
    p_category_id,
    (item ->> 'rank')::integer,
    item ->> 'name',
    item ->> 'slug',
    coalesce(item ->> 'blurb', ''),
    nullif(item ->> 'score', '')::numeric,
    nullif(item ->> 'url', '')
  from jsonb_array_elements(p_items) as item;
end;
$$;

revoke execute on function public.replace_ranking_items(uuid, jsonb) from anon;

-- ---------------------------------------------------------------------------
-- Row Level Security: public read on rankings, admin-only writes.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.ranking_items enable row level security;

create policy "profiles: read own or admin"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());
-- No insert/update/delete policies on profiles: roles are changed via SQL
-- (one-time admin bootstrap), not from the app.

create policy "categories: public read"
  on public.categories for select
  using (true);
create policy "categories: admin insert"
  on public.categories for insert
  with check (public.is_admin());
create policy "categories: admin update"
  on public.categories for update
  using (public.is_admin())
  with check (public.is_admin());
create policy "categories: admin delete"
  on public.categories for delete
  using (public.is_admin());

create policy "ranking_items: public read"
  on public.ranking_items for select
  using (true);
create policy "ranking_items: admin insert"
  on public.ranking_items for insert
  with check (public.is_admin());
create policy "ranking_items: admin update"
  on public.ranking_items for update
  using (public.is_admin())
  with check (public.is_admin());
create policy "ranking_items: admin delete"
  on public.ranking_items for delete
  using (public.is_admin());
