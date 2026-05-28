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
  SKILL_TIER_LABEL: "base.skill.tierLabel",
  SKILL_COUNT_LABEL: "base.skill.countLabel",
  KINGDOM_PROGRESS_LABEL: "base.skill.kingdomProgressLabel",
  LOCKED_REQUIREMENT: "base.building.lockedRequirement"
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
    [BASE_COPY_KEYS.SKILL_TIER_LABEL]: "Skill Tier",
    [BASE_COPY_KEYS.SKILL_COUNT_LABEL]: "Challenges Completed",
    [BASE_COPY_KEYS.KINGDOM_PROGRESS_LABEL]: "Kingdom Progress",
    [BASE_COPY_KEYS.LOCKED_REQUIREMENT]: "Unlocks at Palace Level {palaceLevel}",
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
    [BASE_COPY_KEYS.SKILL_TIER_LABEL]: "رتبة المهارة",
    [BASE_COPY_KEYS.SKILL_COUNT_LABEL]: "التحديات المكتملة",
    [BASE_COPY_KEYS.KINGDOM_PROGRESS_LABEL]: "تقدم المملكة",
    [BASE_COPY_KEYS.LOCKED_REQUIREMENT]: "يفتح عند مستوى القصر {palaceLevel}",
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
