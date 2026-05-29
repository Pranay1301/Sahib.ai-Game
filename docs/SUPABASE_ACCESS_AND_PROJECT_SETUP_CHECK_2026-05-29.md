# Supabase Access And Project Setup Check — 2026-05-29

## Local Check Result

```text
SUPABASE_CLI=available via npx supabase 2.102.0
SUPABASE_MCP=enabled and OAuth authenticated in Codex global config
SUPABASE_PROJECT_REF=batwwcfqohysmrcosbix
SUPABASE_PROJECT_NAME=Sahib AI
SUPABASE_PROJECT_STATUS=ACTIVE_HEALTHY
EXPO_PUBLIC_SUPABASE_URL=https://batwwcfqohysmrcosbix.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=missing
SUPABASE_CLI_AUTH=logged in as token name sahib-ai-codex
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
- The migration has been applied to the live Supabase project.
- Supabase MCP is registered globally with:
  - project ref `batwwcfqohysmrcosbix`
  - docs/database/account/debugging/development/functions/branching/storage features
- GitHub remote is linked to `Pranay1301/Sahib.ai-Game`.

## Checks Run

```bash
codex mcp list
codex mcp get supabase
npx supabase --version
npx supabase projects list --output-format json
npx supabase link --project-ref batwwcfqohysmrcosbix --workdir . --yes
npx supabase migration list --linked --workdir .
npx supabase db push --linked --dry-run --workdir .
npx supabase db push --linked --workdir .
npx supabase db lint --linked --workdir .
npx supabase db advisors --linked --workdir .
npx supabase db query --linked --workdir . -o table "<verification query>"
curl -so /dev/null -w '%{http_code}\n' https://mcp.supabase.com/mcp
curl -so /dev/null -w '%{http_code}\n' https://batwwcfqohysmrcosbix.supabase.co
```

Results:

- `codex mcp list` shows Supabase enabled with OAuth.
- `codex mcp get supabase` shows the expected project ref URL.
- `npx supabase --version` returned `2.102.0`.
- `npx supabase projects list` shows project `Sahib AI`, ref `batwwcfqohysmrcosbix`, status `ACTIVE_HEALTHY`, Postgres `17.6.1.127`.
- `npx supabase link` completed for project ref `batwwcfqohysmrcosbix`.
- `npx supabase migration list --linked` shows local and remote both at `20260529000000`.
- `npx supabase db push --linked --dry-run` showed one pending migration before apply: `20260529000000_base_building_v1.sql`.
- `npx supabase db push --linked` applied `20260529000000_base_building_v1.sql`.
- `npx supabase db lint --linked` returned `No schema errors found`.
- `npx supabase db advisors --linked` returned `No issues found`.
- Live SQL verification confirmed all five tables exist:
  - `active_upgrades`
  - `battle_reward_claims`
  - `profiles`
  - `user_buildings`
  - `user_game_state`
- Live SQL verification confirmed both RPCs exist:
  - `base_server_now`
  - `claim_base_battle_reward`
- Live SQL verification confirmed all 15 RLS policies are scoped to `{authenticated}`.
- MCP endpoint returned `401`, which confirms the server is reachable without exposing auth.
- Project URL returned `404`, which confirms the Supabase host is reachable but no root route is served.

## Remaining App Environment Setup

1. Set `EXPO_PUBLIC_SUPABASE_ANON_KEY` in local and build environments. Do not commit real keys.
2. Run a signed-in app smoke test against the real project:
   - create/bootstrap base rows
   - load base snapshot
   - claim one BattleResult reward
   - retry same claim and confirm duplicate rejection
   - start and clear one active upgrade

## Status

Repo-side GitHub linking, Supabase CLI linking, and live Supabase V1 schema migration are complete. The remaining step is app-environment setup for the public anon key and a signed-in app smoke test.
