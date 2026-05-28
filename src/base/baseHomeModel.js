import {
  BASE_BUILDING_DEFINITIONS,
  BASE_ECONOMY_CONFIG,
  BUILDING_STATES,
  LEARNING_TRACKS,
  normalizeLearningTrack
} from "./baseConfig.js";
import {
  BASE_BUILDING_COPY_KEYS,
  BASE_COPY_KEYS,
  BASE_LANGUAGES,
  BASE_LEARNING_TRACK_COPY_KEYS,
  BASE_SKILL_TIER_KEYS,
  getBaseCopy,
  getSupportedBaseLanguages,
  normalizeBaseLanguage
} from "./baseLocalization.js";
import {
  createBuildingTapResult,
  BASE_BUILDING_TAP_ACTIONS,
  getPalaceLevelFromBuildings,
  resolveBaseBuildingRows
} from "./baseUnlocks.js";
import {
  createBuildingUpgradeModalFromSlots,
  createBuildingUpgradeModalViewModel
} from "./baseUpgradeModalModel.js";
import {
  createSkillChallengeViewModel
} from "./baseSkillChallenges.js";
import {
  createSkillTrackSelectionViewModel
} from "./baseSkillTrackSelection.js";

export const BASE_HOME_TOTAL_VISUAL_STATES = 42;

export const BASE_HOME_SLOT_LAYOUT = Object.freeze({
  slot_palace: Object.freeze({ x: 0.5, y: 0.42, width: 0.18, height: 0.34, layer: 7 }),
  slot_learning_hall: Object.freeze({ x: 0.36, y: 0.56, width: 0.16, height: 0.22, layer: 5 }),
  slot_attack_tower: Object.freeze({ x: 0.29, y: 0.34, width: 0.13, height: 0.25, layer: 4 }),
  slot_treasury: Object.freeze({ x: 0.74, y: 0.63, width: 0.13, height: 0.24, layer: 5 }),
  slot_wall_gate: Object.freeze({ x: 0.43, y: 0.78, width: 0.13, height: 0.22, layer: 3 }),
  slot_drone_station: Object.freeze({ x: 0.65, y: 0.45, width: 0.18, height: 0.2, layer: 4 }),
  slot_trophy_hall: Object.freeze({ x: 0.23, y: 0.7, width: 0.16, height: 0.2, layer: 3 })
});

export function createBaseHomeViewModel({
  profile = {},
  gameState = {},
  buildings = [],
  language = null,
  selectedBuildingId = null
} = {}) {
  const currentLanguage = normalizeBaseLanguage(language ?? profile.language);
  const isPro = Boolean(profile.is_pro);
  const palaceLevel = getPalaceLevelFromBuildings(buildings);
  const slots = createBaseHomeSlots({
    buildings,
    palaceLevel,
    profile,
    gameState,
    language: currentLanguage
  });

  return {
    titleKey: BASE_COPY_KEYS.SCREEN_TITLE,
    title: getBaseCopy(currentLanguage, BASE_COPY_KEYS.SCREEN_TITLE),
    language: currentLanguage,
    languageSwitch: {
      labelKey: BASE_COPY_KEYS.LANGUAGE_SWITCH,
      label: getBaseCopy(currentLanguage, BASE_COPY_KEYS.LANGUAGE_SWITCH),
      options: getSupportedBaseLanguages()
    },
    hud: {
      coins: normalizeWholeNumber(gameState.coins),
      coinsLabelKey: BASE_COPY_KEYS.COINS_LABEL,
      coinsLabel: getBaseCopy(currentLanguage, BASE_COPY_KEYS.COINS_LABEL),
      heartsRemaining: isPro
        ? null
        : clampWholeNumber(gameState.hearts_remaining, 0, BASE_ECONOMY_CONFIG.heartsMax),
      heartsMax: BASE_ECONOMY_CONFIG.heartsMax,
      heartsLabelKey: isPro ? BASE_COPY_KEYS.HEARTS_UNLIMITED : BASE_COPY_KEYS.HEARTS_LABEL,
      heartsLabel: getBaseCopy(
        currentLanguage,
        isPro ? BASE_COPY_KEYS.HEARTS_UNLIMITED : BASE_COPY_KEYS.HEARTS_LABEL
      ),
      isUnlimitedHearts: isPro
    },
    proBadge: {
      isPro,
      labelKey: isPro ? BASE_COPY_KEYS.PRO_BADGE_ACTIVE : BASE_COPY_KEYS.PRO_BADGE_FREE,
      label: getBaseCopy(currentLanguage, isPro ? BASE_COPY_KEYS.PRO_BADGE_ACTIVE : BASE_COPY_KEYS.PRO_BADGE_FREE)
    },
    skillBadge: createSkillBadgeViewModel({
      language: currentLanguage,
      learningTrack: profile.learning_track,
      challengesCompleted: gameState.skill_challenges_completed,
      buildings,
      slots,
      isPro
    }),
    skillTrackSelector: createSkillTrackSelectionViewModel({
      profile,
      language: currentLanguage
    }),
    quickBattleAction: {
      labelKey: BASE_COPY_KEYS.QUICK_BATTLE_CTA,
      label: getBaseCopy(currentLanguage, BASE_COPY_KEYS.QUICK_BATTLE_CTA)
    },
    upgradeModal: createBuildingUpgradeModalFromSlots({
      slots,
      buildingId: selectedBuildingId,
      profile,
      gameState,
      language: currentLanguage
    }),
    slots
  };
}

export function createBaseHomeSlots({
  buildings = [],
  palaceLevel = null,
  profile = {},
  gameState = {},
  language = BASE_LANGUAGES.EN
} = {}) {
  const normalizedLanguage = normalizeBaseLanguage(language);
  const resolvedRows = resolveBaseBuildingRows(
    buildings,
    palaceLevel === null || palaceLevel === undefined ? {} : { palaceLevel }
  );

  return BASE_BUILDING_DEFINITIONS.map((definition) => {
    const row = resolvedRows.find((building) => building.building_id === definition.id);
    const level = row.level;
    const state = row.state;
    const copyKeys = BASE_BUILDING_COPY_KEYS[definition.id];
    const layout = BASE_HOME_SLOT_LAYOUT[definition.slotId];

    const slot = {
      slotId: definition.slotId,
      buildingId: definition.id,
      labelKey: copyKeys.label,
      label: getBaseCopy(normalizedLanguage, copyKeys.label),
      purposeKey: copyKeys.purpose,
      purpose: getBaseCopy(normalizedLanguage, copyKeys.purpose),
      level,
      state,
      lockedRequirement:
        state === BUILDING_STATES.LOCKED && definition.unlock.type === "palace_level"
          ? {
              palaceLevel: definition.unlock.palaceLevel,
              labelKey: BASE_COPY_KEYS.LOCKED_REQUIREMENT,
              label: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.LOCKED_REQUIREMENT, {
                palaceLevel: definition.unlock.palaceLevel
              })
            }
          : null,
      assetKey: `/images/buildings/${definition.id}_level_${level}.png`,
      layout,
      isLocked: state === BUILDING_STATES.LOCKED,
      isUpgrading: state === BUILDING_STATES.UPGRADING,
      isCompleted: state === BUILDING_STATES.COMPLETED,
      isMaxLevel: state === BUILDING_STATES.MAX_LEVEL
    };

    return {
      ...slot,
      tapResult: createSlotTapResult({
        slot,
        profile,
        gameState,
        language: normalizedLanguage
      })
    };
  });
}

function createSlotTapResult({
  slot,
  profile,
  gameState,
  language
}) {
  const tapResult = createBuildingTapResult(slot);

  if (tapResult.action === BASE_BUILDING_TAP_ACTIONS.UPGRADE_AVAILABLE) {
    return {
      ...tapResult,
      upgradePreview: createBuildingUpgradeModalViewModel({
        slot,
        profile,
        gameState,
        language
      })
    };
  }

  if (tapResult.action === BASE_BUILDING_TAP_ACTIONS.QUIZ_REQUIRED) {
    return {
      ...tapResult,
      skillChallengePreview: createSkillChallengeViewModel({
        profile,
        buildingId: slot.buildingId,
        currentLevel: slot.level,
        challengeNumber: normalizeWholeNumber(gameState.skill_challenges_completed) + 1,
        language
      })
    };
  }

  return tapResult;
}

export function createSkillBadgeViewModel({
  language = BASE_LANGUAGES.EN,
  learningTrack = LEARNING_TRACKS.ENGLISH,
  challengesCompleted = 0,
  buildings = [],
  slots = null,
  isPro = false
} = {}) {
  const normalizedLanguage = normalizeBaseLanguage(language);
  const normalizedTrack =
    normalizeLearningTrack(learningTrack);
  const safeChallengesCompleted = normalizeWholeNumber(challengesCompleted);
  const tierKey = getSkillTierKey(normalizedTrack, safeChallengesCompleted);
  const progress = getKingdomProgress(buildings, slots);
  const trackCopyKeys = BASE_LEARNING_TRACK_COPY_KEYS[normalizedTrack];

  return {
    learningTrack: normalizedTrack,
    learningTrackLabelKey: trackCopyKeys.label,
    learningTrackLabel: getBaseCopy(normalizedLanguage, trackCopyKeys.label),
    tierKey,
    tierLabel: getBaseCopy(normalizedLanguage, tierKey),
    tierLabelKey: BASE_COPY_KEYS.SKILL_TIER_LABEL,
    tierTitle: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.SKILL_TIER_LABEL),
    challengesCompleted: safeChallengesCompleted,
    challengesLabelKey: trackCopyKeys.challengeCountLabel,
    challengesLabel: getBaseCopy(normalizedLanguage, trackCopyKeys.challengeCountLabel),
    genericChallengesLabelKey: BASE_COPY_KEYS.SKILL_COUNT_LABEL,
    genericChallengesLabel: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.SKILL_COUNT_LABEL),
    kingdomProgress: progress,
    kingdomProgressLabelKey: BASE_COPY_KEYS.KINGDOM_PROGRESS_LABEL,
    kingdomProgressLabel: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.KINGDOM_PROGRESS_LABEL),
    isPro
  };
}

export function getSkillTierKey(learningTrack, challengesCompleted) {
  const safeChallengesCompleted = normalizeWholeNumber(challengesCompleted);

  if (learningTrack === LEARNING_TRACKS.AI_AGENTS) {
    if (safeChallengesCompleted >= 100) {
      return BASE_SKILL_TIER_KEYS.ai_agents.aiAgentArchitect;
    }
    if (safeChallengesCompleted >= 50) {
      return BASE_SKILL_TIER_KEYS.ai_agents.automationStrategist;
    }
    if (safeChallengesCompleted >= 25) {
      return BASE_SKILL_TIER_KEYS.ai_agents.agentBuilder;
    }
    if (safeChallengesCompleted >= 10) {
      return BASE_SKILL_TIER_KEYS.ai_agents.promptBuilder;
    }
    return BASE_SKILL_TIER_KEYS.ai_agents.aiExplorer;
  }

  if (safeChallengesCompleted >= 100) {
    return BASE_SKILL_TIER_KEYS.english.communicationMaster;
  }
  if (safeChallengesCompleted >= 50) {
    return BASE_SKILL_TIER_KEYS.english.fluentBuilder;
  }
  if (safeChallengesCompleted >= 25) {
    return BASE_SKILL_TIER_KEYS.english.confidentSpeaker;
  }
  if (safeChallengesCompleted >= 10) {
    return BASE_SKILL_TIER_KEYS.english.risingCommunicator;
  }
  return BASE_SKILL_TIER_KEYS.english.newSpeaker;
}

export function getKingdomProgress(buildings = [], slots = null) {
  const source = Array.isArray(slots) ? slots : createBaseHomeSlots({ buildings });
  const completedStates = source.reduce((total, slot) => total + normalizeWholeNumber(slot.level), 0);

  return {
    current: clampWholeNumber(completedStates, 0, BASE_HOME_TOTAL_VISUAL_STATES),
    total: BASE_HOME_TOTAL_VISUAL_STATES
  };
}

function normalizeWholeNumber(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function clampWholeNumber(value, min, max) {
  return Math.max(min, Math.min(max, normalizeWholeNumber(value)));
}
