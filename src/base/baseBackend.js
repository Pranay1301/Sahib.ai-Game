import {
  BASE_BUILDING_DEFINITIONS,
  BASE_ECONOMY_CONFIG,
  LEARNING_TRACKS,
  calculateFinalCoins,
  getNextBuildingLevel,
  getTimerDurationMinutesForTargetLevel
} from "./baseConfig.js";
import { resolveBaseBuildingRows } from "./baseUnlocks.js";

export const BASE_BACKEND_TABLES = Object.freeze({
  PROFILES: "profiles",
  USER_GAME_STATE: "user_game_state",
  USER_BUILDINGS: "user_buildings",
  ACTIVE_UPGRADES: "active_upgrades",
  BATTLE_REWARD_CLAIMS: "battle_reward_claims"
});

export const BASE_BACKEND_SCHEMA = Object.freeze({
  [BASE_BACKEND_TABLES.PROFILES]: Object.freeze([
    "user_id",
    "language",
    "learning_track",
    "is_pro",
    "created_at"
  ]),
  [BASE_BACKEND_TABLES.USER_GAME_STATE]: Object.freeze([
    "user_id",
    "coins",
    "hearts_remaining",
    "next_refill_at",
    "skill_challenges_completed",
    "last_skill_result",
    "has_seen_first_upgrade_pro_message"
  ]),
  [BASE_BACKEND_TABLES.USER_BUILDINGS]: Object.freeze([
    "user_id",
    "building_id",
    "level",
    "state"
  ]),
  [BASE_BACKEND_TABLES.ACTIVE_UPGRADES]: Object.freeze([
    "user_id",
    "building_id",
    "from_level",
    "to_level",
    "started_at",
    "finishes_at",
    "timer_duration_minutes"
  ]),
  [BASE_BACKEND_TABLES.BATTLE_REWARD_CLAIMS]: Object.freeze([
    "battle_result_id",
    "user_id",
    "outcome",
    "reason",
    "base_coins",
    "final_coins_awarded",
    "claimed_at"
  ])
});

const FORBIDDEN_BACKEND_FIELDS = Object.freeze([
  "xp",
  "gems",
  "resources",
  "wood",
  "stone",
  "gold",
  "english_xp",
  "vocab_mastered"
]);

export function createDefaultProfile(userId, overrides = {}) {
  assertUserId(userId);

  return {
    user_id: userId,
    language: "en",
    learning_track: LEARNING_TRACKS.ENGLISH,
    is_pro: false,
    created_at: null,
    ...overrides
  };
}

export function createDefaultGameState(userId, overrides = {}) {
  assertUserId(userId);

  return {
    user_id: userId,
    coins: 0,
    hearts_remaining: BASE_ECONOMY_CONFIG.heartsMax,
    next_refill_at: null,
    skill_challenges_completed: 0,
    last_skill_result: null,
    has_seen_first_upgrade_pro_message: false,
    ...overrides
  };
}

export function createInitialUserBuildings(userId, options = {}) {
  assertUserId(userId);
  const palaceLevel = options.palaceLevel ?? BASE_ECONOMY_CONFIG.minBuildingLevel;
  const startingRows = BASE_BUILDING_DEFINITIONS.map((building) => ({
    user_id: userId,
    building_id: building.id,
    level: BASE_ECONOMY_CONFIG.minBuildingLevel,
    state: null
  }));

  return resolveBaseBuildingRows(startingRows, {
    palaceLevel,
    userId
  });
}

export function createActiveUpgradeRecord({
  userId,
  buildingId,
  fromLevel,
  startedAt,
  isPro = false
}) {
  assertUserId(userId);
  assertRequiredString(buildingId, "buildingId");
  assertIsoTimestamp(startedAt, "startedAt");

  const toLevel = getNextBuildingLevel(fromLevel);
  if (toLevel === null) {
    throw new RangeError(`Cannot create upgrade from level ${fromLevel}`);
  }

  const timerDurationMinutes = getTimerDurationMinutesForTargetLevel(toLevel, isPro);
  return {
    user_id: userId,
    building_id: buildingId,
    from_level: fromLevel,
    to_level: toLevel,
    started_at: startedAt,
    finishes_at: addMinutesToIsoTimestamp(startedAt, timerDurationMinutes),
    timer_duration_minutes: timerDurationMinutes
  };
}

export function createBattleRewardClaimRecord({
  battleResult,
  userId,
  isPro = false,
  claimedAt
}) {
  assertUserId(userId);
  assertBattleResult(battleResult);
  assertIsoTimestamp(claimedAt, "claimedAt");

  const baseCoins = Math.max(0, Math.floor(Number(battleResult.baseCoins) || 0));
  return {
    battle_result_id: battleResult.battleResultId,
    user_id: userId,
    outcome: battleResult.outcome,
    reason: battleResult.reason,
    base_coins: baseCoins,
    final_coins_awarded: calculateFinalCoins(baseCoins, isPro),
    claimed_at: claimedAt
  };
}

export function hasBattleRewardClaim(existingClaims, battleResultId, userId) {
  assertRequiredString(battleResultId, "battleResultId");
  assertUserId(userId);

  if (!Array.isArray(existingClaims)) {
    return false;
  }

  return existingClaims.some((claim) =>
    claim?.battle_result_id === battleResultId &&
    claim?.user_id === userId
  );
}

export function claimBattleReward({
  gameState,
  existingClaims = [],
  battleResult,
  userId,
  isPro = false,
  claimedAt
}) {
  assertUserId(userId);
  assertBattleResult(battleResult);

  if (hasBattleRewardClaim(existingClaims, battleResult.battleResultId, userId)) {
    return {
      accepted: false,
      reason: "duplicate_battle_reward_claim",
      gameState,
      claim: null
    };
  }

  const claim = createBattleRewardClaimRecord({
    battleResult,
    userId,
    isPro,
    claimedAt
  });

  return {
    accepted: true,
    reason: "claimed",
    gameState: {
      ...gameState,
      coins: Math.max(0, Number(gameState?.coins) || 0) + claim.final_coins_awarded
    },
    claim
  };
}

export function getForbiddenBackendFields() {
  return [...FORBIDDEN_BACKEND_FIELDS];
}

export function assertBackendSchemaHasNoForbiddenFields(schema = BASE_BACKEND_SCHEMA) {
  const forbidden = new Set(FORBIDDEN_BACKEND_FIELDS);
  const found = [];

  for (const fields of Object.values(schema)) {
    for (const field of fields) {
      if (forbidden.has(field)) {
        found.push(field);
      }
    }
  }

  if (found.length > 0) {
    throw new Error(`Forbidden base-building backend fields: ${found.join(", ")}`);
  }

  return true;
}

export function addMinutesToIsoTimestamp(isoTimestamp, minutes) {
  assertIsoTimestamp(isoTimestamp, "isoTimestamp");
  const safeMinutes = Number(minutes);
  if (!Number.isFinite(safeMinutes) || safeMinutes < 0) {
    throw new RangeError(`Invalid timer duration minutes: ${minutes}`);
  }

  return new Date(new Date(isoTimestamp).getTime() + safeMinutes * 60 * 1000).toISOString();
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
