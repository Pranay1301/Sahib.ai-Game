# Base Building End-of-Day Bug List And Tomorrow Plan — 2026-05-29

## Bug List

- No fatal automated test failures found.
- No Android export/bundle failure found.
- No quick-round regression found in the automated suite.
- No base-building phase gap found in the Phase 0-15 checklist.
- `npm audit --omit=dev --audit-level=high` found no high/critical production vulnerability, but reported moderate Expo transitive advisories that require a forced Expo patch-range upgrade to auto-fix. Do not force-upgrade Expo without a separate mobile regression pass.

## Known External Blockers

- Supabase CLI is available through `npx supabase 2.102.0`, logged in, and linked to project ref `batwwcfqohysmrcosbix`.
- Codex Supabase MCP is globally registered and OAuth authenticated, but this running Codex session has not exposed live `mcp__supabase` database tools yet.
- Real Supabase project values are not present in the repo and must stay outside source control:
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- The Supabase project URL is documented as `https://batwwcfqohysmrcosbix.supabase.co`.
- The live Supabase V1 migration is applied and verified.

## Tomorrow Plan

1. Add the Expo public anon key to local/dev build settings.
2. Test a real authenticated user flow:
   - bootstrap profile/game/buildings
   - load base snapshot
   - consume mock BattleResult through reward claim RPC
   - verify duplicate reward claim is rejected
   - start and clear one active upgrade
3. Run physical-device smoke after env setup.
4. Review Expo patch upgrade path for the moderate transitive audit advisories.

## Current Repo Verification Commands

```bash
node --test tests/baseSupabaseClient.test.mjs tests/baseSupabaseRepository.test.mjs tests/baseSupabaseMigration.test.mjs tests/baseBackend.test.mjs tests/baseRewardBridge.test.mjs tests/quickRoundResult.test.mjs
npm test
npx expo export --platform android --output-dir .expo-export-test
graphify update .
```
