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
- Added base save/load repository helpers for:
  - user bootstrap rows
  - base snapshot loading
  - profile/game-state/building upserts
  - active upgrade persist/clear
  - BattleResult reward claim RPC
- Kept quick-round combat protected: quick round still produces `BattleResult`; base-building owns Supabase economy writes.

## Guardrails Preserved

- No gems, XP, resources, Gold/Wood/Stone, English XP, or Vocab Mastered fields.
- No per-word tracking.
- No quiz attempt log table.
- No analytics event table.
- No heavy images or maps in Supabase.
- No separate free/pro table split.
- One active upgrade per user in V1.

## Verification

- Backend-focused tests passed.
- Full automated suite passed: 255 tests.
- Android export build check passed.
- Graphify was updated after code/schema changes.

## External Setup Still Needed

- Apply the migration to the real Supabase project.
- Add real Supabase values to local/build environment:
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Run Supabase CLI checks once the CLI/project access are available.
