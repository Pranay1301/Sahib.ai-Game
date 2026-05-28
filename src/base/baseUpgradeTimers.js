import {
  createActiveUpgradeRecord
} from "./baseBackend.js";
import {
  BASE_ECONOMY_CONFIG,
  BUILDING_STATES,
  getNextBuildingLevel,
  getUpgradeCostForTargetLevel
} from "./baseConfig.js";

export const BASE_UPGRADE_TIMER_REASONS = Object.freeze({
  CHALLENGE_STARTED: "challenge_started",
  TIMER_STARTED: "timer_started",
  UPGRADE_COMPLETED: "upgrade_completed",
  ACTIVE_UPGRADE_EXISTS: "active_upgrade_exists",
  BUILDING_NOT_AVAILABLE: "building_not_available",
  BUILDING_NOT_QUIZ_REQUIRED: "building_not_quiz_required",
  INSUFFICIENT_COINS: "insufficient_coins",
  SKILL_CHALLENGE_NOT_PASSED: "skill_challenge_not_passed",
  TIMER_NOT_COMPLETE: "timer_not_complete"
});

export function startBuildingUpgradeChallenge({
  gameState = {},
  buildingRow,
  existingActiveUpgrades = [],
  isTutorialUpgrade = false
} = {}) {
  assertBuildingRow(buildingRow);
  const activeUpgrade = getActiveUpgrade(existingActiveUpgrades, buildingRow.user_id);
  if (activeUpgrade) {
    return rejectUpgradeStart({
      reason: BASE_UPGRADE_TIMER_REASONS.ACTIVE_UPGRADE_EXISTS,
      gameState,
      buildingRow
    });
  }

  if (buildingRow.state !== BUILDING_STATES.AVAILABLE) {
    return rejectUpgradeStart({
      reason: BASE_UPGRADE_TIMER_REASONS.BUILDING_NOT_AVAILABLE,
      gameState,
      buildingRow
    });
  }

  const targetLevel = getNextBuildingLevel(buildingRow.level);
  if (targetLevel === null) {
    return rejectUpgradeStart({
      reason: BASE_UPGRADE_TIMER_REASONS.BUILDING_NOT_AVAILABLE,
      gameState,
      buildingRow
    });
  }

  const coinCost = getUpgradeCostForTargetLevel(targetLevel, {
    isTutorialUpgrade
  });
  const availableCoins = normalizeWholeNumber(gameState.coins);
  if (availableCoins < coinCost) {
    return rejectUpgradeStart({
      reason: BASE_UPGRADE_TIMER_REASONS.INSUFFICIENT_COINS,
      gameState,
      buildingRow,
      coinCost
    });
  }

  return {
    accepted: true,
    reason: BASE_UPGRADE_TIMER_REASONS.CHALLENGE_STARTED,
    coinCost,
    targetLevel,
    gameState: {
      ...gameState,
      coins: availableCoins - coinCost
    },
    buildingRow: {
      ...buildingRow,
      state: BUILDING_STATES.QUIZ_REQUIRED
    }
  };
}

export function startUpgradeTimerAfterSkillChallenge({
  userId = null,
  buildingRow,
  skillResult = null,
  existingActiveUpgrades = [],
  isPro = false,
  serverStartedAt
} = {}) {
  assertBuildingRow(buildingRow);
  const resolvedUserId = userId ?? buildingRow.user_id;
  assertRequiredString(resolvedUserId, "userId");
  assertIsoTimestamp(serverStartedAt, "serverStartedAt");

  const activeUpgrade = getActiveUpgrade(existingActiveUpgrades, resolvedUserId);
  if (activeUpgrade) {
    return rejectTimerStart({
      reason: BASE_UPGRADE_TIMER_REASONS.ACTIVE_UPGRADE_EXISTS,
      buildingRow
    });
  }

  if (buildingRow.state !== BUILDING_STATES.QUIZ_REQUIRED) {
    return rejectTimerStart({
      reason: BASE_UPGRADE_TIMER_REASONS.BUILDING_NOT_QUIZ_REQUIRED,
      buildingRow
    });
  }

  if (!skillResult?.passed) {
    return rejectTimerStart({
      reason: BASE_UPGRADE_TIMER_REASONS.SKILL_CHALLENGE_NOT_PASSED,
      buildingRow
    });
  }

  const activeUpgradeRecord = createActiveUpgradeRecord({
    userId: resolvedUserId,
    buildingId: buildingRow.building_id,
    fromLevel: buildingRow.level,
    startedAt: serverStartedAt,
    isPro
  });

  return {
    accepted: true,
    reason: BASE_UPGRADE_TIMER_REASONS.TIMER_STARTED,
    activeUpgrade: activeUpgradeRecord,
    buildingRow: {
      ...buildingRow,
      state: BUILDING_STATES.UPGRADING
    },
    timerStatus: createUpgradeTimerStatus({
      activeUpgrade: activeUpgradeRecord,
      serverNow: serverStartedAt
    })
  };
}

export function completeUpgradeTimer({
  activeUpgrade,
  buildingRow,
  serverNow
} = {}) {
  assertActiveUpgrade(activeUpgrade);
  assertBuildingRow(buildingRow);
  const timerStatus = createUpgradeTimerStatus({
    activeUpgrade,
    serverNow
  });

  if (!timerStatus.isComplete) {
    return {
      accepted: false,
      reason: BASE_UPGRADE_TIMER_REASONS.TIMER_NOT_COMPLETE,
      activeUpgrade,
      buildingRow,
      timerStatus
    };
  }

  const completedLevel = clampWholeNumber(
    activeUpgrade.to_level,
    BASE_ECONOMY_CONFIG.minBuildingLevel,
    BASE_ECONOMY_CONFIG.maxBuildingLevel
  );

  return {
    accepted: true,
    reason: BASE_UPGRADE_TIMER_REASONS.UPGRADE_COMPLETED,
    activeUpgrade: null,
    clearedActiveUpgrade: true,
    completedAt: serverNow,
    timerStatus,
    buildingRow: {
      ...buildingRow,
      level: completedLevel,
      state: completedLevel >= BASE_ECONOMY_CONFIG.maxBuildingLevel
        ? BUILDING_STATES.MAX_LEVEL
        : BUILDING_STATES.AVAILABLE
    }
  };
}

export function createUpgradeTimerStatus({
  activeUpgrade,
  serverNow
} = {}) {
  assertActiveUpgrade(activeUpgrade);
  assertIsoTimestamp(serverNow, "serverNow");

  const startedMs = Date.parse(activeUpgrade.started_at);
  const finishesMs = Date.parse(activeUpgrade.finishes_at);
  const serverNowMs = Date.parse(serverNow);
  const totalMs = Math.max(0, finishesMs - startedMs);
  const elapsedMs = clampNumber(serverNowMs - startedMs, 0, totalMs);
  const remainingMs = Math.max(0, finishesMs - serverNowMs);

  return {
    buildingId: activeUpgrade.building_id,
    fromLevel: activeUpgrade.from_level,
    toLevel: activeUpgrade.to_level,
    startedAt: activeUpgrade.started_at,
    finishesAt: activeUpgrade.finishes_at,
    serverNow,
    durationMinutes: activeUpgrade.timer_duration_minutes,
    elapsedMinutes: millisecondsToWholeMinutes(elapsedMs),
    remainingMinutes: millisecondsToWholeMinutes(remainingMs),
    progress: totalMs === 0 ? 1 : elapsedMs / totalMs,
    isComplete: serverNowMs >= finishesMs
  };
}

export function createUpgradeTimerViewModel({
  activeUpgrade,
  serverNow
} = {}) {
  if (!activeUpgrade || !serverNow) {
    return null;
  }

  const status = createUpgradeTimerStatus({
    activeUpgrade,
    serverNow
  });

  return {
    ...status,
    progressPercent: Math.round(status.progress * 100)
  };
}

export function getActiveUpgrade(existingActiveUpgrades = [], userId = null) {
  const activeUpgrades = Array.isArray(existingActiveUpgrades)
    ? existingActiveUpgrades
    : existingActiveUpgrades
      ? [existingActiveUpgrades]
      : [];

  return activeUpgrades.find((activeUpgrade) => {
    if (!activeUpgrade || typeof activeUpgrade !== "object") {
      return false;
    }
    if (!userId) {
      return true;
    }

    return activeUpgrade.user_id === userId;
  }) ?? null;
}

export function hasActiveUpgrade(existingActiveUpgrades = [], userId = null) {
  return Boolean(getActiveUpgrade(existingActiveUpgrades, userId));
}

function rejectUpgradeStart({
  reason,
  gameState,
  buildingRow,
  coinCost = null
}) {
  return {
    accepted: false,
    reason,
    coinCost,
    gameState,
    buildingRow
  };
}

function rejectTimerStart({
  reason,
  buildingRow
}) {
  return {
    accepted: false,
    reason,
    activeUpgrade: null,
    buildingRow,
    timerStatus: null
  };
}

function assertBuildingRow(buildingRow) {
  if (!buildingRow || typeof buildingRow !== "object") {
    throw new TypeError("buildingRow is required");
  }

  assertRequiredString(buildingRow.building_id, "buildingRow.building_id");
  if (!Number.isInteger(Number(buildingRow.level))) {
    throw new TypeError("buildingRow.level must be an integer");
  }
}

function assertActiveUpgrade(activeUpgrade) {
  if (!activeUpgrade || typeof activeUpgrade !== "object") {
    throw new TypeError("activeUpgrade is required");
  }

  assertRequiredString(activeUpgrade.user_id, "activeUpgrade.user_id");
  assertRequiredString(activeUpgrade.building_id, "activeUpgrade.building_id");
  assertIsoTimestamp(activeUpgrade.started_at, "activeUpgrade.started_at");
  assertIsoTimestamp(activeUpgrade.finishes_at, "activeUpgrade.finishes_at");
  if (!Number.isInteger(Number(activeUpgrade.from_level))) {
    throw new TypeError("activeUpgrade.from_level must be an integer");
  }
  if (!Number.isInteger(Number(activeUpgrade.to_level))) {
    throw new TypeError("activeUpgrade.to_level must be an integer");
  }
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

function millisecondsToWholeMinutes(milliseconds) {
  return Math.ceil(Math.max(0, milliseconds) / (60 * 1000));
}

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value) || 0));
}

function clampWholeNumber(value, min, max) {
  return Math.max(min, Math.min(max, normalizeWholeNumber(value)));
}

function normalizeWholeNumber(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
