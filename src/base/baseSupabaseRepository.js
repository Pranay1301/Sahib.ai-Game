import {
  BASE_BACKEND_TABLES,
  createDefaultGameState,
  createDefaultProfile,
  createInitialUserBuildings
} from "./baseBackend.js";
import {
  calculateFinalCoins
} from "./baseConfig.js";

export const BASE_SUPABASE_RPC = Object.freeze({
  SERVER_NOW: "base_server_now",
  CLAIM_BATTLE_REWARD: "claim_base_battle_reward"
});

export function createBaseUserBootstrapRows({
  userId,
  profileOverrides = {},
  gameStateOverrides = {},
  palaceLevel
} = {}) {
  assertUserId(userId);

  return {
    profile: createDefaultProfile(userId, profileOverrides),
    gameState: createDefaultGameState(userId, gameStateOverrides),
    buildings: createInitialUserBuildings(userId, { palaceLevel })
  };
}

export async function initializeBaseUserRows({
  supabase,
  userId,
  profileOverrides = {},
  gameStateOverrides = {},
  palaceLevel
} = {}) {
  const rows = createBaseUserBootstrapRows({
    userId,
    profileOverrides,
    gameStateOverrides,
    palaceLevel
  });

  await upsertBaseProfile({ supabase, profile: rows.profile });
  await upsertBaseGameState({ supabase, gameState: rows.gameState });
  await upsertBaseBuildings({ supabase, buildings: rows.buildings });

  return rows;
}

export async function loadBaseUserRows({ supabase, userId } = {}) {
  assertSupabaseClient(supabase);
  assertUserId(userId);

  const [profile, gameState, buildings, activeUpgrade] = await Promise.all([
    selectMaybeSingleUserRow({
      supabase,
      table: BASE_BACKEND_TABLES.PROFILES,
      userId,
      context: "load base profile"
    }),
    selectMaybeSingleUserRow({
      supabase,
      table: BASE_BACKEND_TABLES.USER_GAME_STATE,
      userId,
      context: "load base game state"
    }),
    selectUserRows({
      supabase,
      table: BASE_BACKEND_TABLES.USER_BUILDINGS,
      userId,
      context: "load base buildings"
    }),
    selectMaybeSingleUserRow({
      supabase,
      table: BASE_BACKEND_TABLES.ACTIVE_UPGRADES,
      userId,
      context: "load active upgrade"
    })
  ]);

  return {
    profile,
    gameState,
    buildings: Array.isArray(buildings) ? buildings : [],
    activeUpgrade
  };
}

export async function saveBaseUserRows({
  supabase,
  profile = null,
  gameState = null,
  buildings = null,
  activeUpgrade
} = {}) {
  assertSupabaseClient(supabase);

  const saved = {
    profile: null,
    gameState: null,
    buildings: null,
    activeUpgrade: undefined
  };

  if (profile) {
    saved.profile = await upsertBaseProfile({ supabase, profile });
  }

  if (gameState) {
    saved.gameState = await upsertBaseGameState({ supabase, gameState });
  }

  if (buildings) {
    saved.buildings = await upsertBaseBuildings({ supabase, buildings });
  }

  if (activeUpgrade === null) {
    const userId = profile?.user_id ?? gameState?.user_id ?? buildings?.[0]?.user_id;
    assertUserId(userId);
    saved.activeUpgrade = await clearActiveUpgrade({ supabase, userId });
  } else if (activeUpgrade) {
    saved.activeUpgrade = await upsertActiveUpgrade({ supabase, activeUpgrade });
  }

  return saved;
}

export async function upsertBaseProfile({ supabase, profile } = {}) {
  assertSupabaseClient(supabase);
  assertUserId(profile?.user_id);

  return expectSupabaseData(
    supabase
      .from(BASE_BACKEND_TABLES.PROFILES)
      .upsert(profile, { onConflict: "user_id" }),
    "upsert base profile"
  );
}

export async function upsertBaseGameState({ supabase, gameState } = {}) {
  assertSupabaseClient(supabase);
  assertUserId(gameState?.user_id);

  return expectSupabaseData(
    supabase
      .from(BASE_BACKEND_TABLES.USER_GAME_STATE)
      .upsert(gameState, { onConflict: "user_id" }),
    "upsert base game state"
  );
}

export async function upsertBaseBuildings({ supabase, buildings = [] } = {}) {
  assertSupabaseClient(supabase);
  if (!Array.isArray(buildings) || buildings.length === 0) {
    throw new TypeError("buildings must be a non-empty array");
  }

  for (const building of buildings) {
    assertUserId(building?.user_id);
    assertRequiredString(building?.building_id, "building.building_id");
  }

  return expectSupabaseData(
    supabase
      .from(BASE_BACKEND_TABLES.USER_BUILDINGS)
      .upsert(buildings, { onConflict: "user_id,building_id" }),
    "upsert base buildings"
  );
}

export async function upsertActiveUpgrade({ supabase, activeUpgrade } = {}) {
  assertSupabaseClient(supabase);
  assertUserId(activeUpgrade?.user_id);
  assertRequiredString(activeUpgrade?.building_id, "activeUpgrade.building_id");

  return expectSupabaseData(
    supabase
      .from(BASE_BACKEND_TABLES.ACTIVE_UPGRADES)
      .upsert(activeUpgrade, { onConflict: "user_id" }),
    "upsert active upgrade"
  );
}

export async function clearActiveUpgrade({ supabase, userId } = {}) {
  assertSupabaseClient(supabase);
  assertUserId(userId);

  return expectSupabaseData(
    supabase
      .from(BASE_BACKEND_TABLES.ACTIVE_UPGRADES)
      .delete()
      .eq("user_id", userId),
    "clear active upgrade"
  );
}

export async function getBaseServerTimestamp({ supabase } = {}) {
  assertSupabaseClient(supabase);
  const data = await expectSupabaseData(
    supabase.rpc(BASE_SUPABASE_RPC.SERVER_NOW),
    "read base server timestamp"
  );
  const timestamp = Array.isArray(data) ? data[0] : data;
  assertIsoTimestamp(timestamp, "base server timestamp");

  return timestamp;
}

export async function claimBattleRewardWithSupabase({
  supabase,
  battleResult,
  userId,
  isPro = false
} = {}) {
  assertSupabaseClient(supabase);
  assertUserId(userId);
  assertBattleResult(battleResult);

  if (battleResult.userId && battleResult.userId !== userId) {
    throw new Error("battleResult userId does not match the active base user");
  }

  const baseCoins = Math.max(0, Math.floor(Number(battleResult.baseCoins) || 0));
  const finalCoinsAwarded = calculateFinalCoins(baseCoins, isPro);
  const rpcRows = await expectSupabaseData(
    supabase.rpc(BASE_SUPABASE_RPC.CLAIM_BATTLE_REWARD, {
      p_battle_result_id: battleResult.battleResultId,
      p_outcome: battleResult.outcome,
      p_reason: battleResult.reason,
      p_base_coins: baseCoins,
      p_final_coins_awarded: finalCoinsAwarded
    }),
    "claim base battle reward"
  );
  const row = Array.isArray(rpcRows) ? rpcRows[0] : rpcRows;

  return {
    accepted: Boolean(row?.accepted),
    reason: row?.result_reason ?? null,
    coins: normalizeWholeNumber(row?.coins),
    finalCoinsAwarded: normalizeWholeNumber(row?.final_coins_awarded),
    claimedAt: row?.claimed_at ?? null,
    baseCoins,
    requestedFinalCoinsAwarded: finalCoinsAwarded
  };
}

function selectUserRows({ supabase, table, userId, context }) {
  return expectSupabaseData(
    supabase
      .from(table)
      .select("*")
      .eq("user_id", userId),
    context
  );
}

function selectMaybeSingleUserRow({ supabase, table, userId, context }) {
  return expectSupabaseData(
    supabase
      .from(table)
      .select("*")
      .eq("user_id", userId)
      .maybeSingle(),
    context
  );
}

async function expectSupabaseData(queryOrPromise, context) {
  const result = await queryOrPromise;
  if (result?.error) {
    throw new Error(`${context} failed: ${result.error.message ?? result.error}`);
  }

  return result?.data ?? null;
}

function assertSupabaseClient(supabase) {
  if (!supabase || typeof supabase.from !== "function" || typeof supabase.rpc !== "function") {
    throw new TypeError("supabase client with from() and rpc() is required");
  }
}

function assertBattleResult(battleResult) {
  if (!battleResult || typeof battleResult !== "object") {
    throw new TypeError("battleResult is required");
  }

  assertRequiredString(battleResult.battleResultId, "battleResult.battleResultId");
  assertRequiredString(battleResult.outcome, "battleResult.outcome");
  assertRequiredString(battleResult.reason, "battleResult.reason");
}

function assertUserId(userId) {
  assertRequiredString(userId, "userId");
}

function assertRequiredString(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}

function assertIsoTimestamp(value, name) {
  assertRequiredString(value, name);
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new TypeError(`${name} must be an ISO timestamp`);
  }
}

function normalizeWholeNumber(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
