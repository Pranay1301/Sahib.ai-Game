import {
  BASE_ECONOMY_CONFIG
} from "./baseConfig.js";
import {
  BASE_COPY_KEYS,
  BASE_LANGUAGES,
  getBaseCopy,
  normalizeBaseLanguage
} from "./baseLocalization.js";

export const BASE_PRO_ENTITLEMENT_FIELD = "is_pro";
export const BASE_PRO_ENTITLEMENT_ID = "sahib_pro";
export const BASE_PRO_TIMER_SPEEDUP_PERCENT = 80;

export const BASE_PRO_TOUCHPOINTS = Object.freeze({
  COIN_REWARD: "coin_reward",
  HEARTS_FINISHED: "hearts_finished",
  LOCKED_BUILDING: "locked_building",
  UPGRADE_MODAL: "upgrade_modal",
  TIMER_STARTED: "timer_started",
  FIRST_UPGRADE_COMPLETE: "first_upgrade_complete",
  MAIN_PRO_SCREEN: "main_pro_screen"
});

export const BASE_PRO_TOUCHPOINT_CONFIG = Object.freeze({
  [BASE_PRO_TOUCHPOINTS.COIN_REWARD]: Object.freeze({
    type: "soft_upsell",
    titleKey: BASE_COPY_KEYS.REWARD_PREVIEW_TITLE,
    ctaKey: BASE_COPY_KEYS.REWARD_PREVIEW_CTA,
    launchOffer: false
  }),
  [BASE_PRO_TOUCHPOINTS.HEARTS_FINISHED]: Object.freeze({
    type: "harder_paywall",
    titleKey: BASE_COPY_KEYS.PRO_CONVERSION_HEARTS_TITLE,
    bodyKey: BASE_COPY_KEYS.PRO_CONVERSION_HEARTS_BODY,
    ctaKey: BASE_COPY_KEYS.PRO_CONVERSION_HEARTS_CTA,
    launchOffer: true
  }),
  [BASE_PRO_TOUCHPOINTS.LOCKED_BUILDING]: Object.freeze({
    type: "soft_medium_upsell",
    titleKey: BASE_COPY_KEYS.PRO_CONVERSION_LOCKED_TITLE,
    bodyKey: BASE_COPY_KEYS.PRO_CONVERSION_LOCKED_BODY,
    ctaKey: BASE_COPY_KEYS.PRO_CONVERSION_LOCKED_CTA,
    launchOffer: false
  }),
  [BASE_PRO_TOUCHPOINTS.UPGRADE_MODAL]: Object.freeze({
    type: "soft_medium_upsell",
    titleKey: BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_TITLE,
    bodyKey: BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_BODY,
    ctaKey: BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_CTA,
    launchOffer: false
  }),
  [BASE_PRO_TOUCHPOINTS.TIMER_STARTED]: Object.freeze({
    type: "medium_upsell",
    titleKey: BASE_COPY_KEYS.PRO_CONVERSION_TIMER_STARTED_TITLE,
    bodyKey: BASE_COPY_KEYS.PRO_CONVERSION_TIMER_STARTED_BODY,
    ctaKey: BASE_COPY_KEYS.PRO_CONVERSION_TIMER_STARTED_CTA,
    launchOffer: false
  }),
  [BASE_PRO_TOUCHPOINTS.FIRST_UPGRADE_COMPLETE]: Object.freeze({
    type: "soft_upsell",
    titleKey: BASE_COPY_KEYS.PRO_CONVERSION_FIRST_UPGRADE_TITLE,
    bodyKey: BASE_COPY_KEYS.PRO_CONVERSION_FIRST_UPGRADE_BODY,
    ctaKey: BASE_COPY_KEYS.PRO_CONVERSION_FIRST_UPGRADE_CTA,
    launchOffer: false
  }),
  [BASE_PRO_TOUCHPOINTS.MAIN_PRO_SCREEN]: Object.freeze({
    type: "full_paywall",
    titleKey: BASE_COPY_KEYS.PRO_CONVERSION_MAIN_TITLE,
    ctaKey: BASE_COPY_KEYS.PRO_CONVERSION_MAIN_CTA,
    launchOffer: true
  })
});

export function createProConversionViewModel({
  touchpoint,
  language = BASE_LANGUAGES.EN,
  isPro = false,
  titleKey = null,
  bodyKey = null,
  ctaKey = null,
  titleValues = {},
  bodyValues = {},
  ctaValues = {}
} = {}) {
  if (isPro && touchpoint !== BASE_PRO_TOUCHPOINTS.MAIN_PRO_SCREEN) {
    return null;
  }

  const config = BASE_PRO_TOUCHPOINT_CONFIG[touchpoint];
  if (!config) {
    return null;
  }

  const normalizedLanguage = normalizeBaseLanguage(language);
  const resolvedTitleKey = titleKey ?? config.titleKey;
  const resolvedBodyKey = bodyKey ?? config.bodyKey ?? null;
  const resolvedCtaKey = ctaKey ?? config.ctaKey;

  return Object.freeze({
    entitlementField: BASE_PRO_ENTITLEMENT_FIELD,
    entitlementId: BASE_PRO_ENTITLEMENT_ID,
    touchpoint,
    type: config.type,
    language: normalizedLanguage,
    launchOffer: Boolean(config.launchOffer),
    titleKey: resolvedTitleKey,
    title: getBaseCopy(normalizedLanguage, resolvedTitleKey, titleValues),
    bodyKey: resolvedBodyKey,
    body: resolvedBodyKey ? getBaseCopy(normalizedLanguage, resolvedBodyKey, bodyValues) : null,
    ctaKey: resolvedCtaKey,
    cta: getBaseCopy(normalizedLanguage, resolvedCtaKey, ctaValues),
    benefits: createProBenefitSummary()
  });
}

export function createMainProScreenViewModel({
  profile = {},
  language = null
} = {}) {
  const normalizedLanguage = normalizeBaseLanguage(language ?? profile.language);
  const conversion = createProConversionViewModel({
    touchpoint: BASE_PRO_TOUCHPOINTS.MAIN_PRO_SCREEN,
    language: normalizedLanguage
  });

  return Object.freeze({
    ...conversion,
    isPro: Boolean(profile.is_pro),
    launchBadgeKey: BASE_COPY_KEYS.PRO_CONVERSION_LAUNCH_BADGE,
    launchBadge: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.PRO_CONVERSION_LAUNCH_BADGE),
    benefitCards: createMainProBenefitCards(normalizedLanguage),
    comparisonRows: createMainProComparisonRows(normalizedLanguage),
    trustNoteKey: BASE_COPY_KEYS.PRO_TRUST_NOTE,
    trustNote: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.PRO_TRUST_NOTE)
  });
}

export function createFirstUpgradeProConversion({
  gameState = {},
  isPro = false,
  language = BASE_LANGUAGES.EN
} = {}) {
  if (isPro || gameState.has_seen_first_upgrade_pro_message) {
    return Object.freeze({
      shouldShow: false,
      gameState,
      proConversion: null
    });
  }

  return Object.freeze({
    shouldShow: true,
    gameState: {
      ...gameState,
      has_seen_first_upgrade_pro_message: true
    },
    proConversion: createProConversionViewModel({
      touchpoint: BASE_PRO_TOUCHPOINTS.FIRST_UPGRADE_COMPLETE,
      language
    })
  });
}

export function createProBenefitSummary() {
  return Object.freeze({
    unlimitedQuickBattles: true,
    coinMultiplier: BASE_ECONOMY_CONFIG.proCoinMultiplier,
    timerSpeedupPercent: BASE_PRO_TIMER_SPEEDUP_PERCENT,
    futureTimersOnly: true,
    skillChallengesRequired: true,
    noPayToWin: true,
    noInstantBuildCompletion: true
  });
}

function createMainProBenefitCards(language) {
  return Object.freeze([
    createBenefitCard(language, "play_more", BASE_COPY_KEYS.PRO_BENEFIT_BATTLES_TITLE, BASE_COPY_KEYS.PRO_BENEFIT_BATTLES_BODY),
    createBenefitCard(language, "coins_3x", BASE_COPY_KEYS.PRO_BENEFIT_COINS_TITLE, BASE_COPY_KEYS.PRO_BENEFIT_COINS_BODY),
    createBenefitCard(language, "faster_builds", BASE_COPY_KEYS.PRO_BENEFIT_TIMERS_TITLE, BASE_COPY_KEYS.PRO_BENEFIT_TIMERS_BODY),
    createBenefitCard(language, "skill_challenges", BASE_COPY_KEYS.PRO_BENEFIT_SKILLS_TITLE, BASE_COPY_KEYS.PRO_BENEFIT_SKILLS_BODY)
  ]);
}

function createBenefitCard(language, id, titleKey, bodyKey) {
  return Object.freeze({
    id,
    titleKey,
    title: getBaseCopy(language, titleKey),
    bodyKey,
    body: getBaseCopy(language, bodyKey)
  });
}

function createMainProComparisonRows(language) {
  return Object.freeze([
    createComparisonRow(
      language,
      "quick_battles",
      BASE_COPY_KEYS.PRO_COMPARISON_QUICK_BATTLES,
      BASE_COPY_KEYS.PRO_COMPARISON_FREE_QUICK_BATTLES,
      BASE_COPY_KEYS.PRO_COMPARISON_PRO_QUICK_BATTLES
    ),
    createComparisonRow(
      language,
      "coins",
      BASE_COPY_KEYS.PRO_COMPARISON_COINS,
      BASE_COPY_KEYS.PRO_COMPARISON_FREE_COINS,
      BASE_COPY_KEYS.PRO_COMPARISON_PRO_COINS
    ),
    createComparisonRow(
      language,
      "timers",
      BASE_COPY_KEYS.PRO_COMPARISON_TIMERS,
      BASE_COPY_KEYS.PRO_COMPARISON_FREE_TIMERS,
      BASE_COPY_KEYS.PRO_COMPARISON_PRO_TIMERS
    ),
    createComparisonRow(
      language,
      "skill_challenges",
      BASE_COPY_KEYS.PRO_COMPARISON_SKILL_CHALLENGES,
      BASE_COPY_KEYS.PRO_COMPARISON_FREE_SKILL_CHALLENGES,
      BASE_COPY_KEYS.PRO_COMPARISON_PRO_SKILL_CHALLENGES
    ),
    createComparisonRow(
      language,
      "pay_to_win",
      BASE_COPY_KEYS.PRO_COMPARISON_PAY_TO_WIN,
      BASE_COPY_KEYS.PRO_COMPARISON_FREE_PAY_TO_WIN,
      BASE_COPY_KEYS.PRO_COMPARISON_PRO_PAY_TO_WIN
    )
  ]);
}

function createComparisonRow(language, id, featureKey, freeKey, proKey) {
  return Object.freeze({
    id,
    featureKey,
    feature: getBaseCopy(language, featureKey),
    freeKey,
    free: getBaseCopy(language, freeKey),
    proKey,
    pro: getBaseCopy(language, proKey)
  });
}
