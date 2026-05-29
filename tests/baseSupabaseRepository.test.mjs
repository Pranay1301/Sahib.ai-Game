import assert from "node:assert/strict";
import test from "node:test";

import {
  createActiveUpgradeRecord
} from "../src/base/baseBackend.js";
import {
  BASE_BUILDING_IDS,
  BUILDING_STATES
} from "../src/base/baseConfig.js";
import {
  BASE_SUPABASE_RPC,
  claimBattleRewardWithSupabase,
  clearActiveUpgrade,
  createBaseUserBootstrapRows,
  getBaseServerTimestamp,
  initializeBaseUserRows,
  loadBaseUserRows,
  saveBaseUserRows,
  upsertActiveUpgrade
} from "../src/base/baseSupabaseRepository.js";

const USER_ID = "user_backend_supabase";
const STARTED_AT = "2026-05-29T10:00:00.000Z";
const SERVER_NOW = "2026-05-29T11:00:00.000Z";

test("base Supabase bootstrap rows match the simple backend schema defaults", () => {
  const rows = createBaseUserBootstrapRows({
    userId: USER_ID,
    profileOverrides: { language: "ar", is_pro: true },
    gameStateOverrides: { coins: 500 },
    palaceLevel: 2
  });

  assert.equal(rows.profile.user_id, USER_ID);
  assert.equal(rows.profile.language, "ar");
  assert.equal(rows.profile.is_pro, true);
  assert.equal(rows.profile.learning_track, "english");
  assert.equal(rows.gameState.coins, 500);
  assert.equal(rows.gameState.hearts_remaining, 4);
  assert.equal(rows.buildings.length, 7);
  assert.equal(
    rows.buildings.find((building) => building.building_id === BASE_BUILDING_IDS.PALACE).level,
    2
  );
  assert.equal(
    rows.buildings.find((building) => building.building_id === BASE_BUILDING_IDS.ATTACK_TOWER).state,
    BUILDING_STATES.AVAILABLE
  );
});

test("initializeBaseUserRows upserts profile, game state, and fixed building rows", async () => {
  const supabase = new FakeSupabaseClient();
  const rows = await initializeBaseUserRows({
    supabase,
    userId: USER_ID,
    gameStateOverrides: { coins: 100 }
  });

  assert.equal(rows.profile.user_id, USER_ID);
  assert.deepEqual(
    supabase.calls.map((call) => [call.table, call.method, call.options?.onConflict]),
    [
      ["profiles", "upsert", "user_id"],
      ["user_game_state", "upsert", "user_id"],
      ["user_buildings", "upsert", "user_id,building_id"]
    ]
  );
  assert.equal(supabase.calls[2].payload.length, 7);
});

test("loadBaseUserRows reads the complete base-building snapshot", async () => {
  const buildings = createBaseUserBootstrapRows({ userId: USER_ID }).buildings;
  const supabase = new FakeSupabaseClient({
    tableResponses: {
      profiles: {
        user_id: USER_ID,
        language: "en",
        learning_track: "english",
        is_pro: false,
        created_at: null
      },
      user_game_state: {
        user_id: USER_ID,
        coins: 300,
        hearts_remaining: 4,
        next_refill_at: null,
        skill_challenges_completed: 2,
        last_skill_result: null,
        has_seen_first_upgrade_pro_message: false
      },
      user_buildings: buildings,
      active_upgrades: null
    }
  });

  const snapshot = await loadBaseUserRows({ supabase, userId: USER_ID });

  assert.equal(snapshot.profile.user_id, USER_ID);
  assert.equal(snapshot.gameState.coins, 300);
  assert.equal(snapshot.buildings.length, 7);
  assert.equal(snapshot.activeUpgrade, null);
  assert.deepEqual(
    supabase.calls
      .map((call) => [call.table, call.method, call.filter?.field, call.filter?.value])
      .sort(compareCallRows),
    [
      ["profiles", "select.maybeSingle", "user_id", USER_ID],
      ["user_game_state", "select.maybeSingle", "user_id", USER_ID],
      ["user_buildings", "select", "user_id", USER_ID],
      ["active_upgrades", "select.maybeSingle", "user_id", USER_ID]
    ].sort(compareCallRows)
  );
});

test("active upgrade helpers persist one active upgrade and clear it by user", async () => {
  const supabase = new FakeSupabaseClient();
  const activeUpgrade = createActiveUpgradeRecord({
    userId: USER_ID,
    buildingId: BASE_BUILDING_IDS.PALACE,
    fromLevel: 1,
    startedAt: STARTED_AT
  });

  await upsertActiveUpgrade({ supabase, activeUpgrade });
  await clearActiveUpgrade({ supabase, userId: USER_ID });

  assert.deepEqual(
    supabase.calls.map((call) => [call.table, call.method, call.options?.onConflict ?? call.filter?.field]),
    [
      ["active_upgrades", "upsert", "user_id"],
      ["active_upgrades", "delete.eq", "user_id"]
    ]
  );
  assert.equal(supabase.calls[1].filter.value, USER_ID);
});

test("saveBaseUserRows writes selected base-building state and clears completed active upgrade", async () => {
  const supabase = new FakeSupabaseClient();
  const rows = createBaseUserBootstrapRows({
    userId: USER_ID,
    gameStateOverrides: { coins: 900 },
    palaceLevel: 2
  });

  const saved = await saveBaseUserRows({
    supabase,
    profile: rows.profile,
    gameState: rows.gameState,
    buildings: rows.buildings,
    activeUpgrade: null
  });

  assert.equal(saved.profile.user_id, USER_ID);
  assert.equal(saved.gameState.coins, 900);
  assert.equal(saved.buildings.length, 7);
  assert.equal(saved.activeUpgrade, null);
  assert.deepEqual(
    supabase.calls.map((call) => [call.table, call.method, call.options?.onConflict ?? call.filter?.field]),
    [
      ["profiles", "upsert", "user_id"],
      ["user_game_state", "upsert", "user_id"],
      ["user_buildings", "upsert", "user_id,building_id"],
      ["active_upgrades", "delete.eq", "user_id"]
    ]
  );
});

test("base server timestamp comes from Supabase RPC instead of device time", async () => {
  const supabase = new FakeSupabaseClient({
    rpcResponses: {
      [BASE_SUPABASE_RPC.SERVER_NOW]: { data: SERVER_NOW }
    }
  });

  const serverNow = await getBaseServerTimestamp({ supabase });

  assert.equal(serverNow, SERVER_NOW);
  assert.deepEqual(supabase.calls, [
    {
      method: "rpc",
      fn: BASE_SUPABASE_RPC.SERVER_NOW,
      params: undefined
    }
  ]);
});

test("claimBattleRewardWithSupabase uses atomic reward-claim RPC and applies Pro coins in base layer", async () => {
  const supabase = new FakeSupabaseClient({
    rpcResponses: {
      [BASE_SUPABASE_RPC.CLAIM_BATTLE_REWARD]: {
        data: [{
          accepted: true,
          result_reason: "claimed",
          coins: 1300,
          final_coins_awarded: 300,
          claimed_at: SERVER_NOW
        }]
      }
    }
  });
  const claim = await claimBattleRewardWithSupabase({
    supabase,
    userId: USER_ID,
    isPro: true,
    battleResult: createBattleResult()
  });

  assert.equal(claim.accepted, true);
  assert.equal(claim.reason, "claimed");
  assert.equal(claim.baseCoins, 100);
  assert.equal(claim.requestedFinalCoinsAwarded, 300);
  assert.equal(claim.finalCoinsAwarded, 300);
  assert.equal(claim.coins, 1300);
  assert.deepEqual(supabase.calls, [
    {
      method: "rpc",
      fn: BASE_SUPABASE_RPC.CLAIM_BATTLE_REWARD,
      params: {
        p_battle_result_id: "battle_result_backend_supabase",
        p_outcome: "win",
        p_reason: "enemy_core_destroyed",
        p_base_coins: 100,
        p_final_coins_awarded: 300
      }
    }
  ]);
});

test("claimBattleRewardWithSupabase rejects mismatched users before writing", async () => {
  const supabase = new FakeSupabaseClient();

  await assert.rejects(
    () => claimBattleRewardWithSupabase({
      supabase,
      userId: USER_ID,
      battleResult: createBattleResult({ userId: "other_user" })
    }),
    /does not match/
  );
  assert.equal(supabase.calls.length, 0);
});

function createBattleResult(overrides = {}) {
  return {
    battleResultId: "battle_result_backend_supabase",
    userId: USER_ID,
    outcome: "win",
    reason: "enemy_core_destroyed",
    baseCoins: 100,
    completedAt: "2026-05-29T10:20:00.000Z",
    elapsedSeconds: 120,
    durationSeconds: 480,
    coreMaxHp: 1000,
    playerCoreHp: 1000,
    enemyCoreHp: 0,
    playerCoreDamageDealt: 1000,
    enemyCoreDamageDealt: 0,
    ...overrides
  };
}

class FakeSupabaseClient {
  constructor({ rpcResponses = {}, tableResponses = {} } = {}) {
    this.calls = [];
    this.rpcResponses = rpcResponses;
    this.tableResponses = tableResponses;
  }

  from(table) {
    return {
      select: () => createSelectBuilder({
        calls: this.calls,
        table,
        response: this.tableResponses[table]
      }),
      upsert: (payload, options) => {
        this.calls.push({ method: "upsert", table, payload, options });
        return Promise.resolve({ data: payload, error: null });
      },
      delete: () => ({
        eq: (field, value) => {
          this.calls.push({
            method: "delete.eq",
            table,
            filter: { field, value }
          });
          return Promise.resolve({ data: null, error: null });
        }
      })
    };
  }

  rpc(fn, params) {
    this.calls.push({ method: "rpc", fn, params });
    return Promise.resolve(this.rpcResponses[fn] ?? { data: null, error: null });
  }
}

function createSelectBuilder({ calls, table, response }) {
  const builder = {
    filter: null,
    eq(field, value) {
      this.filter = { field, value };
      return this;
    },
    maybeSingle() {
      calls.push({
        method: "select.maybeSingle",
        table,
        filter: this.filter
      });
      return Promise.resolve({ data: response ?? null, error: null });
    },
    then(resolve, reject) {
      calls.push({
        method: "select",
        table,
        filter: this.filter
      });
      return Promise.resolve({ data: response ?? [], error: null }).then(resolve, reject);
    }
  };

  return builder;
}

function compareCallRows(left, right) {
  return left.join(":").localeCompare(right.join(":"));
}
