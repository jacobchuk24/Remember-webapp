-- Remember — database schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Multi-tenant: any number of churches can share this one deployment,
-- each reachable at /c/[slug]. See README for how signup + membership work.

create extension if not exists "uuid-ossp";

-- ---------- Churches ----------
create table churches (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null default 'Your Church',
  primary_color text not null default '#1B3A2F',
  accent_color text not null default '#C6A15B',
  background_color text not null default '#F6F1E6',
  created_at timestamptz not null default now()
);

-- ---------- Pending admin signups ----------
-- Written by a service-role server action when someone signs up to create a
-- new church (app/signup/actions.js), consumed by the auth callback once
-- they click their magic link. This is what safely ties "this email becomes
-- an admin of this church" to a verified email address instead of trusting
-- anything in the URL — see the comment in app/auth/callback/route.js.
-- No RLS policies are defined here on purpose: only the service-role key
-- (server-only) can read or write this table.
create table pending_admin_signups (
  email text primary key,
  church_id uuid not null references churches(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table pending_admin_signups enable row level security;

-- ---------- Series ----------
create table series (
  id uuid primary key default uuid_generate_v4(),
  church_id uuid not null references churches(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (church_id, name)
);

-- ---------- Sermons ----------
create table sermons (
  id uuid primary key default uuid_generate_v4(),
  church_id uuid not null references churches(id) on delete cascade,
  series_id uuid references series(id) on delete set null,
  title text not null,
  speaker text not null,
  date date not null,
  description text default '',
  -- blocks: [{ id, type: 'text'|'blank'|'reflection'|'prayer'|'image'|'youtube'|'facebook'|'announcement', content }]
  blocks jsonb not null default '[]',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- Member profiles ----------
-- One row per auth.users id. is_admin controls access to /admin routes.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  church_id uuid not null references churches(id) on delete cascade,
  display_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Sermon notes (per member, per sermon) ----------
create table sermon_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sermon_id uuid not null references sermons(id) on delete cascade,
  answers jsonb not null default '{}', -- { [blockId]: string }
  updated_at timestamptz not null default now(),
  unique (user_id, sermon_id)
);

-- ---------- Completions (drives Journey / timeline) ----------
create table completions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sermon_id uuid not null references sermons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, sermon_id)
);

-- ---------- Prayer journal ----------
create table prayers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  text text not null,
  answered boolean not null default false,
  created_at timestamptz not null default now()
);

-- =========================================================
-- Row Level Security
-- =========================================================
alter table churches enable row level security;
alter table series enable row level security;
alter table sermons enable row level security;
alter table profiles enable row level security;
alter table sermon_notes enable row level security;
alter table completions enable row level security;
alter table prayers enable row level security;

-- Church name/branding/slug are public by nature (every member's app screen
-- shows them, and slugs must be checkable before anyone has an account) —
-- so churches is openly readable. Only admins can write to it (below).
create policy "anyone can read churches" on churches for select using (true);

-- Series and published sermons stay gated to signed-in members of that church.
create policy "read own church series" on series for select using (
  church_id in (select church_id from profiles where profiles.id = auth.uid())
);
create policy "read published sermons" on sermons for select using (
  status = 'published'
  and church_id in (select church_id from profiles where profiles.id = auth.uid())
);

-- Admins can do everything within their own church.
create policy "admin manage church" on churches for update using (
  id in (select church_id from profiles where profiles.id = auth.uid() and is_admin)
);
create policy "admin manage series" on series for all using (
  church_id in (select church_id from profiles where profiles.id = auth.uid() and is_admin)
);
create policy "admin manage sermons" on sermons for all using (
  church_id in (select church_id from profiles where profiles.id = auth.uid() and is_admin)
);

-- Profiles: a user can read/update their own profile row.
create policy "read own profile" on profiles for select using (id = auth.uid());
create policy "update own profile" on profiles for update using (id = auth.uid());

-- Personal journal data: strictly owner-only.
create policy "own notes" on sermon_notes for all using (user_id = auth.uid());
create policy "own completions" on completions for all using (user_id = auth.uid());
create policy "own prayers" on prayers for all using (user_id = auth.uid());

-- Churches are created through the app's /signup flow now (it needs the
-- service-role key to bypass RLS for that one privileged insert), not a
-- manual seed here. See README.
