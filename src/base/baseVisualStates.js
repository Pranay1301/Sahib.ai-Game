import {
  BASE_BUILDING_DEFINITIONS,
  BASE_BUILDING_IDS,
  BASE_ECONOMY_CONFIG,
  BUILDING_STATES,
  getBuildingDefinition
} from "./baseConfig.js";

export const BASE_BUILDING_VISUAL_ASSET_ROOT = "/images/buildings";

export const BASE_BUILDING_VISUAL_LEVELS = Object.freeze([
  Object.freeze({
    level: 1,
    key: "basic",
    visualStyle: "Basic/newly built"
  }),
  Object.freeze({
    level: 2,
    key: "cleaner",
    visualStyle: "Cleaner/slightly upgraded"
  }),
  Object.freeze({
    level: 3,
    key: "stronger",
    visualStyle: "Stronger/more detailed"
  }),
  Object.freeze({
    level: 4,
    key: "premium",
    visualStyle: "Premium"
  }),
  Object.freeze({
    level: 5,
    key: "elite",
    visualStyle: "Elite"
  }),
  Object.freeze({
    level: 6,
    key: "signature",
    visualStyle: "Signature high-status version"
  })
]);

export const BASE_BUILDING_VISUAL_STATE_COUNT =
  BASE_BUILDING_DEFINITIONS.length * BASE_BUILDING_VISUAL_LEVELS.length;

export const BASE_BUILDING_STATUS_VISUALS = Object.freeze({
  [BUILDING_STATES.LOCKED]: Object.freeze({
    key: "locked_dimmed",
    glow: null,
    isDimmed: true,
    tapCue: "unlock_requirement"
  }),
  [BUILDING_STATES.AVAILABLE]: Object.freeze({
    key: "upgrade_cta",
    glow: "upgrade",
    isDimmed: false,
    tapCue: "upgrade"
  }),
  [BUILDING_STATES.QUIZ_REQUIRED]: Object.freeze({
    key: "skill_challenge_required",
    glow: "skill",
    isDimmed: false,
    tapCue: "skill_challenge"
  }),
  [BUILDING_STATES.UPGRADING]: Object.freeze({
    key: "construction_timer",
    glow: "construction",
    isDimmed: false,
    tapCue: "timer"
  }),
  [BUILDING_STATES.COMPLETED]: Object.freeze({
    key: "ready_glow",
    glow: "ready",
    isDimmed: false,
    tapCue: "complete_upgrade"
  }),
  [BUILDING_STATES.MAX_LEVEL]: Object.freeze({
    key: "premium_high_status",
    glow: "premium",
    isDimmed: false,
    tapCue: "owned"
  })
});

export function normalizeBuildingVisualLevel(level) {
  const numericLevel = Math.floor(Number(level) || BASE_ECONOMY_CONFIG.minBuildingLevel);
  return Math.max(
    BASE_ECONOMY_CONFIG.minBuildingLevel,
    Math.min(BASE_ECONOMY_CONFIG.maxBuildingLevel, numericLevel)
  );
}

export function getBuildingVisualLevel(level) {
  const normalizedLevel = normalizeBuildingVisualLevel(level);
  return BASE_BUILDING_VISUAL_LEVELS.find((visualLevel) => visualLevel.level === normalizedLevel);
}

export function getBuildingVisualAssetKey(buildingId, level) {
  const definition = getBuildingDefinition(buildingId);
  if (!definition) {
    return null;
  }

  const normalizedLevel = normalizeBuildingVisualLevel(level);
  return `${BASE_BUILDING_VISUAL_ASSET_ROOT}/${definition.id}_level_${normalizedLevel}.png`;
}

export function createBuildingVisualState({
  buildingId,
  level = BASE_ECONOMY_CONFIG.minBuildingLevel,
  state = BUILDING_STATES.AVAILABLE
} = {}) {
  const definition = getBuildingDefinition(buildingId);
  if (!definition) {
    return null;
  }

  const normalizedLevel = normalizeBuildingVisualLevel(level);
  const visualLevel = getBuildingVisualLevel(normalizedLevel);
  const normalizedState = BASE_BUILDING_STATUS_VISUALS[state] ? state : BUILDING_STATES.AVAILABLE;
  const statusVisual = BASE_BUILDING_STATUS_VISUALS[normalizedState];

  return Object.freeze({
    buildingId: definition.id,
    slotId: definition.slotId,
    level: normalizedLevel,
    levelKey: visualLevel.key,
    visualStyle: visualLevel.visualStyle,
    state: normalizedState,
    statusKey: statusVisual.key,
    glow: statusVisual.glow,
    tapCue: statusVisual.tapCue,
    isDimmed: statusVisual.isDimmed,
    isLocked: normalizedState === BUILDING_STATES.LOCKED,
    isUpgrading: normalizedState === BUILDING_STATES.UPGRADING,
    isCompleted: normalizedState === BUILDING_STATES.COMPLETED,
    isMaxLevel: normalizedState === BUILDING_STATES.MAX_LEVEL,
    isSkillProgressAnchor: definition.id === BASE_BUILDING_IDS.LEARNING_HALL,
    isPremiumVisual: normalizedLevel >= 4,
    isSignatureVisual: normalizedLevel === BASE_ECONOMY_CONFIG.maxBuildingLevel,
    assetKey: getBuildingVisualAssetKey(definition.id, normalizedLevel),
    usesPlaceholderAsset: true
  });
}

export function createBaseVisualStateCatalog() {
  return Object.freeze(
    BASE_BUILDING_DEFINITIONS.flatMap((definition) =>
      BASE_BUILDING_VISUAL_LEVELS.map((visualLevel) =>
        createBuildingVisualState({
          buildingId: definition.id,
          level: visualLevel.level,
          state:
            visualLevel.level === BASE_ECONOMY_CONFIG.maxBuildingLevel
              ? BUILDING_STATES.MAX_LEVEL
              : BUILDING_STATES.AVAILABLE
        })
      )
    )
  );
}
