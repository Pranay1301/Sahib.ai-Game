# Base Building End-of-Day Bug List And Tomorrow Plan — 2026-05-29

## Bug List

- No fatal automated test failures found.
- No Android export/bundle failure found.
- No quick-round regression found in the automated suite.
- No base-building phase gap found in the Phase 0-15 checklist.
- `npm audit --omit=dev --audit-level=high` found no high/critical production vulnerability, but reported moderate Expo transitive advisories that require a forced Expo patch-range upgrade to auto-fix. Do not force-upgrade Expo without a separate mobile regression pass.

## Known External Blockers

- Supabase CLI is not installed in the local workspace, so `supabase db lint` and `supabase db push` could not be run here.
- Real Supabase project values are not present in the repo and must stay outside source control:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- The migration has not been applied to the production/staging Supabase project from this machine.

## Tomorrow Plan

1. Install/login to Supabase CLI or use the Supabase Dashboard SQL editor.
2. Apply `supabase/migrations/20260529000000_base_building_v1.sql`.
3. Add the two Expo public Supabase env values to local/dev build settings.
4. Run Supabase SQL lint or dashboard validation.
5. Test a real authenticated user flow:
   - bootstrap profile/game/buildings
   - load base snapshot
   - consume mock BattleResult through reward claim RPC
   - verify duplicate reward claim is rejected
   - start and clear one active upgrade
6. Run physical-device smoke after env setup.
7. Review Expo patch upgrade path for the moderate transitive audit advisories.

## Current Repo Verification Commands

```bash
node --test tests/baseSupabaseClient.test.mjs tests/baseSupabaseRepository.test.mjs tests/baseSupabaseMigration.test.mjs tests/baseBackend.test.mjs tests/baseRewardBridge.test.mjs tests/quickRoundResult.test.mjs
npm test
npx expo export --platform android --output-dir .expo-export-test
graphify update .
```
