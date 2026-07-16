-- Trailhead job tracker schema
-- Run this in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run

create extension if not exists "pgcrypto";

create table if not exists applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'applied'
    check (status in ('applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn')),
  applied_date date not null default current_date,
  follow_up_date date,
  location text,
  job_url text,
  salary text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_id_idx on applications (user_id);
create index if not exists applications_follow_up_idx on applications (follow_up_date);

-- Keep updated_at current on every edit
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_set_updated_at on applications;
create trigger applications_set_updated_at
  before update on applications
  for each row execute function set_updated_at();

-- Row Level Security: each signed-in user only ever sees their own rows
alter table applications enable row level security;

drop policy if exists "select own applications" on applications;
create policy "select own applications"
  on applications for select
  using (auth.uid() = user_id);

drop policy if exists "insert own applications" on applications;
create policy "insert own applications"
  on applications for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own applications" on applications;
create policy "update own applications"
  on applications for update
  using (auth.uid() = user_id);

drop policy if exists "delete own applications" on applications;
create policy "delete own applications"
  on applications for delete
  using (auth.uid() = user_id);
