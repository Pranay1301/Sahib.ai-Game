import { claimBattleReward } from "./baseBackend.js";
import {
  BASE_ECONOMY_CONFIG,
  calculateFinalCoins,
  getBaseCoinsForOutcome
} from "./baseConfig.js";
import {
  BASE_COPY_KEYS,
  BASE_LANGUAGES,
  getBaseCopy,
  normalizeBaseLanguage
} from "./baseLocalization.js";

export const BASE_REWARD_BRIDGE_REASONS = Object.freeze({
  CLAIMED: "claimed",
  DUPLICATE_CLAIM: "duplicate_battle_reward_claim"
});

const REWARD_BODY_KEYS_BY_OUTCOME = Object.freeze({
  win: BASE_COPY_KEYS.REWARD_PREVIEW_FREE_WIN_BODY,
  draw: BASE_COPY_KEYS.REWARD_PREVIEW_FREE_DRAW_BODY,
  loss: BASE_COPY_KEYS.REWARD_PREVIEW_FREE_LOSS_BODY
});

const ARABIC_DIGITS = Object.freeze(["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"]);

export function claimBattleResultReward({
  gameState,
  existingClaims = [],
  battleResult,
  userId,
  isPro = false,
  claimedAt,
  language = BASE_LANGUAGES.EN
} = {}) {
  const normalizedBattleResult = normalizeBattleResultForBase(battleResult);
  const claimResult = claimBattleReward({
    gameState,
    existingClaims,
    battleResult: normalizedBattleResult,
    userId,
    isPro,
    claimedAt
  });

  if (!claimResult.accepted) {
    return {
      ...claimResult,
      battleResult: normalizedBattleResult,
      finalCoins: 0,
      rewardPreview: null
    };
  }

  return {
    ...claimResult,
    battleResult: normalizedBattleResult,
    finalCoins: claimResult.claim.final_coins_awarded,
    rewardPreview: createBattleRewardPreview({
      battleResult: normalizedBattleResult,
      isPro,
      language
    })
  };
}

export function createBattleRewardPreview({
  battleResult,
  isPro = false,
  language = BASE_LANGUAGES.EN
} = {}) {
  const normalizedBattleResult = normalizeBattleResultForBase(battleResult);
  const normalizedLanguage = normalizeBaseLanguage(language);
  const baseCoins = normalizedBattleResult.baseCoins;
  const finalCoins = calculateFinalCoins(baseCoins, isPro);
  const proCoins = calculateFinalCoins(baseCoins, true);
  const hasReward = baseCoins > 0;
  const bodyKey = getRewardBodyKey(normalizedBattleResult.outcome, isPro, hasReward);
  const copyValues = createRewardCopyValues({
    baseCoins,
    finalCoins,
    proCoins,
    language: normalizedLanguage
  });

  return {
    battleResultId: normalizedBattleResult.battleResultId,
    outcome: normalizedBattleResult.outcome,
    reason: normalizedBattleResult.reason,
    language: normalizedLanguage,
    isPro: Boolean(isPro),
    hasReward,
    baseCoins,
    finalCoins,
    proCoins,
    multiplier: BASE_ECONOMY_CONFIG.proCoinMultiplier,
    titleKey: BASE_COPY_KEYS.REWARD_PREVIEW_TITLE,
    title: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.REWARD_PREVIEW_TITLE),
    bodyKey,
    body: getBaseCopy(normalizedLanguage, bodyKey, copyValues),
    proUpsell:
      !isPro && hasReward
        ? {
            ctaKey: BASE_COPY_KEYS.REWARD_PREVIEW_CTA,
            cta: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.REWARD_PREVIEW_CTA),
            multiplier: BASE_ECONOMY_CONFIG.proCoinMultiplier,
            wouldHaveEarnedCoins: proCoins
          }
        : null
  };
}

export function normalizeBattleResultForBase(battleResult) {
  assertBattleResultForBase(battleResult);
  const outcomeBaseCoins = getBaseCoinsForOutcome(battleResult.outcome);
  const baseCoins =
    battleResult.baseCoins === undefined || battleResult.baseCoins === null
      ? outcomeBaseCoins
      : normalizeWholeCoins(battleResult.baseCoins);

  return {
    ...battleResult,
    baseCoins
  };
}

export function formatBaseRewardNumber(value, language = BASE_LANGUAGES.EN) {
  const safeValue = String(normalizeWholeCoins(value));
  if (normalizeBaseLanguage(language) !== BASE_LANGUAGES.AR) {
    return safeValue;
  }

  return safeValue.replace(/[0-9]/g, (digit) => ARABIC_DIGITS[Number(digit)]);
}

function getRewardBodyKey(outcome, isPro, hasReward) {
  if (!hasReward) {
    return BASE_COPY_KEYS.REWARD_PREVIEW_ZERO_BODY;
  }

  if (isPro) {
    return BASE_COPY_KEYS.REWARD_PREVIEW_PRO_BODY;
  }

  return REWARD_BODY_KEYS_BY_OUTCOME[outcome] ?? BASE_COPY_KEYS.REWARD_PREVIEW_ZERO_BODY;
}

function createRewardCopyValues({
  baseCoins,
  finalCoins,
  proCoins,
  language
}) {
  return {
    baseCoins,
    finalCoins,
    proCoins,
    baseCoinsFormatted: formatBaseRewardNumber(baseCoins, language),
    finalCoinsFormatted: formatBaseRewardNumber(finalCoins, language),
    proCoinsFormatted: formatBaseRewardNumber(proCoins, language)
  };
}

function normalizeWholeCoins(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}

function assertBattleResultForBase(battleResult) {
  if (!battleResult || typeof battleResult !== "object") {
    throw new TypeError("battleResult is required");
  }

  assertRequiredString(battleResult.battleResultId, "battleResult.battleResultId");
  assertRequiredString(battleResult.outcome, "battleResult.outcome");
  assertRequiredString(battleResult.reason, "battleResult.reason");

  if (!Object.prototype.hasOwnProperty.call(REWARD_BODY_KEYS_BY_OUTCOME, battleResult.outcome)) {
    throw new RangeError("battleResult.outcome must be win, draw, or loss");
  }
}

function assertRequiredString(value, name) {
  if (typeof value !== "string" || value.length === 0) {
    throw new TypeError(`${name} must be a non-empty string`);
  }
}
