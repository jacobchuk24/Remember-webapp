# Remember — multi-tenant web app

Any number of churches can run on this one deployment. Each gets its own
space at `/c/[slug]` — its own branding, series, sermons, and admins — while
sharing one Next.js app and one Supabase database.

## How multi-tenancy works here

- **Landing page** (`/`) — a member types their church's slug to jump to
  `/c/[slug]`; a church admin clicks through to `/signup`.
- **`/signup`** — a church admin enters a church name + URL slug + their
  email. This is the one privileged operation a brand-new user needs before
  they have an account: it uses the Supabase **service-role key**, server-side
  only, to create the `churches` row and queue their admin access.
- **Secure admin elevation** — the tricky part of self-serve admin signup is
  that a magic-link email's redirect URL is just a normal URL the person can
  edit in their browser before clicking. So instead of trusting a
  `?admin=true` query param, signup writes a row to `pending_admin_signups`
  (service-role only, no RLS policies at all — nothing can read or write it
  except that key). `app/auth/callback/route.js` checks that table by the
  now-verified email after the magic link is clicked, and only then creates
  an `is_admin: true` profile. See the comments in that file for the full
  reasoning.
- **Regular members** just visit their church's `/c/[slug]` link, sign in
  with a magic link, and get a normal (non-admin) profile tied to that
  church automatically — no privileged step needed.
- **Row Level Security** does the real tenant isolation: every table with
  church data filters by `church_id` against the signed-in user's `profiles`
  row (see `supabase/schema.sql`). An admin at Church A cannot read or write
  Church B's sermons no matter what the app's UI does or doesn't show them —
  the database enforces it.

## Known v1 limitation

Each user account belongs to exactly one church (`profiles.church_id`).
That matches how most people would use this — you're a member of your
church, not several — but if you want one email to belong to multiple
churches, `profiles` would need to become a join table
(`user_id, church_id, is_admin`) instead of one row per user. Worth doing
if/when a pastor wants to be an admin of more than one church, or a member
attends two.

## Setup

### 1. Create a Supabase project
[supabase.com](https://supabase.com) → new project → SQL Editor → run
`supabase/schema.sql`.

### 2. Environment variables
```
cp .env.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
`SUPABASE_SERVICE_ROLE_KEY` from Supabase → Settings → API. Set
`NEXT_PUBLIC_SITE_URL` to `http://localhost:3000` for now.

### 3. Install and run
```
npm install
npm run dev
```
Visit `http://localhost:3000` → "Start free 30-day trial" → create your
first church. Check your inbox, click the link — you land in that church's
`/admin`, already set up as its admin. Publish a message, then visit
`/c/your-slug` to see it as a member would.

## Deploying

1. Push to GitHub, import in [Vercel](https://vercel.com).
2. Add all four environment variables in Vercel's project settings —
   set `NEXT_PUBLIC_SITE_URL` to your real Vercel/custom domain this time.
3. In Supabase → Authentication → URL Configuration, add that same domain
   to the redirect allow-list.
4. Deploy. Any church can now self-serve sign up at `/signup`.

## Suggested next steps

- Prayer Journal, Journey timeline, and Wrapped screens — the `prayers` and
  `completions` tables already support them; follow the pattern in
  `app/c/[slug]/notes/[id]/notes-editor.js`.
- A `/c/[slug]/admin/settings` page for editing church name + brand colors
  (updates the `churches` row; `derivePalette` already reads live from it).
- Stripe billing for the $150/month plan, gating `/admin` on an active
  subscription in addition to `is_admin`.
- Custom domains per church (map a church's own domain to their slug) if
  you outgrow `/c/[slug]` as the URL scheme.
