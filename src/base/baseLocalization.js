export const BASE_LANGUAGES = Object.freeze({
  EN: "en",
  AR: "ar"
});

export const BASE_COPY_KEYS = Object.freeze({
  SCREEN_TITLE: "base.home.title",
  QUICK_BATTLE_CTA: "base.home.quickBattleCta",
  COINS_LABEL: "base.hud.coins",
  HEARTS_LABEL: "base.hud.hearts",
  HEARTS_UNLIMITED: "base.hud.heartsUnlimited",
  LANGUAGE_SWITCH: "base.hud.languageSwitch",
  PRO_BADGE_FREE: "base.pro.badgeFree",
  PRO_BADGE_ACTIVE: "base.pro.badgeActive",
  TRACK_SELECTOR_TITLE: "base.trackSelector.title",
  SKILL_TIER_LABEL: "base.skill.tierLabel",
  SKILL_COUNT_LABEL: "base.skill.countLabel",
  KINGDOM_PROGRESS_LABEL: "base.skill.kingdomProgressLabel",
  LOCKED_REQUIREMENT: "base.building.lockedRequirement",
  UPGRADE_MODAL_TITLE: "base.upgrade.title",
  UPGRADE_CURRENT_LEVEL_LABEL: "base.upgrade.currentLevel",
  UPGRADE_NEXT_LEVEL_LABEL: "base.upgrade.nextLevel",
  UPGRADE_COIN_COST_LABEL: "base.upgrade.coinCost",
  UPGRADE_CHALLENGE_LABEL: "base.upgrade.challenge",
  UPGRADE_CHALLENGE_REQUIREMENT: "base.upgrade.challengeRequirement",
  UPGRADE_FREE_TIMER_LABEL: "base.upgrade.freeTimer",
  UPGRADE_PRO_TIMER_LABEL: "base.upgrade.proTimer",
  UPGRADE_PRO_UPSELL_TITLE: "base.upgrade.proUpsellTitle",
  UPGRADE_PRO_UPSELL_BODY: "base.upgrade.proUpsellBody",
  UPGRADE_PRO_UPSELL_CTA: "base.upgrade.proUpsellCta",
  UPGRADE_CONFIRM_CTA: "base.upgrade.confirmCta",
  UPGRADE_CLOSE_CTA: "base.upgrade.closeCta",
  REWARD_PREVIEW_TITLE: "base.reward.title",
  REWARD_PREVIEW_FREE_WIN_BODY: "base.reward.freeWinBody",
  REWARD_PREVIEW_FREE_DRAW_BODY: "base.reward.freeDrawBody",
  REWARD_PREVIEW_FREE_LOSS_BODY: "base.reward.freeLossBody",
  REWARD_PREVIEW_PRO_BODY: "base.reward.proBody",
  REWARD_PREVIEW_ZERO_BODY: "base.reward.zeroBody",
  REWARD_PREVIEW_CTA: "base.reward.cta"
});

export const BASE_BUILDING_COPY_KEYS = Object.freeze({
  palace: Object.freeze({
    label: "base.building.palace.label",
    purpose: "base.building.palace.purpose"
  }),
  learning_hall: Object.freeze({
    label: "base.building.learningHall.label",
    purpose: "base.building.learningHall.purpose"
  }),
  attack_tower: Object.freeze({
    label: "base.building.attackTower.label",
    purpose: "base.building.attackTower.purpose"
  }),
  treasury: Object.freeze({
    label: "base.building.treasury.label",
    purpose: "base.building.treasury.purpose"
  }),
  wall_gate: Object.freeze({
    label: "base.building.wallGate.label",
    purpose: "base.building.wallGate.purpose"
  }),
  drone_station: Object.freeze({
    label: "base.building.droneStation.label",
    purpose: "base.building.droneStation.purpose"
  }),
  trophy_hall: Object.freeze({
    label: "base.building.trophyHall.label",
    purpose: "base.building.trophyHall.purpose"
  })
});

export const BASE_LEARNING_TRACK_COPY_KEYS = Object.freeze({
  english: Object.freeze({
    label: "base.track.english.label",
    purpose: "base.track.english.purpose",
    challengeCountLabel: "base.track.english.challengeCountLabel"
  }),
  ai_agents: Object.freeze({
    label: "base.track.aiAgents.label",
    purpose: "base.track.aiAgents.purpose",
    challengeCountLabel: "base.track.aiAgents.challengeCountLabel"
  })
});

export const BASE_SKILL_TIER_KEYS = Object.freeze({
  english: Object.freeze({
    newSpeaker: "base.skill.tier.english.newSpeaker",
    risingCommunicator: "base.skill.tier.english.risingCommunicator",
    confidentSpeaker: "base.skill.tier.english.confidentSpeaker",
    fluentBuilder: "base.skill.tier.english.fluentBuilder",
    communicationMaster: "base.skill.tier.english.communicationMaster"
  }),
  ai_agents: Object.freeze({
    aiExplorer: "base.skill.tier.aiAgents.aiExplorer",
    promptBuilder: "base.skill.tier.aiAgents.promptBuilder",
    agentBuilder: "base.skill.tier.aiAgents.agentBuilder",
    automationStrategist: "base.skill.tier.aiAgents.automationStrategist",
    aiAgentArchitect: "base.skill.tier.aiAgents.aiAgentArchitect"
  })
});

const BASE_TRANSLATIONS = Object.freeze({
  [BASE_LANGUAGES.EN]: Object.freeze({
    [BASE_COPY_KEYS.SCREEN_TITLE]: "Sahib Kingdom",
    [BASE_COPY_KEYS.QUICK_BATTLE_CTA]: "Quick Battle",
    [BASE_COPY_KEYS.COINS_LABEL]: "Coins",
    [BASE_COPY_KEYS.HEARTS_LABEL]: "Hearts",
    [BASE_COPY_KEYS.HEARTS_UNLIMITED]: "Unlimited",
    [BASE_COPY_KEYS.LANGUAGE_SWITCH]: "English | العربية",
    [BASE_COPY_KEYS.PRO_BADGE_FREE]: "Free",
    [BASE_COPY_KEYS.PRO_BADGE_ACTIVE]: "Sahib Pro",
    [BASE_COPY_KEYS.TRACK_SELECTOR_TITLE]: "Skill Path",
    [BASE_COPY_KEYS.SKILL_TIER_LABEL]: "Skill Tier",
    [BASE_COPY_KEYS.SKILL_COUNT_LABEL]: "Challenges Completed",
    [BASE_COPY_KEYS.KINGDOM_PROGRESS_LABEL]: "Kingdom Progress",
    [BASE_COPY_KEYS.LOCKED_REQUIREMENT]: "Unlocks at Palace Level {palaceLevel}",
    [BASE_COPY_KEYS.UPGRADE_MODAL_TITLE]: "Upgrade {buildingLabel}",
    [BASE_COPY_KEYS.UPGRADE_CURRENT_LEVEL_LABEL]: "Current Level",
    [BASE_COPY_KEYS.UPGRADE_NEXT_LEVEL_LABEL]: "Next Level",
    [BASE_COPY_KEYS.UPGRADE_COIN_COST_LABEL]: "Coin Cost",
    [BASE_COPY_KEYS.UPGRADE_CHALLENGE_LABEL]: "Skill Challenge",
    [BASE_COPY_KEYS.UPGRADE_CHALLENGE_REQUIREMENT]: "Pass {passCount} of {questionsRequired} questions",
    [BASE_COPY_KEYS.UPGRADE_FREE_TIMER_LABEL]: "Free Timer",
    [BASE_COPY_KEYS.UPGRADE_PRO_TIMER_LABEL]: "Sahib Pro Timer",
    [BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_TITLE]: "Upgrade Faster",
    [BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_BODY]: "Free build time: {freeTimer}. Sahib Pro build time: {proTimer}.",
    [BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_CTA]: "Build 80% Faster",
    [BASE_COPY_KEYS.UPGRADE_CONFIRM_CTA]: "Start Upgrade",
    [BASE_COPY_KEYS.UPGRADE_CLOSE_CTA]: "Close",
    [BASE_COPY_KEYS.REWARD_PREVIEW_TITLE]: "Battle Rewards",
    [BASE_COPY_KEYS.REWARD_PREVIEW_FREE_WIN_BODY]: "You earned {finalCoinsFormatted} coins. Sahib Pro would give you {proCoinsFormatted} coins for this win.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_FREE_DRAW_BODY]: "You earned {finalCoinsFormatted} coins. Sahib Pro would give you {proCoinsFormatted} coins for this draw.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_FREE_LOSS_BODY]: "You earned {finalCoinsFormatted} coins. Sahib Pro would give you {proCoinsFormatted} coins for this match.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_PRO_BODY]: "You earned {finalCoinsFormatted} coins with Sahib Pro.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_ZERO_BODY]: "This match did not award coins.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_CTA]: "Triple Your Battle Rewards",
    [BASE_BUILDING_COPY_KEYS.palace.label]: "Palace / Main Core",
    [BASE_BUILDING_COPY_KEYS.palace.purpose]: "Main kingdom anchor",
    [BASE_BUILDING_COPY_KEYS.learning_hall.label]: "Learning Hall / Library",
    [BASE_BUILDING_COPY_KEYS.learning_hall.purpose]: "Skill-learning symbol",
    [BASE_BUILDING_COPY_KEYS.attack_tower.label]: "Attack Tower",
    [BASE_BUILDING_COPY_KEYS.attack_tower.purpose]: "Defense identity",
    [BASE_BUILDING_COPY_KEYS.treasury.label]: "Treasury / Coin Vault",
    [BASE_BUILDING_COPY_KEYS.treasury.purpose]: "Coin economy identity",
    [BASE_BUILDING_COPY_KEYS.wall_gate.label]: "Wall Gate / Defense Wall",
    [BASE_BUILDING_COPY_KEYS.wall_gate.purpose]: "Base defense identity",
    [BASE_BUILDING_COPY_KEYS.drone_station.label]: "Drone Station",
    [BASE_BUILDING_COPY_KEYS.drone_station.purpose]: "AI/future-tech identity",
    [BASE_BUILDING_COPY_KEYS.trophy_hall.label]: "Trophy Hall",
    [BASE_BUILDING_COPY_KEYS.trophy_hall.purpose]: "Status progress identity",
    [BASE_LEARNING_TRACK_COPY_KEYS.english.label]: "English for Careers",
    [BASE_LEARNING_TRACK_COPY_KEYS.english.purpose]: "Jobs, interviews, and communication",
    [BASE_LEARNING_TRACK_COPY_KEYS.english.challengeCountLabel]: "English Challenges Completed",
    [BASE_LEARNING_TRACK_COPY_KEYS.ai_agents.label]: "AI Agent Builder",
    [BASE_LEARNING_TRACK_COPY_KEYS.ai_agents.purpose]: "Build and use AI agents",
    [BASE_LEARNING_TRACK_COPY_KEYS.ai_agents.challengeCountLabel]: "AI Agent Challenges Completed",
    [BASE_SKILL_TIER_KEYS.english.newSpeaker]: "New Speaker",
    [BASE_SKILL_TIER_KEYS.english.risingCommunicator]: "Rising Communicator",
    [BASE_SKILL_TIER_KEYS.english.confidentSpeaker]: "Confident Speaker",
    [BASE_SKILL_TIER_KEYS.english.fluentBuilder]: "Fluent Builder",
    [BASE_SKILL_TIER_KEYS.english.communicationMaster]: "Communication Master",
    [BASE_SKILL_TIER_KEYS.ai_agents.aiExplorer]: "AI Explorer",
    [BASE_SKILL_TIER_KEYS.ai_agents.promptBuilder]: "Prompt Builder",
    [BASE_SKILL_TIER_KEYS.ai_agents.agentBuilder]: "Agent Builder",
    [BASE_SKILL_TIER_KEYS.ai_agents.automationStrategist]: "Automation Strategist",
    [BASE_SKILL_TIER_KEYS.ai_agents.aiAgentArchitect]: "AI Agent Architect"
  }),
  [BASE_LANGUAGES.AR]: Object.freeze({
    [BASE_COPY_KEYS.SCREEN_TITLE]: "مملكة Sahib",
    [BASE_COPY_KEYS.QUICK_BATTLE_CTA]: "معركة سريعة",
    [BASE_COPY_KEYS.COINS_LABEL]: "العملات",
    [BASE_COPY_KEYS.HEARTS_LABEL]: "القلوب",
    [BASE_COPY_KEYS.HEARTS_UNLIMITED]: "بلا حدود",
    [BASE_COPY_KEYS.LANGUAGE_SWITCH]: "English | العربية",
    [BASE_COPY_KEYS.PRO_BADGE_FREE]: "مجاني",
    [BASE_COPY_KEYS.PRO_BADGE_ACTIVE]: "Sahib Pro",
    [BASE_COPY_KEYS.TRACK_SELECTOR_TITLE]: "مسار المهارة",
    [BASE_COPY_KEYS.SKILL_TIER_LABEL]: "رتبة المهارة",
    [BASE_COPY_KEYS.SKILL_COUNT_LABEL]: "التحديات المكتملة",
    [BASE_COPY_KEYS.KINGDOM_PROGRESS_LABEL]: "تقدم المملكة",
    [BASE_COPY_KEYS.LOCKED_REQUIREMENT]: "يفتح عند مستوى القصر {palaceLevel}",
    [BASE_COPY_KEYS.UPGRADE_MODAL_TITLE]: "ترقية {buildingLabel}",
    [BASE_COPY_KEYS.UPGRADE_CURRENT_LEVEL_LABEL]: "المستوى الحالي",
    [BASE_COPY_KEYS.UPGRADE_NEXT_LEVEL_LABEL]: "المستوى التالي",
    [BASE_COPY_KEYS.UPGRADE_COIN_COST_LABEL]: "تكلفة العملات",
    [BASE_COPY_KEYS.UPGRADE_CHALLENGE_LABEL]: "تحدي المهارة",
    [BASE_COPY_KEYS.UPGRADE_CHALLENGE_REQUIREMENT]: "اجتز {passCount} من {questionsRequired} أسئلة",
    [BASE_COPY_KEYS.UPGRADE_FREE_TIMER_LABEL]: "مؤقت المجاني",
    [BASE_COPY_KEYS.UPGRADE_PRO_TIMER_LABEL]: "مؤقت Sahib Pro",
    [BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_TITLE]: "ترقية أسرع",
    [BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_BODY]: "وقت البناء المجاني: {freeTimer}. مع Sahib Pro: {proTimer}.",
    [BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_CTA]: "ابنِ أسرع 80%",
    [BASE_COPY_KEYS.UPGRADE_CONFIRM_CTA]: "ابدأ الترقية",
    [BASE_COPY_KEYS.UPGRADE_CLOSE_CTA]: "إغلاق",
    [BASE_COPY_KEYS.REWARD_PREVIEW_TITLE]: "مكافآت المعركة",
    [BASE_COPY_KEYS.REWARD_PREVIEW_FREE_WIN_BODY]: "ربحت {finalCoinsFormatted} عملة. مع Sahib Pro كنت ستحصل على {proCoinsFormatted} عملة في هذا الفوز.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_FREE_DRAW_BODY]: "ربحت {finalCoinsFormatted} عملة. مع Sahib Pro كنت ستحصل على {proCoinsFormatted} عملة في هذا التعادل.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_FREE_LOSS_BODY]: "ربحت {finalCoinsFormatted} عملة. مع Sahib Pro كنت ستحصل على {proCoinsFormatted} عملة في هذه المباراة.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_PRO_BODY]: "ربحت {finalCoinsFormatted} عملة مع Sahib Pro.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_ZERO_BODY]: "هذه المباراة لم تمنح عملات.",
    [BASE_COPY_KEYS.REWARD_PREVIEW_CTA]: "ضاعف مكافآتك 3 مرات",
    [BASE_BUILDING_COPY_KEYS.palace.label]: "القصر / النواة الرئيسية",
    [BASE_BUILDING_COPY_KEYS.palace.purpose]: "مركز المملكة الرئيسي",
    [BASE_BUILDING_COPY_KEYS.learning_hall.label]: "قاعة التعلم / المكتبة",
    [BASE_BUILDING_COPY_KEYS.learning_hall.purpose]: "رمز التقدم المهاري",
    [BASE_BUILDING_COPY_KEYS.attack_tower.label]: "برج الهجوم",
    [BASE_BUILDING_COPY_KEYS.attack_tower.purpose]: "هوية الدفاع",
    [BASE_BUILDING_COPY_KEYS.treasury.label]: "الخزنة / مخزن العملات",
    [BASE_BUILDING_COPY_KEYS.treasury.purpose]: "هوية اقتصاد العملات",
    [BASE_BUILDING_COPY_KEYS.wall_gate.label]: "بوابة السور / جدار الدفاع",
    [BASE_BUILDING_COPY_KEYS.wall_gate.purpose]: "هوية دفاع القاعدة",
    [BASE_BUILDING_COPY_KEYS.drone_station.label]: "محطة الدرون",
    [BASE_BUILDING_COPY_KEYS.drone_station.purpose]: "هوية الذكاء والتقنية",
    [BASE_BUILDING_COPY_KEYS.trophy_hall.label]: "قاعة الجوائز",
    [BASE_BUILDING_COPY_KEYS.trophy_hall.purpose]: "هوية المكانة والتقدم",
    [BASE_LEARNING_TRACK_COPY_KEYS.english.label]: "الإنجليزية للمهن",
    [BASE_LEARNING_TRACK_COPY_KEYS.english.purpose]: "الوظائف والمقابلات والتواصل",
    [BASE_LEARNING_TRACK_COPY_KEYS.english.challengeCountLabel]: "تحديات الإنجليزية مكتملة",
    [BASE_LEARNING_TRACK_COPY_KEYS.ai_agents.label]: "بناء وكلاء الذكاء الاصطناعي",
    [BASE_LEARNING_TRACK_COPY_KEYS.ai_agents.purpose]: "بناء واستخدام وكلاء الذكاء الاصطناعي",
    [BASE_LEARNING_TRACK_COPY_KEYS.ai_agents.challengeCountLabel]: "تحديات وكلاء الذكاء مكتملة",
    [BASE_SKILL_TIER_KEYS.english.newSpeaker]: "متحدث جديد",
    [BASE_SKILL_TIER_KEYS.english.risingCommunicator]: "متواصل صاعد",
    [BASE_SKILL_TIER_KEYS.english.confidentSpeaker]: "متحدث واثق",
    [BASE_SKILL_TIER_KEYS.english.fluentBuilder]: "باني طليق",
    [BASE_SKILL_TIER_KEYS.english.communicationMaster]: "خبير التواصل",
    [BASE_SKILL_TIER_KEYS.ai_agents.aiExplorer]: "مستكشف الذكاء الاصطناعي",
    [BASE_SKILL_TIER_KEYS.ai_agents.promptBuilder]: "باني الأوامر",
    [BASE_SKILL_TIER_KEYS.ai_agents.agentBuilder]: "باني الوكلاء",
    [BASE_SKILL_TIER_KEYS.ai_agents.automationStrategist]: "استراتيجي الأتمتة",
    [BASE_SKILL_TIER_KEYS.ai_agents.aiAgentArchitect]: "مهندس وكلاء الذكاء"
  })
});

export function getSupportedBaseLanguages() {
  return [
    Object.freeze({ code: BASE_LANGUAGES.EN, label: "English" }),
    Object.freeze({ code: BASE_LANGUAGES.AR, label: "العربية" })
  ];
}

export function normalizeBaseLanguage(language) {
  return Object.values(BASE_LANGUAGES).includes(language)
    ? language
    : BASE_LANGUAGES.EN;
}

export function getBaseCopy(language, key, values = {}) {
  const normalizedLanguage = normalizeBaseLanguage(language);
  const template =
    BASE_TRANSLATIONS[normalizedLanguage]?.[key] ??
    BASE_TRANSLATIONS[BASE_LANGUAGES.EN]?.[key] ??
    key;

  return interpolateCopy(template, values);
}

export function hasBaseCopyKey(language, key) {
  const normalizedLanguage = normalizeBaseLanguage(language);
  return Boolean(BASE_TRANSLATIONS[normalizedLanguage]?.[key]);
}

function interpolateCopy(template, values) {
  return String(template).replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      return match;
    }

    return String(values[key]);
  });
}
