export const LEARNING_TRACKS = Object.freeze({
  ENGLISH: "english",
  AI_AGENTS: "ai_agents"
});

export const BASE_BUILDING_IDS = Object.freeze({
  PALACE: "palace",
  LEARNING_HALL: "learning_hall",
  ATTACK_TOWER: "attack_tower",
  TREASURY: "treasury",
  WALL_GATE: "wall_gate",
  DRONE_STATION: "drone_station",
  TROPHY_HALL: "trophy_hall"
});

export const BASE_SLOT_IDS = Object.freeze({
  PALACE: "slot_palace",
  LEARNING_HALL: "slot_learning_hall",
  ATTACK_TOWER: "slot_attack_tower",
  TREASURY: "slot_treasury",
  WALL_GATE: "slot_wall_gate",
  DRONE_STATION: "slot_drone_station",
  TROPHY_HALL: "slot_trophy_hall"
});

export const BUILDING_STATES = Object.freeze({
  LOCKED: "locked",
  AVAILABLE: "available",
  QUIZ_REQUIRED: "quiz_required",
  UPGRADING: "upgrading",
  COMPLETED: "completed",
  MAX_LEVEL: "max_level"
});

export const BASE_ECONOMY_CONFIG = Object.freeze({
  rewards: Object.freeze({
    win: 100,
    draw: 50,
    loss: 25
  }),
  proCoinMultiplier: 3,
  minBuildingLevel: 1,
  maxBuildingLevel: 6,
  upgradeCostsByTargetLevel: Object.freeze({
    2: 3000,
    3: 8000,
    4: 20000,
    5: 50000,
    6: 100000
  }),
  timersMinutesByTargetLevel: Object.freeze({
    2: 60,
    3: 180,
    4: 360,
    5: 720,
    6: 1440
  }),
  proTimerMultiplier: 0.2,
  heartsMax: 4,
  heartRefillMinutes: 30
});

export const BASE_BUILDING_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: BASE_BUILDING_IDS.PALACE,
    slotId: BASE_SLOT_IDS.PALACE,
    label: "Palace / Main Core",
    purpose: "Main kingdom anchor",
    unlock: Object.freeze({ type: "start" })
  }),
  Object.freeze({
    id: BASE_BUILDING_IDS.LEARNING_HALL,
    slotId: BASE_SLOT_IDS.LEARNING_HALL,
    label: "Learning Hall / Library",
    purpose: "Skill-learning symbol",
    unlock: Object.freeze({ type: "start" })
  }),
  Object.freeze({
    id: BASE_BUILDING_IDS.ATTACK_TOWER,
    slotId: BASE_SLOT_IDS.ATTACK_TOWER,
    label: "Attack Tower",
    purpose: "Defense identity / visual progress",
    unlock: Object.freeze({ type: "palace_level", palaceLevel: 2 })
  }),
  Object.freeze({
    id: BASE_BUILDING_IDS.TREASURY,
    slotId: BASE_SLOT_IDS.TREASURY,
    label: "Treasury / Coin Vault",
    purpose: "Coin/economy identity",
    unlock: Object.freeze({ type: "palace_level", palaceLevel: 2 })
  }),
  Object.freeze({
    id: BASE_BUILDING_IDS.WALL_GATE,
    slotId: BASE_SLOT_IDS.WALL_GATE,
    label: "Wall Gate / Defense Wall",
    purpose: "Base defense identity",
    unlock: Object.freeze({ type: "palace_level", palaceLevel: 3 })
  }),
  Object.freeze({
    id: BASE_BUILDING_IDS.DRONE_STATION,
    slotId: BASE_SLOT_IDS.DRONE_STATION,
    label: "Drone Station",
    purpose: "AI/future-tech identity",
    unlock: Object.freeze({ type: "palace_level", palaceLevel: 4 })
  }),
  Object.freeze({
    id: BASE_BUILDING_IDS.TROPHY_HALL,
    slotId: BASE_SLOT_IDS.TROPHY_HALL,
    label: "Trophy Hall",
    purpose: "Status/progress identity",
    unlock: Object.freeze({ type: "palace_level", palaceLevel: 5 })
  })
]);

export function getBuildingDefinition(buildingId) {
  return BASE_BUILDING_DEFINITIONS.find((building) => building.id === buildingId) ?? null;
}

export function getBaseCoinsForOutcome(outcome) {
  return BASE_ECONOMY_CONFIG.rewards[outcome] ?? 0;
}

export function calculateFinalCoins(baseCoins, isPro = false) {
  const safeBaseCoins = Math.max(0, Math.floor(Number(baseCoins) || 0));
  return safeBaseCoins * (isPro ? BASE_ECONOMY_CONFIG.proCoinMultiplier : 1);
}

export function getUpgradeCostForTargetLevel(targetLevel, options = {}) {
  if (options.isTutorialUpgrade) {
    return 0;
  }

  assertTargetLevel(targetLevel);
  return BASE_ECONOMY_CONFIG.upgradeCostsByTargetLevel[targetLevel];
}

export function getFreeTimerMinutesForTargetLevel(targetLevel) {
  assertTargetLevel(targetLevel);
  return BASE_ECONOMY_CONFIG.timersMinutesByTargetLevel[targetLevel];
}

export function getTimerDurationMinutesForTargetLevel(targetLevel, isPro = false) {
  const freeMinutes = getFreeTimerMinutesForTargetLevel(targetLevel);
  if (!isPro) {
    return freeMinutes;
  }

  return Math.round(freeMinutes * BASE_ECONOMY_CONFIG.proTimerMultiplier);
}

export function getNextBuildingLevel(currentLevel) {
  const safeCurrentLevel = Number(currentLevel);
  if (!Number.isInteger(safeCurrentLevel)) {
    return null;
  }

  if (safeCurrentLevel < BASE_ECONOMY_CONFIG.minBuildingLevel) {
    return BASE_ECONOMY_CONFIG.minBuildingLevel;
  }

  if (safeCurrentLevel >= BASE_ECONOMY_CONFIG.maxBuildingLevel) {
    return null;
  }

  return safeCurrentLevel + 1;
}

export function isBuildingUnlocked(buildingDefinition, palaceLevel) {
  if (!buildingDefinition) {
    return false;
  }

  if (buildingDefinition.unlock.type === "start") {
    return true;
  }

  return Number(palaceLevel) >= buildingDefinition.unlock.palaceLevel;
}

function assertTargetLevel(targetLevel) {
  if (
    !Number.isInteger(targetLevel) ||
    targetLevel <= BASE_ECONOMY_CONFIG.minBuildingLevel ||
    targetLevel > BASE_ECONOMY_CONFIG.maxBuildingLevel
  ) {
    throw new RangeError(`Unsupported base-building target level: ${targetLevel}`);
  }
}
