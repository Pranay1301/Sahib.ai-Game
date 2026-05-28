import {
  BASE_BUILDING_DEFINITIONS,
  BASE_BUILDING_IDS,
  BASE_ECONOMY_CONFIG,
  BUILDING_STATES,
  getBuildingDefinition,
  isBuildingUnlocked
} from "./baseConfig.js";

export const BASE_BUILDING_TAP_ACTIONS = Object.freeze({
  LOCKED_REQUIREMENT: "locked_requirement",
  UPGRADE_AVAILABLE: "upgrade_available",
  QUIZ_REQUIRED: "quiz_required",
  UPGRADING: "upgrading",
  COMPLETED: "completed",
  MAX_LEVEL: "max_level",
  UNKNOWN: "unknown"
});

export function getPalaceLevelFromBuildings(buildings = []) {
  const palace = Array.isArray(buildings)
    ? buildings.find((building) => building?.building_id === BASE_BUILDING_IDS.PALACE)
    : null;

  return clampWholeNumber(
    palace?.level ?? BASE_ECONOMY_CONFIG.minBuildingLevel,
    BASE_ECONOMY_CONFIG.minBuildingLevel,
    BASE_ECONOMY_CONFIG.maxBuildingLevel
  );
}

export function getBuildingUnlockRequirement(buildingId) {
  const definition = getBuildingDefinition(buildingId);
  if (!definition || definition.unlock.type === "start") {
    return null;
  }

  if (definition.unlock.type === "palace_level") {
    return {
      type: "palace_level",
      palaceLevel: definition.unlock.palaceLevel
    };
  }

  return null;
}

export function resolveBaseBuildingRows(buildings = [], options = {}) {
  const source = Array.isArray(buildings) ? buildings : [];
  const userId =
    options.userId ??
    source.find((building) => typeof building?.user_id === "string" && building.user_id.length > 0)
      ?.user_id ??
    null;
  const palaceLevel = clampWholeNumber(
    options.palaceLevel ?? getPalaceLevelFromBuildings(source),
    BASE_ECONOMY_CONFIG.minBuildingLevel,
    BASE_ECONOMY_CONFIG.maxBuildingLevel
  );

  return BASE_BUILDING_DEFINITIONS.map((definition) => {
    const row = source.find((building) => building?.building_id === definition.id);
    const level = clampWholeNumber(
      row?.level ?? BASE_ECONOMY_CONFIG.minBuildingLevel,
      BASE_ECONOMY_CONFIG.minBuildingLevel,
      BASE_ECONOMY_CONFIG.maxBuildingLevel
    );
    const unlocked = isBuildingUnlocked(definition, palaceLevel);

    return {
      user_id: row?.user_id ?? userId,
      building_id: definition.id,
      level,
      state: resolveBuildingState({
        requestedState: row?.state,
        unlocked,
        level
      })
    };
  });
}

export function resolveBuildingState({ requestedState = null, unlocked = false, level = 1 } = {}) {
  const safeLevel = clampWholeNumber(
    level,
    BASE_ECONOMY_CONFIG.minBuildingLevel,
    BASE_ECONOMY_CONFIG.maxBuildingLevel
  );

  if (safeLevel >= BASE_ECONOMY_CONFIG.maxBuildingLevel) {
    return BUILDING_STATES.MAX_LEVEL;
  }

  if (!unlocked) {
    return BUILDING_STATES.LOCKED;
  }

  if (
    Object.values(BUILDING_STATES).includes(requestedState) &&
    requestedState !== BUILDING_STATES.LOCKED
  ) {
    return requestedState;
  }

  return BUILDING_STATES.AVAILABLE;
}

export function createBuildingTapResult(slot) {
  const base = {
    buildingId: slot?.buildingId ?? null,
    slotId: slot?.slotId ?? null
  };

  if (!slot || typeof slot !== "object") {
    return {
      ...base,
      action: BASE_BUILDING_TAP_ACTIONS.UNKNOWN
    };
  }

  if (slot.state === BUILDING_STATES.LOCKED) {
    return {
      ...base,
      action: BASE_BUILDING_TAP_ACTIONS.LOCKED_REQUIREMENT,
      labelKey: slot.lockedRequirement?.labelKey ?? null,
      label: slot.lockedRequirement?.label ?? null,
      requirement: slot.lockedRequirement ?? null
    };
  }

  if (slot.state === BUILDING_STATES.AVAILABLE) {
    return createProgressiveTapResult(slot, BASE_BUILDING_TAP_ACTIONS.UPGRADE_AVAILABLE);
  }

  if (slot.state === BUILDING_STATES.QUIZ_REQUIRED) {
    return createProgressiveTapResult(slot, BASE_BUILDING_TAP_ACTIONS.QUIZ_REQUIRED);
  }

  if (slot.state === BUILDING_STATES.UPGRADING) {
    return createProgressiveTapResult(slot, BASE_BUILDING_TAP_ACTIONS.UPGRADING);
  }

  if (slot.state === BUILDING_STATES.COMPLETED) {
    return createProgressiveTapResult(slot, BASE_BUILDING_TAP_ACTIONS.COMPLETED);
  }

  if (slot.state === BUILDING_STATES.MAX_LEVEL) {
    return createProgressiveTapResult(slot, BASE_BUILDING_TAP_ACTIONS.MAX_LEVEL);
  }

  return {
    ...base,
    action: BASE_BUILDING_TAP_ACTIONS.UNKNOWN,
    level: slot.level ?? null,
    state: slot.state ?? null
  };
}

function createProgressiveTapResult(slot, action) {
  return {
    action,
    buildingId: slot.buildingId ?? null,
    slotId: slot.slotId ?? null,
    level: slot.level ?? null,
    state: slot.state ?? null
  };
}

function clampWholeNumber(value, min, max) {
  return Math.max(min, Math.min(max, normalizeWholeNumber(value)));
}

function normalizeWholeNumber(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
