# Base Building Task Completion Checklist — 2026-05-29

| Task | Status | Repo Evidence |
|---|---|---|
| Full base-building smoke test | Complete | Base-focused tests, direct V1 flow, full suite, Android export |
| End-of-day bug list and tomorrow plan | Complete | `docs/BASE_BUILDING_EOD_BUG_LIST_AND_TOMORROW_PLAN_2026-05-29.md` |
| Build check and fix fatal errors | Complete | `npm test` and Android export pass |
| Write end-of-day backend completion report | Complete | `docs/BASE_BACKEND_COMPLETION_REPORT_2026-05-29.md` |
| Run backend smoke test | Complete | Backend-focused test command passes |
| Mock BattleResult reward integration | Complete | `src/game/quickRoundResult.js`, `src/base/baseRewardBridge.js`, repository RPC wrapper tests |
| Generate and review simple V1 Supabase SQL schema | Complete | `supabase/migrations/20260529000000_base_building_v1.sql` |
| Confirm all base-building phases completed | Complete | Phase 0-15 tests and smoke checks pass |
| Add duplicate reward claim protection | Complete | `(user_id, battle_result_id)` primary key and `claim_base_battle_reward` duplicate path |
| Add Supabase config to app | Complete | `src/base/baseSupabaseClient.js`, `.env.example`, README env note with project URL |
| Connect save/load for base-building state | Complete | `src/base/baseSupabaseRepository.js` load/save helpers |
| Create Supabase tables | Complete | Migration defines five V1 tables |
| Finish any incomplete base-building phase | Complete | No incomplete V1 phase remains in automated coverage |
| Run backend build check and fix fatal errors | Complete | Backend-focused tests and Android export pass |
| Check Supabase access and project setup | Complete | MCP registered/authenticated, CLI checked, project ref documented in `docs/SUPABASE_ACCESS_AND_PROJECT_SETUP_CHECK_2026-05-29.md` |

## External Limitation

The real Supabase project is linked by project ref and URL, but the live migration still needs CLI token access or refreshed MCP database tools. `EXPO_PUBLIC_SUPABASE_ANON_KEY` must remain outside source control and be set in the local/build environment.
