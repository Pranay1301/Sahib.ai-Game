import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_IDS,
  BUILDING_STATES
} from "../src/base/baseConfig.js";
import {
  BASE_BACKEND_SCHEMA,
  BASE_BACKEND_TABLES,
  addMinutesToIsoTimestamp,
  assertBackendSchemaHasNoForbiddenFields,
  claimBattleReward,
  createActiveUpgradeRecord,
  createBattleRewardClaimRecord,
  createDefaultGameState,
  createDefaultProfile,
  createInitialUserBuildings,
  getForbiddenBackendFields,
  hasBattleRewardClaim
} from "../src/base/baseBackend.js";

const USER_ID = "user_phase3";
const STARTED_AT = "2026-05-27T12:00:00.000Z";
const CLAIMED_AT = "2026-05-27T12:10:00.000Z";

test("Phase 3 backend schema exposes the required Supabase V1 tables", () => {
  assert.deepEqual(Object.values(BASE_BACKEND_TABLES), [
    "profiles",
    "user_game_state",
    "user_buildings",
    "active_upgrades",
    "battle_reward_claims"
  ]);

  assert.deepEqual(BASE_BACKEND_SCHEMA.profiles, [
    "user_id",
    "language",
    "learning_track",
    "is_pro",
    "created_at"
  ]);
  assert.ok(BASE_BACKEND_SCHEMA.user_game_state.includes("coins"));
  assert.ok(BASE_BACKEND_SCHEMA.user_game_state.includes("hearts_remaining"));
  assert.ok(BASE_BACKEND_SCHEMA.active_upgrades.includes("timer_duration_minutes"));
  assert.ok(BASE_BACKEND_SCHEMA.battle_reward_claims.includes("final_coins_awarded"));
});

test("backend schema rejects forbidden V1 economy and XP fields", () => {
  assert.deepEqual(getForbiddenBackendFields(), [
    "xp",
    "gems",
    "resources",
    "wood",
    "stone",
    "gold",
    "english_xp",
    "vocab_mastered"
  ]);
  assert.equal(assertBackendSchemaHasNoForbiddenFields(), true);
  assert.throws(
    () => assertBackendSchemaHasNoForbiddenFields({ bad_table: ["user_id", "gems"] }),
    /Forbidden base-building backend fields/
  );
});

test("default profile and game state match the minimal Supabase plan", () => {
  assert.deepEqual(createDefaultProfile(USER_ID), {
    user_id: USER_ID,
    language: "en",
    learning_track: "english",
    is_pro: false,
    created_at: null
  });

  assert.deepEqual(createDefaultGameState(USER_ID), {
    user_id: USER_ID,
    coins: 0,
    hearts_remaining: 4,
    next_refill_at: null,
    skill_challenges_completed: 0,
    last_skill_result: null,
    has_seen_first_upgrade_pro_message: false
  });
});

test("initial buildings create seven fixed-slot rows with Palace-based unlock state", () => {
  const initial = createInitialUserBuildings(USER_ID);
  assert.equal(initial.length, 7);
  assert.equal(initial.find((building) => building.building_id === BASE_BUILDING_IDS.PALACE).state, BUILDING_STATES.AVAILABLE);
  assert.equal(initial.find((building) => building.building_id === BASE_BUILDING_IDS.LEARNING_HALL).state, BUILDING_STATES.AVAILABLE);
  assert.equal(initial.find((building) => building.building_id === BASE_BUILDING_IDS.ATTACK_TOWER).state, BUILDING_STATES.LOCKED);
  assert.equal(initial.find((building) => building.building_id === BASE_BUILDING_IDS.TREASURY).state, BUILDING_STATES.LOCKED);
  assert.ok(initial.every((building) => building.user_id === USER_ID));
  assert.ok(initial.every((building) => building.level === 1));

  const palaceLevelTwo = createInitialUserBuildings(USER_ID, { palaceLevel: 2 });
  assert.equal(palaceLevelTwo.find((building) => building.building_id === BASE_BUILDING_IDS.PALACE).level, 2);
  assert.equal(palaceLevelTwo.find((building) => building.building_id === BASE_BUILDING_IDS.ATTACK_TOWER).state, BUILDING_STATES.AVAILABLE);
  assert.equal(palaceLevelTwo.find((building) => building.building_id === BASE_BUILDING_IDS.TREASURY).state, BUILDING_STATES.AVAILABLE);
  assert.equal(palaceLevelTwo.find((building) => building.building_id === BASE_BUILDING_IDS.WALL_GATE).state, BUILDING_STATES.LOCKED);
});

test("active upgrade records lock timer duration from provided server timestamp", () => {
  const freeRecord = createActiveUpgradeRecord({
    userId: USER_ID,
    buildingId: BASE_BUILDING_IDS.PALACE,
    fromLevel: 1,
    startedAt: STARTED_AT,
    isPro: false
  });
  assert.deepEqual(freeRecord, {
    user_id: USER_ID,
    building_id: BASE_BUILDING_IDS.PALACE,
    from_level: 1,
    to_level: 2,
    started_at: STARTED_AT,
    finishes_at: "2026-05-27T13:00:00.000Z",
    timer_duration_minutes: 60
  });

  const proRecord = createActiveUpgradeRecord({
    userId: USER_ID,
    buildingId: BASE_BUILDING_IDS.PALACE,
    fromLevel: 1,
    startedAt: STARTED_AT,
    isPro: true
  });
  assert.equal(proRecord.finishes_at, "2026-05-27T12:12:00.000Z");
  assert.equal(proRecord.timer_duration_minutes, 12);
});

test("active upgrade records require explicit server timestamp input", () => {
  assert.throws(
    () => createActiveUpgradeRecord({
      userId: USER_ID,
      buildingId: BASE_BUILDING_IDS.PALACE,
      fromLevel: 1
    }),
    /startedAt must be a non-empty string/
  );
  assert.throws(
    () => createActiveUpgradeRecord({
      userId: USER_ID,
      buildingId: BASE_BUILDING_IDS.PALACE,
      fromLevel: 6,
      startedAt: STARTED_AT
    }),
    /Cannot create upgrade/
  );
});

test("battle reward claim records store base coins and final Pro coins separately", () => {
  const claim = createBattleRewardClaimRecord({
    battleResult: createBattleResult({ outcome: "win", baseCoins: 100 }),
    userId: USER_ID,
    isPro: true,
    claimedAt: CLAIMED_AT
  });

  assert.deepEqual(claim, {
    battle_result_id: "battle_result_win",
    user_id: USER_ID,
    outcome: "win",
    reason: "enemy_core_destroyed",
    base_coins: 100,
    final_coins_awarded: 300,
    claimed_at: CLAIMED_AT
  });
});

test("reward claim lookup is user-scoped and BattleResult-scoped", () => {
  const claims = [
    {
      battle_result_id: "battle_result_win",
      user_id: USER_ID
    },
    {
      battle_result_id: "battle_result_win",
      user_id: "other_user"
    }
  ];

  assert.equal(hasBattleRewardClaim(claims, "battle_result_win", USER_ID), true);
  assert.equal(hasBattleRewardClaim(claims, "battle_result_loss", USER_ID), false);
  assert.equal(hasBattleRewardClaim([], "battle_result_win", USER_ID), false);
});

test("claimBattleReward adds coins once and blocks duplicate reward claims", () => {
  const gameState = createDefaultGameState(USER_ID, { coins: 50 });
  const battleResult = createBattleResult({ outcome: "draw", baseCoins: 50 });
  const firstClaim = claimBattleReward({
    gameState,
    existingClaims: [],
    battleResult,
    userId: USER_ID,
    isPro: false,
    claimedAt: CLAIMED_AT
  });

  assert.equal(firstClaim.accepted, true);
  assert.equal(firstClaim.reason, "claimed");
  assert.equal(firstClaim.gameState.coins, 100);
  assert.equal(firstClaim.claim.final_coins_awarded, 50);

  const duplicate = claimBattleReward({
    gameState: firstClaim.gameState,
    existingClaims: [firstClaim.claim],
    battleResult,
    userId: USER_ID,
    claimedAt: CLAIMED_AT
  });

  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.reason, "duplicate_battle_reward_claim");
  assert.equal(duplicate.gameState.coins, 100);
  assert.equal(duplicate.claim, null);
});

test("timestamp helper is deterministic for server timestamp arithmetic", () => {
  assert.equal(addMinutesToIsoTimestamp(STARTED_AT, 90), "2026-05-27T13:30:00.000Z");
  assert.throws(() => addMinutesToIsoTimestamp("not-a-date", 30), /ISO timestamp/);
  assert.throws(() => addMinutesToIsoTimestamp(STARTED_AT, -1), /Invalid timer duration/);
});

function createBattleResult(overrides = {}) {
  const outcome = overrides.outcome ?? "win";
  return {
    battleResultId: overrides.battleResultId ?? `battle_result_${outcome}`,
    userId: USER_ID,
    outcome,
    reason: overrides.reason ?? "enemy_core_destroyed",
    baseCoins: overrides.baseCoins ?? 100,
    completedAt: "2026-05-27T12:05:00.000Z",
    elapsedSeconds: 120,
    durationSeconds: 480,
    coreMaxHp: 1000,
    playerCoreHp: 1000,
    enemyCoreHp: 0,
    playerCoreDamageDealt: 1000,
    enemyCoreDamageDealt: 0
  };
}
