-- ============================================================
-- Shared Workspace Migration
-- Run this in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

-- 1. Create profiles table for display names + accent colors
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  accent_color text not null default '#5B5FEF',
  created_at timestamptz not null default now(),
  unique(user_id)
);

-- 2. Enable RLS on profiles (anyone authenticated can read)
alter table profiles enable row level security;

drop policy if exists "anyone can read profiles" on profiles;
create policy "anyone can read profiles"
  on profiles for select
  using (auth.uid() is not null);

drop policy if exists "users can update own profile" on profiles;
create policy "users can update own profile"
  on profiles for update
  using (auth.uid() = user_id);

-- 3. Seed Kei and Meredith profiles
insert into profiles (user_id, display_name, accent_color)
select id, 'Kei', '#5B5FEF'
from auth.users where email = 'krizzaheart.esperas@gmail.com'
on conflict (user_id) do update
  set display_name = excluded.display_name,
      accent_color = excluded.accent_color;

insert into profiles (user_id, display_name, accent_color)
select id, 'Meredith', '#14B8A6'
from auth.users where email = 'meredithroncejero09@gmail.com'
on conflict (user_id) do update
  set display_name = excluded.display_name,
      accent_color = excluded.accent_color;

-- Fix profiles created by signup trigger with email-prefix names
update profiles
set display_name = 'Meredith', accent_color = '#14B8A6'
where display_name = 'meredithroncejero09';

update profiles
set display_name = 'Kei', accent_color = '#5B5FEF'
where display_name = 'krizzaheart.esperas';

-- 4. Auto-create a profile on signup (for future users)
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (user_id, display_name, accent_color)
  values (
    new.id,
    coalesce(split_part(new.email, '@', 1), 'User'),
    '#6B7086'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 5. Update applications RLS: let authenticated users read ALL applications
--    (keep insert/update/delete restricted to own rows)
drop policy if exists "select own applications" on applications;
drop policy if exists "select all applications" on applications;
create policy "select all applications"
  on applications for select
  using (auth.uid() is not null);

-- insert/update/delete policies remain unchanged (own rows only)
