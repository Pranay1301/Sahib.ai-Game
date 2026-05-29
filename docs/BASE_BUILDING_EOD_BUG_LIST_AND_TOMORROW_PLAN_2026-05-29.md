# Base Building End-of-Day Bug List And Tomorrow Plan — 2026-05-29

## Bug List

- No fatal automated test failures found.
- No Android export/bundle failure found.
- No quick-round regression found in the automated suite.
- No base-building phase gap found in the Phase 0-15 checklist.
- `npm audit --omit=dev --audit-level=high` found no high/critical production vulnerability, but reported moderate Expo transitive advisories that require a forced Expo patch-range upgrade to auto-fix. Do not force-upgrade Expo without a separate mobile regression pass.

## Known External Blockers

- Supabase CLI is available through `npx supabase 2.101.0`, but it is not logged in for this shell.
- Codex Supabase MCP is globally registered and OAuth authenticated, but this running Codex session has not exposed live `mcp__supabase` database tools yet.
- Supabase local lint needs a running local Supabase Postgres on `127.0.0.1:54322`; none is running here.
- Real Supabase project values are not present in the repo and must stay outside source control:
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- The Supabase project URL is documented as `https://batwwcfqohysmrcosbix.supabase.co`.
- The migration has not been applied to the live Supabase project from this machine because CLI access requires `supabase login` or `SUPABASE_ACCESS_TOKEN`.

## Tomorrow Plan

1. Run `supabase login` or provide `SUPABASE_ACCESS_TOKEN`.
2. Link CLI project ref `batwwcfqohysmrcosbix`.
3. Apply `supabase/migrations/20260529000000_base_building_v1.sql`.
4. Add the Expo public anon key to local/dev build settings.
5. Run Supabase SQL lint or dashboard validation.
6. Test a real authenticated user flow:
   - bootstrap profile/game/buildings
   - load base snapshot
   - consume mock BattleResult through reward claim RPC
   - verify duplicate reward claim is rejected
   - start and clear one active upgrade
7. Run physical-device smoke after env setup.
8. Review Expo patch upgrade path for the moderate transitive audit advisories.

## Current Repo Verification Commands

```bash
node --test tests/baseSupabaseClient.test.mjs tests/baseSupabaseRepository.test.mjs tests/baseSupabaseMigration.test.mjs tests/baseBackend.test.mjs tests/baseRewardBridge.test.mjs tests/quickRoundResult.test.mjs
npm test
npx expo export --platform android --output-dir .expo-export-test
graphify update .
```
