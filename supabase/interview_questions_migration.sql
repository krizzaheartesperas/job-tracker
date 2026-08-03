-- ============================================================
-- Interview Questions Migration
-- Run this in Supabase: Dashboard -> SQL Editor -> New query -> paste -> Run
-- ============================================================

create table if not exists interview_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'Custom',
  prompt text not null,
  focus text,
  source text not null default 'manual'
    check (source in ('manual', 'resume')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_questions_user_id_idx on interview_questions (user_id);
create index if not exists interview_questions_created_at_idx on interview_questions (created_at);
create index if not exists interview_questions_source_idx on interview_questions (source);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists interview_questions_set_updated_at on interview_questions;
create trigger interview_questions_set_updated_at
  before update on interview_questions
  for each row execute function set_updated_at();

alter table interview_questions enable row level security;

drop policy if exists "select shared interview questions" on interview_questions;
create policy "select shared interview questions"
  on interview_questions for select
  using (
    auth.uid() is not null
    and (
      source = 'manual'
      or auth.uid() = user_id
    )
  );

drop policy if exists "insert own interview questions" on interview_questions;
create policy "insert own interview questions"
  on interview_questions for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own interview questions" on interview_questions;
create policy "update own interview questions"
  on interview_questions for update
  using (auth.uid() = user_id);

drop policy if exists "delete own interview questions" on interview_questions;
create policy "delete own interview questions"
  on interview_questions for delete
  using (auth.uid() = user_id);
