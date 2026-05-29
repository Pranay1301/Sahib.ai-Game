# Base Backend Completion Report — 2026-05-29

## Completed

- Implemented the V1 Supabase schema as a simple five-table migration:
  - `profiles`
  - `user_game_state`
  - `user_buildings`
  - `active_upgrades`
  - `battle_reward_claims`
- Added user-owned RLS policies for all base-building tables.
- Added server-time RPC support through `base_server_now()`.
- Added atomic reward claiming through `claim_base_battle_reward(...)`.
- Hardened reward claiming so Supabase computes canonical rewards from `outcome` and `profiles.is_pro` instead of trusting client-provided coin totals.
- Added duplicate reward protection with primary key `(user_id, battle_result_id)`.
- Added app Supabase config using:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Linked the repo-side Supabase config to project ref `batwwcfqohysmrcosbix` and public URL `https://batwwcfqohysmrcosbix.supabase.co`.
- Tightened the V1 migration for Supabase Data API usage with authenticated grants, authenticated-only RLS policies, and explicit RPC execute grants.
- Added base save/load repository helpers for:
  - user bootstrap rows
  - base snapshot loading
  - profile/game-state/building upserts
  - active upgrade persist/clear
  - BattleResult reward claim RPC
- Kept quick-round combat protected: quick round still produces `BattleResult`; base-building owns Supabase economy writes.
- Applied the V1 migration to the live Supabase project `batwwcfqohysmrcosbix`.
- Verified the live project has all five tables, both RPCs, authenticated RLS policies, no schema lint errors, and no advisor issues.

## Guardrails Preserved

- No gems, XP, resources, Gold/Wood/Stone, English XP, or Vocab Mastered fields.
- No per-word tracking.
- No quiz attempt log table.
- No analytics event table.
- No heavy images or maps in Supabase.
- No separate free/pro table split.
- One active upgrade per user in V1.

## Verification

- Backend-focused smoke test passed: 42 tests.
- Live Supabase migration history matches local and remote at `20260529000000`.
- Live Supabase lint passed: no schema errors.
- Live Supabase advisors passed: no issues found.
- Live Supabase table check passed for:
  - `active_upgrades`
  - `battle_reward_claims`
  - `profiles`
  - `user_buildings`
  - `user_game_state`
- Live Supabase RPC check passed for:
  - `base_server_now`
  - `claim_base_battle_reward`
- Live Supabase RLS policy count check passed: 15 authenticated policies across the five V1 tables.
- Full automated suite passed: 256 tests.
- Android export build check passed in the previous backend verification pass.
- Graphify was updated after code/schema/test changes.

## Latest Backend Smoke Test

Run time: `2026-05-29 17:53:34 IST`

```bash
node --test tests/baseSupabaseClient.test.mjs tests/baseSupabaseRepository.test.mjs tests/baseSupabaseMigration.test.mjs tests/baseBackend.test.mjs tests/baseRewardBridge.test.mjs tests/quickRoundResult.test.mjs
npx supabase migration list --linked --workdir .
npx supabase db lint --linked --workdir .
npx supabase db advisors --linked --workdir .
npx supabase db query --linked --workdir . -o table "<table verification query>"
npx supabase db query --linked --workdir . -o table "<rpc verification query>"
npx supabase db query --linked --workdir . -o csv "<authenticated RLS policy-count query>"
npm test
```

Result:

- Backend smoke: 42 passed, 0 failed.
- Supabase remote migration: local `20260529000000`, remote `20260529000000`.
- Supabase schema lint: no schema errors found.
- Supabase advisors: no issues found.
- Table/RPC/RLS live checks: passed.
- Full suite: 256 passed, 0 failed.

## Remaining External Setup

- Add the real `EXPO_PUBLIC_SUPABASE_ANON_KEY` to local/build environments.
- Run a live authenticated save/load and duplicate reward claim smoke test.
