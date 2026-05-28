import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_IDS,
  BUILDING_STATES,
  LEARNING_TRACKS
} from "../src/base/baseConfig.js";
import {
  createDefaultGameState,
  createDefaultProfile,
  createInitialUserBuildings
} from "../src/base/baseBackend.js";
import {
  BASE_HOME_SLOT_LAYOUT,
  BASE_HOME_TOTAL_VISUAL_STATES,
  createBaseHomeSlots,
  createBaseHomeViewModel,
  createSkillBadgeViewModel,
  getKingdomProgress,
  getSkillTierKey
} from "../src/base/baseHomeModel.js";
import {
  BASE_BUILDING_COPY_KEYS,
  BASE_COPY_KEYS,
  BASE_SKILL_TIER_KEYS
} from "../src/base/baseLocalization.js";
import { BASE_BUILDING_TAP_ACTIONS } from "../src/base/baseUnlocks.js";

const USER_ID = "user_phase4";

test("Phase 4 home model creates exactly seven fixed building slots", () => {
  const model = createBaseHomeViewModel({
    profile: createDefaultProfile(USER_ID),
    gameState: createDefaultGameState(USER_ID),
    buildings: createInitialUserBuildings(USER_ID)
  });

  assert.equal(model.slots.length, 7);
  assert.deepEqual(model.slots.map((slot) => slot.buildingId), [
    BASE_BUILDING_IDS.PALACE,
    BASE_BUILDING_IDS.LEARNING_HALL,
    BASE_BUILDING_IDS.ATTACK_TOWER,
    BASE_BUILDING_IDS.TREASURY,
    BASE_BUILDING_IDS.WALL_GATE,
    BASE_BUILDING_IDS.DRONE_STATION,
    BASE_BUILDING_IDS.TROPHY_HALL
  ]);
  assert.equal(model.slots.some((slot) => slot.buildingId === "innovation_hub"), false);
  assert.equal(model.slots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.WALL_GATE).labelKey, BASE_BUILDING_COPY_KEYS.wall_gate.label);
});

test("fixed slot layout uses normalized positions from the visual slot-map concept", () => {
  assert.deepEqual(Object.keys(BASE_HOME_SLOT_LAYOUT), [
    "slot_palace",
    "slot_learning_hall",
    "slot_attack_tower",
    "slot_treasury",
    "slot_wall_gate",
    "slot_drone_station",
    "slot_trophy_hall"
  ]);

  for (const layout of Object.values(BASE_HOME_SLOT_LAYOUT)) {
    assert.ok(layout.x > 0 && layout.x < 1);
    assert.ok(layout.y > 0 && layout.y < 1);
    assert.ok(layout.width > 0 && layout.width < 1);
    assert.ok(layout.height > 0 && layout.height < 1);
    assert.ok(Number.isInteger(layout.layer));
  }
});

test("home model exposes coin, heart, language, Pro, and quick battle shell data", () => {
  const model = createBaseHomeViewModel({
    profile: createDefaultProfile(USER_ID, {
      language: "en",
      is_pro: false
    }),
    gameState: createDefaultGameState(USER_ID, {
      coins: 425,
      hearts_remaining: 2
    }),
    buildings: createInitialUserBuildings(USER_ID)
  });

  assert.equal(model.titleKey, BASE_COPY_KEYS.SCREEN_TITLE);
  assert.equal(model.hud.coins, 425);
  assert.equal(model.hud.coinsLabelKey, BASE_COPY_KEYS.COINS_LABEL);
  assert.equal(model.hud.heartsRemaining, 2);
  assert.equal(model.hud.heartsMax, 4);
  assert.equal(model.hud.isUnlimitedHearts, false);
  assert.equal(model.proBadge.isPro, false);
  assert.equal(model.proBadge.labelKey, BASE_COPY_KEYS.PRO_BADGE_FREE);
  assert.equal(model.languageSwitch.options.length, 2);
  assert.equal(model.quickBattleAction.labelKey, BASE_COPY_KEYS.QUICK_BATTLE_CTA);
  assert.equal(model.skillTrackSelector.field, "learning_track");
  assert.deepEqual(model.skillTrackSelector.options.map((option) => option.value), [
    LEARNING_TRACKS.ENGLISH,
    LEARNING_TRACKS.AI_AGENTS
  ]);
});

test("Pro home model shows unlimited hearts without changing quick-round logic", () => {
  const model = createBaseHomeViewModel({
    profile: createDefaultProfile(USER_ID, {
      is_pro: true
    }),
    gameState: createDefaultGameState(USER_ID, {
      hearts_remaining: 0
    }),
    buildings: createInitialUserBuildings(USER_ID)
  });

  assert.equal(model.hud.heartsRemaining, null);
  assert.equal(model.hud.isUnlimitedHearts, true);
  assert.equal(model.hud.heartsLabelKey, BASE_COPY_KEYS.HEARTS_UNLIMITED);
  assert.equal(model.proBadge.isPro, true);
  assert.equal(model.proBadge.labelKey, BASE_COPY_KEYS.PRO_BADGE_ACTIVE);
});

test("building slots reflect Palace unlocks and locked requirement copy keys", () => {
  const levelOneSlots = createBaseHomeSlots({
    buildings: createInitialUserBuildings(USER_ID, { palaceLevel: 1 }),
    palaceLevel: 1
  });
  const attackTower = levelOneSlots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.ATTACK_TOWER);
  const wallGate = levelOneSlots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.WALL_GATE);
  assert.equal(attackTower.state, BUILDING_STATES.LOCKED);
  assert.equal(attackTower.lockedRequirement.palaceLevel, 2);
  assert.equal(attackTower.lockedRequirement.labelKey, BASE_COPY_KEYS.LOCKED_REQUIREMENT);
  assert.equal(wallGate.lockedRequirement.palaceLevel, 3);

  const levelThreeRows = createInitialUserBuildings(USER_ID, { palaceLevel: 3 });
  const levelThreeSlots = createBaseHomeSlots({
    buildings: levelThreeRows,
    palaceLevel: 3
  });
  assert.equal(
    levelThreeSlots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.WALL_GATE).state,
    BUILDING_STATES.AVAILABLE
  );
});

test("home slots resolve stale locked rows from Palace level and expose tap results", () => {
  const staleRows = createInitialUserBuildings(USER_ID, { palaceLevel: 1 }).map((building) => {
    if (building.building_id === BASE_BUILDING_IDS.PALACE) {
      return {
        ...building,
        level: 2,
        state: BUILDING_STATES.AVAILABLE
      };
    }
    if (building.building_id === BASE_BUILDING_IDS.ATTACK_TOWER) {
      return {
        ...building,
        state: BUILDING_STATES.LOCKED
      };
    }
    return building;
  });
  const slots = createBaseHomeSlots({ buildings: staleRows });
  const attackTower = slots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.ATTACK_TOWER);
  const wallGate = slots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.WALL_GATE);

  assert.equal(attackTower.state, BUILDING_STATES.AVAILABLE);
  assert.equal(attackTower.tapResult.action, BASE_BUILDING_TAP_ACTIONS.UPGRADE_AVAILABLE);
  assert.equal(attackTower.tapResult.level, 1);
  assert.equal(wallGate.state, BUILDING_STATES.LOCKED);
  assert.equal(wallGate.tapResult.action, BASE_BUILDING_TAP_ACTIONS.LOCKED_REQUIREMENT);
  assert.equal(wallGate.tapResult.requirement.palaceLevel, 3);
  assert.equal(Object.prototype.hasOwnProperty.call(wallGate.tapResult, "upgradeCost"), false);
});

test("home model exposes Phase 6 upgrade modal for selected available buildings", () => {
  const rows = createInitialUserBuildings(USER_ID, { palaceLevel: 2 }).map((building) =>
    building.building_id === BASE_BUILDING_IDS.PALACE
      ? { ...building, level: 2 }
      : building
  );
  const model = createBaseHomeViewModel({
    profile: createDefaultProfile(USER_ID, {
      is_pro: false
    }),
    gameState: createDefaultGameState(USER_ID, {
      coins: 3000
    }),
    buildings: rows,
    selectedBuildingId: BASE_BUILDING_IDS.ATTACK_TOWER
  });
  const attackTower = model.slots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.ATTACK_TOWER);

  assert.equal(model.upgradeModal.buildingId, BASE_BUILDING_IDS.ATTACK_TOWER);
  assert.equal(model.upgradeModal.currentLevel.level, 1);
  assert.equal(model.upgradeModal.nextLevel.level, 2);
  assert.equal(model.upgradeModal.coinCost.coins, 3000);
  assert.equal(model.upgradeModal.challenge.requirement, "Pass 4 of 5 questions");
  assert.equal(model.upgradeModal.timers.free.formatted, "1 hour");
  assert.equal(model.upgradeModal.timers.pro.formatted, "12 min");
  assert.equal(model.upgradeModal.proUpsell.ctaKey, BASE_COPY_KEYS.UPGRADE_PRO_UPSELL_CTA);
  assert.equal(attackTower.tapResult.action, BASE_BUILDING_TAP_ACTIONS.UPGRADE_AVAILABLE);
  assert.equal(attackTower.tapResult.upgradePreview.buildingId, BASE_BUILDING_IDS.ATTACK_TOWER);
});

test("home model does not open Phase 6 upgrade modal for locked selected buildings", () => {
  const model = createBaseHomeViewModel({
    profile: createDefaultProfile(USER_ID),
    gameState: createDefaultGameState(USER_ID),
    buildings: createInitialUserBuildings(USER_ID, { palaceLevel: 1 }),
    selectedBuildingId: BASE_BUILDING_IDS.WALL_GATE
  });

  assert.equal(model.upgradeModal, null);
});

test("home model exposes Phase 9 skill challenge preview for quiz-required buildings", () => {
  const rows = createInitialUserBuildings(USER_ID, { palaceLevel: 2 }).map((building) =>
    building.building_id === BASE_BUILDING_IDS.ATTACK_TOWER
      ? { ...building, state: BUILDING_STATES.QUIZ_REQUIRED }
      : building
  );
  const model = createBaseHomeViewModel({
    profile: createDefaultProfile(USER_ID, {
      learning_track: LEARNING_TRACKS.AI_AGENTS
    }),
    gameState: createDefaultGameState(USER_ID, {
      skill_challenges_completed: 4
    }),
    buildings: rows
  });
  const attackTower = model.slots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.ATTACK_TOWER);

  assert.equal(attackTower.state, BUILDING_STATES.QUIZ_REQUIRED);
  assert.equal(attackTower.tapResult.action, BASE_BUILDING_TAP_ACTIONS.QUIZ_REQUIRED);
  assert.equal(attackTower.tapResult.skillChallengePreview.learningTrack, LEARNING_TRACKS.AI_AGENTS);
  assert.equal(attackTower.tapResult.skillChallengePreview.questionCount, 5);
  assert.equal(attackTower.tapResult.skillChallengePreview.rules.passCount, 4);
  assert.equal(attackTower.tapResult.skillChallengePreview.startAction.label, "Start Skill Challenge");
});

test("building slots expose predictable placeholder asset keys for Level 1 through Level 6", () => {
  const rows = createInitialUserBuildings(USER_ID).map((building) =>
    building.building_id === BASE_BUILDING_IDS.PALACE
      ? { ...building, level: 6, state: BUILDING_STATES.MAX_LEVEL }
      : building
  );
  const slots = createBaseHomeSlots({ buildings: rows, palaceLevel: 6 });
  const palace = slots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.PALACE);

  assert.equal(palace.assetKey, "/images/buildings/palace_level_6.png");
  assert.equal(palace.state, BUILDING_STATES.MAX_LEVEL);
  assert.equal(palace.isMaxLevel, true);
});

test("skill badge tier keys follow the documented English and AI thresholds", () => {
  assert.equal(getSkillTierKey(LEARNING_TRACKS.ENGLISH, 0), BASE_SKILL_TIER_KEYS.english.newSpeaker);
  assert.equal(getSkillTierKey(LEARNING_TRACKS.ENGLISH, 10), BASE_SKILL_TIER_KEYS.english.risingCommunicator);
  assert.equal(getSkillTierKey(LEARNING_TRACKS.ENGLISH, 25), BASE_SKILL_TIER_KEYS.english.confidentSpeaker);
  assert.equal(getSkillTierKey(LEARNING_TRACKS.ENGLISH, 50), BASE_SKILL_TIER_KEYS.english.fluentBuilder);
  assert.equal(getSkillTierKey(LEARNING_TRACKS.ENGLISH, 100), BASE_SKILL_TIER_KEYS.english.communicationMaster);

  assert.equal(getSkillTierKey(LEARNING_TRACKS.AI_AGENTS, 0), BASE_SKILL_TIER_KEYS.ai_agents.aiExplorer);
  assert.equal(getSkillTierKey(LEARNING_TRACKS.AI_AGENTS, 10), BASE_SKILL_TIER_KEYS.ai_agents.promptBuilder);
  assert.equal(getSkillTierKey(LEARNING_TRACKS.AI_AGENTS, 25), BASE_SKILL_TIER_KEYS.ai_agents.agentBuilder);
  assert.equal(getSkillTierKey(LEARNING_TRACKS.AI_AGENTS, 50), BASE_SKILL_TIER_KEYS.ai_agents.automationStrategist);
  assert.equal(getSkillTierKey(LEARNING_TRACKS.AI_AGENTS, 100), BASE_SKILL_TIER_KEYS.ai_agents.aiAgentArchitect);
});

test("skill badge view model exposes challenge count and kingdom progress", () => {
  const buildings = createInitialUserBuildings(USER_ID).map((building) => ({
    ...building,
    level: 2
  }));
  const badge = createSkillBadgeViewModel({
    learningTrack: LEARNING_TRACKS.AI_AGENTS,
    challengesCompleted: 36,
    buildings,
    isPro: true
  });

  assert.equal(badge.learningTrack, LEARNING_TRACKS.AI_AGENTS);
  assert.equal(badge.learningTrackLabel, "AI Agent Builder");
  assert.equal(badge.tierKey, BASE_SKILL_TIER_KEYS.ai_agents.agentBuilder);
  assert.equal(badge.challengesCompleted, 36);
  assert.equal(badge.challengesLabel, "AI Agent Challenges Completed");
  assert.deepEqual(badge.kingdomProgress, {
    current: 14,
    total: BASE_HOME_TOTAL_VISUAL_STATES
  });
  assert.equal(badge.isPro, true);
});

test("Phase 8 home model switches selected skill track without changing building slots", () => {
  const model = createBaseHomeViewModel({
    profile: createDefaultProfile(USER_ID, {
      learning_track: LEARNING_TRACKS.AI_AGENTS
    }),
    gameState: createDefaultGameState(USER_ID, {
      skill_challenges_completed: 12
    }),
    buildings: createInitialUserBuildings(USER_ID)
  });

  assert.equal(model.skillTrackSelector.selectedTrack, LEARNING_TRACKS.AI_AGENTS);
  assert.equal(model.skillTrackSelector.options.find((option) => option.value === LEARNING_TRACKS.AI_AGENTS).selected, true);
  assert.equal(model.skillBadge.learningTrack, LEARNING_TRACKS.AI_AGENTS);
  assert.equal(model.skillBadge.tierKey, BASE_SKILL_TIER_KEYS.ai_agents.promptBuilder);
  assert.equal(model.skillBadge.challengesLabel, "AI Agent Challenges Completed");
  assert.deepEqual(model.slots.map((slot) => slot.buildingId), [
    BASE_BUILDING_IDS.PALACE,
    BASE_BUILDING_IDS.LEARNING_HALL,
    BASE_BUILDING_IDS.ATTACK_TOWER,
    BASE_BUILDING_IDS.TREASURY,
    BASE_BUILDING_IDS.WALL_GATE,
    BASE_BUILDING_IDS.DRONE_STATION,
    BASE_BUILDING_IDS.TROPHY_HALL
  ]);
});

test("kingdom progress is bounded to 7 buildings times 6 levels", () => {
  assert.deepEqual(getKingdomProgress([]), {
    current: 7,
    total: 42
  });

  const maxSlots = createBaseHomeSlots({
    buildings: createInitialUserBuildings(USER_ID).map((building) => ({
      ...building,
      level: 6,
      state: BUILDING_STATES.MAX_LEVEL
    })),
    palaceLevel: 6
  });
  assert.deepEqual(getKingdomProgress([], maxSlots), {
    current: 42,
    total: 42
  });
});

test("Arabic model uses Arabic copy while preserving localization keys", () => {
  const model = createBaseHomeViewModel({
    profile: createDefaultProfile(USER_ID, {
      language: "ar"
    }),
    gameState: createDefaultGameState(USER_ID),
    buildings: createInitialUserBuildings(USER_ID)
  });

  assert.equal(model.language, "ar");
  assert.equal(model.titleKey, BASE_COPY_KEYS.SCREEN_TITLE);
  assert.notEqual(model.title, "Sahib Kingdom");
  assert.equal(model.slots[0].labelKey, BASE_BUILDING_COPY_KEYS.palace.label);
  assert.notEqual(model.slots[0].label, "Palace / Main Core");
});
