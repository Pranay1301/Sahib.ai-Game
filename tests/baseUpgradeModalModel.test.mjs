import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_IDS,
  BUILDING_STATES
} from "../src/base/baseConfig.js";
import {
  createDefaultGameState,
  createDefaultProfile
} from "../src/base/baseBackend.js";
import { BASE_COPY_KEYS } from "../src/base/baseLocalization.js";
import {
  BASE_UPGRADE_CHALLENGE_REQUIREMENT,
  createBuildingUpgradeModalFromSlots,
  createBuildingUpgradeModalViewModel,
  formatBaseDurationMinutes
} from "../src/base/baseUpgradeModalModel.js";

const USER_ID = "user_phase6";

test("Phase 6 upgrade modal exposes Level 1 to Level 2 cost, challenge, and timer preview", () => {
  const modal = createBuildingUpgradeModalViewModel({
    slot: createSlot({
      level: 1,
      state: BUILDING_STATES.AVAILABLE
    }),
    profile: createDefaultProfile(USER_ID, {
      is_pro: false
    }),
    gameState: createDefaultGameState(USER_ID, {
      coins: 3000
    }),
    language: "en"
  });

  assert.equal(modal.titleKey, BASE_COPY_KEYS.UPGRADE_MODAL_TITLE);
  assert.equal(modal.title, "Upgrade Attack Tower");
  assert.equal(modal.currentLevel.level, 1);
  assert.equal(modal.nextLevel.level, 2);
  assert.equal(modal.coinCost.coins, 3000);
  assert.equal(modal.coinCost.canAfford, true);
  assert.equal(modal.challenge.passCount, BASE_UPGRADE_CHALLENGE_REQUIREMENT.passCount);
  assert.equal(modal.challenge.questionsRequired, BASE_UPGRADE_CHALLENGE_REQUIREMENT.questionsRequired);
  assert.equal(modal.challenge.requirement, "Pass 4 of 5 questions");
  assert.equal(modal.timers.free.minutes, 60);
  assert.equal(modal.timers.free.formatted, "1 hour");
  assert.equal(modal.timers.pro.minutes, 12);
  assert.equal(modal.timers.pro.formatted, "12 min");
  assert.equal(modal.timers.active.minutes, 60);
  assert.equal(modal.proUpsell.fasterPercent, 80);
  assert.equal(modal.proUpsell.body, "Sahib Pro uses 12 min instead of 1 hour for this upgrade.");
  assert.equal(modal.confirmAction.disabled, false);
});

test("Pro upgrade modal uses Pro timer as active timer and does not show upsell", () => {
  const modal = createBuildingUpgradeModalViewModel({
    slot: createSlot({
      level: 3,
      state: BUILDING_STATES.AVAILABLE
    }),
    profile: createDefaultProfile(USER_ID, {
      is_pro: true
    }),
    gameState: createDefaultGameState(USER_ID, {
      coins: 20000
    })
  });

  assert.equal(modal.nextLevel.level, 4);
  assert.equal(modal.coinCost.coins, 20000);
  assert.equal(modal.timers.free.minutes, 360);
  assert.equal(modal.timers.free.formatted, "6 hours");
  assert.equal(modal.timers.pro.minutes, 72);
  assert.equal(modal.timers.pro.formatted, "1 hr 12 min");
  assert.equal(modal.timers.active.minutes, 72);
  assert.equal(modal.timers.active.labelKey, BASE_COPY_KEYS.UPGRADE_PRO_TIMER_LABEL);
  assert.equal(modal.proUpsell, null);
});

test("upgrade modal disables confirm when the user has fewer coins than the upgrade cost", () => {
  const modal = createBuildingUpgradeModalViewModel({
    slot: createSlot({
      level: 2,
      state: BUILDING_STATES.AVAILABLE
    }),
    gameState: createDefaultGameState(USER_ID, {
      coins: 7999
    })
  });

  assert.equal(modal.coinCost.coins, 8000);
  assert.equal(modal.coinCost.availableCoins, 7999);
  assert.equal(modal.coinCost.canAfford, false);
  assert.equal(modal.confirmAction.disabled, true);
});

test("upgrade modal does not open for locked, in-progress, or max-level buildings", () => {
  assert.equal(
    createBuildingUpgradeModalViewModel({
      slot: createSlot({
        state: BUILDING_STATES.LOCKED
      })
    }),
    null
  );
  assert.equal(
    createBuildingUpgradeModalViewModel({
      slot: createSlot({
        state: BUILDING_STATES.QUIZ_REQUIRED
      })
    }),
    null
  );
  assert.equal(
    createBuildingUpgradeModalViewModel({
      slot: createSlot({
        level: 6,
        state: BUILDING_STATES.MAX_LEVEL
      })
    }),
    null
  );
});

test("upgrade modal can be selected from slots by building id only when available", () => {
  const slots = [
    createSlot({
      buildingId: BASE_BUILDING_IDS.PALACE,
      slotId: "slot_palace",
      label: "Palace / Main Core",
      state: BUILDING_STATES.AVAILABLE
    }),
    createSlot({
      buildingId: BASE_BUILDING_IDS.WALL_GATE,
      slotId: "slot_wall_gate",
      label: "Wall Gate / Defense Wall",
      state: BUILDING_STATES.LOCKED
    })
  ];

  assert.equal(
    createBuildingUpgradeModalFromSlots({
      slots,
      buildingId: BASE_BUILDING_IDS.PALACE
    }).buildingId,
    BASE_BUILDING_IDS.PALACE
  );
  assert.equal(
    createBuildingUpgradeModalFromSlots({
      slots,
      buildingId: BASE_BUILDING_IDS.WALL_GATE
    }),
    null
  );
});

test("duration formatting follows documented free and Pro timer wording", () => {
  assert.equal(formatBaseDurationMinutes(12, "en"), "12 min");
  assert.equal(formatBaseDurationMinutes(60, "en"), "1 hour");
  assert.equal(formatBaseDurationMinutes(180, "en"), "3 hours");
  assert.equal(formatBaseDurationMinutes(144, "en"), "2 hr 24 min");
  assert.equal(formatBaseDurationMinutes(72, "ar"), "1 س 12 د");
});

test("Arabic upgrade modal uses Arabic copy while preserving numeric upgrade values", () => {
  const modal = createBuildingUpgradeModalViewModel({
    slot: createSlot({
      level: 5,
      state: BUILDING_STATES.AVAILABLE
    }),
    profile: createDefaultProfile(USER_ID, {
      language: "ar"
    }),
    gameState: createDefaultGameState(USER_ID, {
      coins: 100000
    }),
    language: "ar"
  });

  assert.equal(modal.nextLevel.level, 6);
  assert.equal(modal.coinCost.coins, 100000);
  assert.equal(modal.challenge.passCount, 4);
  assert.equal(modal.challenge.questionsRequired, 5);
  assert.notEqual(modal.coinCost.label, "Coin Cost");
  assert.notEqual(modal.confirmAction.label, "Start Upgrade");
});

function createSlot(overrides = {}) {
  return {
    slotId: "slot_attack_tower",
    buildingId: BASE_BUILDING_IDS.ATTACK_TOWER,
    labelKey: "base.building.attackTower.label",
    label: "Attack Tower",
    level: 1,
    state: BUILDING_STATES.AVAILABLE,
    ...overrides
  };
}
