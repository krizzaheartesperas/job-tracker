-- ============================================================
-- Seed Interview Questions
-- Run after supabase/interview_questions_migration.sql.
--
-- Replace the email values if you want to seed these questions
-- for a different account.
-- ============================================================

insert into interview_questions (user_id, category, prompt, focus, source)
select id, 'Introduction',
  'Tell me about yourself and the kind of role you are looking for.',
  'Keep it under two minutes: present role, strongest skills, target role, and why this company fits.',
  'manual'
from auth.users
where email in ('krizzaheart.esperas@gmail.com', 'meredithroncejero09@gmail.com')
on conflict do nothing;

insert into interview_questions (user_id, category, prompt, focus, source)
select id, 'Motivation',
  'Why are you interested in this company and this position?',
  'Connect the company, the role responsibilities, and one specific reason your background matches.',
  'manual'
from auth.users
where email in ('krizzaheart.esperas@gmail.com', 'meredithroncejero09@gmail.com')
on conflict do nothing;

insert into interview_questions (user_id, category, prompt, focus, source)
select id, 'Experience',
  'Walk me through a project or responsibility you are proud of.',
  'Use situation, action, result. Name the problem, your contribution, and the measurable outcome.',
  'manual'
from auth.users
where email in ('krizzaheart.esperas@gmail.com', 'meredithroncejero09@gmail.com')
on conflict do nothing;

insert into interview_questions (user_id, category, prompt, focus, source)
select id, 'Behavioral',
  'Tell me about a time you handled a difficult teammate, customer, or stakeholder.',
  'Show how you listened, clarified the issue, took action, and protected the working relationship.',
  'manual'
from auth.users
where email in ('krizzaheart.esperas@gmail.com', 'meredithroncejero09@gmail.com')
on conflict do nothing;

insert into interview_questions (user_id, category, prompt, focus, source)
select id, 'Problem solving',
  'Describe a time you had to learn something quickly to complete a task.',
  'Explain your learning process, how you validated your work, and what changed afterward.',
  'manual'
from auth.users
where email in ('krizzaheart.esperas@gmail.com', 'meredithroncejero09@gmail.com')
on conflict do nothing;

insert into interview_questions (user_id, category, prompt, focus, source)
select id, 'Strengths',
  'What is one strength you would bring to this team?',
  'Pick a strength that matters for the job and back it with a real example.',
  'manual'
from auth.users
where email in ('krizzaheart.esperas@gmail.com', 'meredithroncejero09@gmail.com')
on conflict do nothing;

insert into interview_questions (user_id, category, prompt, focus, source)
select id, 'Growth',
  'What is a weakness you are actively working on?',
  'Choose a real but manageable weakness, then emphasize your system for improving it.',
  'manual'
from auth.users
where email in ('krizzaheart.esperas@gmail.com', 'meredithroncejero09@gmail.com')
on conflict do nothing;

insert into interview_questions (user_id, category, prompt, focus, source)
select id, 'Closing',
  'Why should we hire you?',
  'Summarize your relevant experience, work style, and the value you can deliver early.',
  'manual'
from auth.users
where email in ('krizzaheart.esperas@gmail.com', 'meredithroncejero09@gmail.com')
on conflict do nothing;
