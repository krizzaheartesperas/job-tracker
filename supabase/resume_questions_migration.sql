-- ============================================================
-- Resume-Based Interview Questions Migration
-- Run after supabase/interview_questions_migration.sql.
-- ============================================================

alter table interview_questions
  add column if not exists source text not null default 'manual';

alter table interview_questions
  drop constraint if exists interview_questions_source_check;

alter table interview_questions
  add constraint interview_questions_source_check
  check (source in ('manual', 'resume'));

create index if not exists interview_questions_source_idx on interview_questions (source);

create table if not exists resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text,
  resume_text text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create index if not exists resumes_user_id_idx on resumes (user_id);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists resumes_set_updated_at on resumes;
create trigger resumes_set_updated_at
  before update on resumes
  for each row execute function set_updated_at();

alter table resumes enable row level security;

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

drop policy if exists "select own resume" on resumes;
create policy "select own resume"
  on resumes for select
  using (auth.uid() = user_id);

drop policy if exists "insert own resume" on resumes;
create policy "insert own resume"
  on resumes for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own resume" on resumes;
create policy "update own resume"
  on resumes for update
  using (auth.uid() = user_id);

drop policy if exists "delete own resume" on resumes;
create policy "delete own resume"
  on resumes for delete
  using (auth.uid() = user_id);
