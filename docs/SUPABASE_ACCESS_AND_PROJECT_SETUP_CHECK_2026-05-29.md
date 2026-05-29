# Supabase Access And Project Setup Check — 2026-05-29

## Local Check Result

```text
SUPABASE_CLI=missing
EXPO_PUBLIC_SUPABASE_URL=missing
EXPO_PUBLIC_SUPABASE_ANON_KEY=missing
SUPABASE_ACCESS_TOKEN=missing
```

## Repo Setup Completed

- Supabase JS client dependency is installed.
- App config reads:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `.env.example` documents the required Expo public env keys.
- Base-building repository helpers are ready to use an injected Supabase client.
- Supabase migration exists at `supabase/migrations/20260529000000_base_building_v1.sql`.

## Project Setup Needed Outside Repo

1. Install Supabase CLI or open the Supabase Dashboard SQL editor.
2. Apply the V1 migration.
3. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` in local and build environments.
4. Confirm authenticated user access works with the RLS policies.
5. Run a live smoke test against the real project:
   - create/bootstrap base rows
   - load base snapshot
   - claim one BattleResult reward
   - retry same claim and confirm duplicate rejection
   - start and clear one active upgrade

## Status

Repo-side Supabase setup is complete. Real project access is not available from this local environment yet.
