# Supabase Access And Project Setup Check — 2026-05-29

## Local Check Result

```text
SUPABASE_CLI=available via npx supabase 2.101.0
SUPABASE_MCP=enabled and OAuth authenticated in Codex global config
SUPABASE_PROJECT_REF=batwwcfqohysmrcosbix
EXPO_PUBLIC_SUPABASE_URL=https://batwwcfqohysmrcosbix.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=missing
SUPABASE_ACCESS_TOKEN=missing
GITHUB_REMOTE=https://github.com/Pranay1301/Sahib.ai-Game.git
```

## Repo Setup Completed

- Supabase JS client dependency is installed.
- App config reads:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- `.env.example` documents the target Supabase project URL and leaves the anon key uncommitted.
- Base-building repository helpers are ready to use an injected Supabase client.
- Supabase migration exists at `supabase/migrations/20260529000000_base_building_v1.sql`.
- The migration is scoped to authenticated users with RLS ownership checks and duplicate reward protection.
- Supabase MCP is registered globally with:
  - project ref `batwwcfqohysmrcosbix`
  - docs/database/account/debugging/development/functions/branching/storage features
- GitHub remote is linked to `Pranay1301/Sahib.ai-Game`.

## Checks Run

```bash
codex mcp list
codex mcp get supabase
npx supabase --version
npx supabase link --project-ref batwwcfqohysmrcosbix --workdir . --yes
npx supabase db lint --local --workdir .
npx supabase db push --linked --dry-run --workdir .
curl -so /dev/null -w '%{http_code}\n' https://mcp.supabase.com/mcp
curl -so /dev/null -w '%{http_code}\n' https://batwwcfqohysmrcosbix.supabase.co
```

Results:

- `codex mcp list` shows Supabase enabled with OAuth.
- `codex mcp get supabase` shows the expected project ref URL.
- `npx supabase --version` returned `2.101.0`.
- MCP endpoint returned `401`, which confirms the server is reachable without exposing auth.
- Project URL returned `404`, which confirms the Supabase host is reachable but no root route is served.
- `npx supabase link` could not complete because the Supabase CLI requires `supabase login` or `SUPABASE_ACCESS_TOKEN`; the Codex MCP OAuth session does not expose CLI credentials to this shell.
- `npx supabase db lint --local` could not run because no local Supabase Postgres is listening on `127.0.0.1:54322`.
- `npx supabase db push --linked --dry-run` could not run because the CLI project link was not created.

## Project Setup Needed Outside Repo

1. Run `supabase login` or set `SUPABASE_ACCESS_TOKEN` for the Supabase CLI.
2. Link the CLI project with `npx supabase link --project-ref batwwcfqohysmrcosbix --workdir .`.
3. Apply the V1 migration with `npx supabase db push --linked --workdir .`.
4. Set `EXPO_PUBLIC_SUPABASE_ANON_KEY` in local and build environments.
5. Confirm authenticated user access works with the RLS policies.
6. Run a live smoke test against the real project:
   - create/bootstrap base rows
   - load base snapshot
   - claim one BattleResult reward
   - retry same claim and confirm duplicate rejection
   - start and clear one active upgrade

## Status

Repo-side GitHub and Supabase linking is complete. The remaining external step is applying the migration to the live Supabase database after CLI access token or refreshed MCP database tools are available.
