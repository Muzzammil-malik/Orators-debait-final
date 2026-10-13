# Supabase Setup

## Local and deployment environment

Copy `.env.example` to an ignored local environment file and set:

- `VITE_SUPABASE_URL`: the Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY`: the project's publishable key only. Never use a service-role or secret key in this Vite client.

Set the same variables in the deployment provider's build environment, then rebuild/redeploy. The public client uses RLS for every database request.

## Auth provider settings

The committed local Supabase config disables email/public signup and enables anonymous sign-ins for one-ballot-per-browser-session voting. Apply the equivalent settings in Supabase Dashboard → Authentication → Sign In / Providers for the connected project:

1. Disable **Allow new users to sign up** (including email signup).
2. Enable **Anonymous Sign-Ins** so public audience ballots can get an isolated Auth identity.
3. Keep email/password sign-in enabled for operators and configure the production site URL and allowed redirect URLs.

Anonymous voter sessions use Supabase Auth and are not cross-device identities. The database accepts their ballot only for a live, public match with voting open, and stores one ballot per Auth user per match.

## First administrator

Do not enable public signup to bootstrap an administrator. In Supabase Dashboard:

1. Under Authentication → Users, invite/create the first operator account. Use a unique operator email, a strong password, and email verification/confirmation appropriate to the project's mail setup.
2. Copy that user's UUID from the Auth Users page.
3. In the SQL Editor, run the following once, replacing the placeholder with the UUID from step 2:

```sql
insert into public.admin_profiles (user_id, role)
values ('<AUTH_USER_UUID>', 'admin')
on conflict (user_id) do nothing;
```

Only an Auth user with this profile passes the database admin check. `user_metadata` is not used for authorization. Keep the SQL Editor and project-owner permissions restricted to trusted operators.

## Database migrations

Versioned SQL migrations are under `supabase/migrations/`. Together they create the 8-preliminary / 4-quarter-final / 2-semi-final / 1-final structure and security policies without importing the old demo teams, results, scores, motions, or votes. The four-stage migration reclassifies existing semi-final match records as quarter-finals without changing their teams, scores, or results, fills any missing quarter-final slots, and adds two new semi-final matches.

Apply future schema changes as new migrations; do not edit an already-applied migration. Teams are archived, not deleted, so referenced match history is preserved. The database rejects archival while a team is assigned to an upcoming/live match and prevents edits that would invalidate completed results or existing score rows.

## Verification and limitations

Public reads use the publishable key and RLS. Team-member names, admin profiles, and individual ballots are not available to anonymous/public users; published match data and aggregate voting totals are.

The Supabase project was verified to have the migration tables, RLS, anonymous read behavior, private team-member access, and realtime publication. An actual operator login and write workflow still requires the first admin profile and the remote Auth provider settings above. The website's default build has no production URL/key embedded; until environment variables are supplied, it displays an unconfigured/error state rather than dummy tournament data.
