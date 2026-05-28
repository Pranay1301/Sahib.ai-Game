import {
  BASE_SKILL_CHALLENGE_RULES,
  BUILDING_STATES,
  getFreeTimerMinutesForTargetLevel,
  getNextBuildingLevel,
  getTimerDurationMinutesForTargetLevel,
  getUpgradeCostForTargetLevel
} from "./baseConfig.js";
import {
  BASE_COPY_KEYS,
  BASE_LANGUAGES,
  getBaseCopy,
  normalizeBaseLanguage
} from "./baseLocalization.js";

export const BASE_UPGRADE_CHALLENGE_REQUIREMENT = Object.freeze({
  questionsRequired: BASE_SKILL_CHALLENGE_RULES.questionsRequired,
  passCount: BASE_SKILL_CHALLENGE_RULES.passCount
});

export function createBuildingUpgradeModalViewModel({
  slot = null,
  profile = {},
  gameState = {},
  language = BASE_LANGUAGES.EN
} = {}) {
  if (!slot || slot.state !== BUILDING_STATES.AVAILABLE) {
    return null;
  }

  const nextLevel = getNextBuildingLevel(slot.level);
  if (nextLevel === null) {
    return null;
  }

  const normalizedLanguage = normalizeBaseLanguage(language ?? profile.language);
  const isPro = Boolean(profile.is_pro);
  const coins = normalizeWholeNumber(gameState.coins);
  const coinCost = getUpgradeCostForTargetLevel(nextLevel);
  const freeTimerMinutes = getFreeTimerMinutesForTargetLevel(nextLevel);
  const proTimerMinutes = getTimerDurationMinutesForTargetLevel(nextLevel, true);
  const activeTimerMinutes = getTimerDurationMinutesForTargetLevel(nextLevel, isPro);

  return {
    buildingId: slot.buildingId,
    slotId: slot.slotId,
    buildingLabelKey: slot.labelKey,
    buildingLabel: slot.label,
    titleKey: BASE_COPY_KEYS.UPGRADE_MODAL_TITLE,
    title: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_MODAL_TITLE, {
      buildingLabel: slot.label
    }),
    currentLevel: createLevelSummary({
      language: normalizedLanguage,
      labelKey: BASE_COPY_KEYS.UPGRADE_CURRENT_LEVEL_LABEL,
      level: slot.level
    }),
    nextLevel: createLevelSummary({
      language: normalizedLanguage,
      labelKey: BASE_COPY_KEYS.UPGRADE_NEXT_LEVEL_LABEL,
      level: nextLevel
    }),
    coinCost: {
      labelKey: BASE_COPY_KEYS.UPGRADE_COIN_COST_LABEL,
      label: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_COIN_COST_LABEL),
      coins: coinCost,
      canAfford: coins >= coinCost,
      availableCoins: coins
    },
    challenge: {
      labelKey: BASE_COPY_KEYS.UPGRADE_CHALLENGE_LABEL,
      label: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_CHALLENGE_LABEL),
      requirementKey: BASE_COPY_KEYS.UPGRADE_CHALLENGE_REQUIREMENT,
      requirement: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_CHALLENGE_REQUIREMENT, {
        passCount: BASE_UPGRADE_CHALLENGE_REQUIREMENT.passCount,
        questionsRequired: BASE_UPGRADE_CHALLENGE_REQUIREMENT.questionsRequired
      }),
      passCount: BASE_UPGRADE_CHALLENGE_REQUIREMENT.passCount,
      questionsRequired: BASE_UPGRADE_CHALLENGE_REQUIREMENT.questionsRequired
    },
    timers: {
      active: createTimerSummary({
        language: normalizedLanguage,
        labelKey: isPro
          ? BASE_COPY_KEYS.UPGRADE_PRO_TIMER_LABEL
          : BASE_COPY_KEYS.UPGRADE_FREE_TIMER_LABEL,
        minutes: activeTimerMinutes
      }),
      free: createTimerSummary({
        language: normalizedLanguage,
        labelKey: BASE_COPY_KEYS.UPGRADE_FREE_TIMER_LABEL,
        minutes: freeTimerMinutes
      }),
      pro: createTimerSummary({
        language: normalizedLanguage,
        labelKey: BASE_COPY_KEYS.UPGRADE_PRO_TIMER_LABEL,
        minutes: proTimerMinutes
      })
    },
    proUpsell: isPro
      ? null
      : {
          titleKey: BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_TITLE,
          title: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_TITLE),
          bodyKey: BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_BODY,
          body: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_BODY, {
            freeTimer: formatBaseDurationMinutes(freeTimerMinutes, normalizedLanguage),
            proTimer: formatBaseDurationMinutes(proTimerMinutes, normalizedLanguage)
          }),
          ctaKey: BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_CTA,
          cta: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_CTA),
          freeTimerMinutes,
          proTimerMinutes,
          fasterPercent: 80
        },
    confirmAction: {
      labelKey: BASE_COPY_KEYS.UPGRADE_CONFIRM_CTA,
      label: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_CONFIRM_CTA),
      disabled: coins < coinCost
    },
    closeAction: {
      labelKey: BASE_COPY_KEYS.UPGRADE_CLOSE_CTA,
      label: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.UPGRADE_CLOSE_CTA)
    }
  };
}

export function createBuildingUpgradeModalFromSlots({
  slots = [],
  buildingId = null,
  profile = {},
  gameState = {},
  language = BASE_LANGUAGES.EN
} = {}) {
  const slot = Array.isArray(slots)
    ? slots.find((candidate) => candidate?.buildingId === buildingId)
    : null;

  return createBuildingUpgradeModalViewModel({
    slot,
    profile,
    gameState,
    language
  });
}

export function formatBaseDurationMinutes(minutes, language = BASE_LANGUAGES.EN) {
  const normalizedLanguage = normalizeBaseLanguage(language);
  const safeMinutes = normalizeWholeNumber(minutes);
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (normalizedLanguage === BASE_LANGUAGES.AR) {
    if (hours > 0 && remainingMinutes > 0) {
      return `${hours} س ${remainingMinutes} د`;
    }
    if (hours > 0) {
      return `${hours} ${hours === 1 ? "ساعة" : "ساعات"}`;
    }
    return `${remainingMinutes} د`;
  }

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours} hr ${remainingMinutes} min`;
  }

  if (hours > 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"}`;
  }

  return `${remainingMinutes} min`;
}

function createLevelSummary({ language, labelKey, level }) {
  return {
    labelKey,
    label: getBaseCopy(language, labelKey),
    level
  };
}

function createTimerSummary({ language, labelKey, minutes }) {
  return {
    labelKey,
    label: getBaseCopy(language, labelKey),
    minutes,
    formatted: formatBaseDurationMinutes(minutes, language)
  };
}

function normalizeWholeNumber(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
