# Trailhead — Job Application Tracker

A small Next.js + TypeScript + Supabase app for tracking job applications, built for
two people (or more) who each want their own private list. Table view, Kanban view,
a dashboard with charts, and a follow-up reminder widget.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Supabase** — Postgres database, Auth (email/password), Row Level Security
- **Tailwind CSS** for styling
- **Recharts** for the dashboard charts
- Deploys to **Vercel**

## 1. Create the Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Once it's created, open **SQL Editor** → New query, paste the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the
   `applications` table plus Row Level Security policies so each signed-in user
   only ever sees their own rows.
3. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key

### Restricting sign-ups to just the two of you (optional)

By default anyone can create an account. Since this is just for you and your friend:
- Go to **Authentication → Providers → Email** and you can leave sign-ups on and
  just not share the URL, **or**
- Go to **Authentication → Settings** and turn off "Allow new users to sign up"
  once you've both created your accounts, so no one else can register later.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in the two values from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll land on the login page —
create an account, confirm your email (Supabase sends a confirmation link by
default), then sign in. Have your friend do the same with their own email; each of
you only sees your own applications.

## 4. Deploy to Vercel

1. Push this project to a GitHub repo.
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo.
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. Vercel will rebuild automatically on every push to your main branch.

If you use email confirmation, also set your deployed URL as a **Redirect URL** in
Supabase under **Authentication → URL Configuration**, so confirmation links point
to production instead of `localhost`.

## What's included

- **Dashboard** — a pipeline visualization (applied → screening → interview →
  offer), stat cards (total, in progress, interview rate, offer rate), an
  applications-over-time chart, a status breakdown chart, and a list of
  follow-ups due in the next 14 days (including overdue ones).
- **Applications** — add, edit, and delete applications; switch between a Kanban
  board (drag a card to change its status) and a sortable/searchable table;
  filter by status or search by company/role.
- **Auth** — email/password sign-up and sign-in via Supabase Auth. Every
  application row is tied to the user who created it and protected by Postgres
  Row Level Security, so there's no way for one user's data to leak into the
  other's, even via a bug in the app code.

## Extending it later

- **Email reminders**: right now follow-up reminders only show on the dashboard
  when you're signed in. To get an actual email/Slack ping, you could add a
  Supabase Edge Function on a `pg_cron` schedule that queries
  `follow_up_date = current_date` and sends via something like Resend.
- **Withdrawn applications**: the Kanban board shows five columns (applied
  through rejected). "Withdrawn" applications still exist and show up in the
  table and dashboard stats — add a sixth column if you'd rather see them on
  the board too.
- **Attachments**: to attach a resume/cover letter per application, add a
  Supabase Storage bucket and store the file path on the `applications` row.

## Project structure

```
app/
  login/             sign-in / sign-up page
  (app)/             route group sharing the sidebar layout
    layout.tsx        fetches the user, renders Sidebar + MobileNav
    dashboard/        stats + charts + follow-ups
    applications/     table + kanban view
components/          shared UI (Sidebar, MobileNav, charts, table, kanban, modal)
lib/
  supabase/          browser + server Supabase clients
  actions.ts          server actions (create/update/delete)
  types.ts             shared TypeScript types
supabase/
  schema.sql           run this once in the Supabase SQL editor
middleware.ts          redirects signed-out users to /login
```

## Design system

The UI uses a modern SaaS-dashboard look: a fixed left sidebar for navigation, a
neutral off-white background, indigo/violet as the primary brand color with a
teal secondary accent, Space Grotesk for display type, Inter for body/UI text,
and JetBrains Mono for dates and numbers. All tokens live in
`tailwind.config.ts` (colors, radii, shadows, the brand gradient) — change them
there to retheme the whole app in one place.
