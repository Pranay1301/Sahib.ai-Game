import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_DEFINITIONS,
  BASE_BUILDING_IDS,
  BASE_ECONOMY_CONFIG,
  BASE_SLOT_IDS,
  BUILDING_STATES,
  LEARNING_TRACKS,
  calculateFinalCoins,
  getBaseCoinsForOutcome,
  getBuildingDefinition,
  getFreeTimerMinutesForTargetLevel,
  getNextBuildingLevel,
  getTimerDurationMinutesForTargetLevel,
  getUpgradeCostForTargetLevel,
  isBuildingUnlocked
} from "../src/base/baseConfig.js";

test("Phase 3 base config keeps the documented V1 scope constants", () => {
  assert.deepEqual(Object.values(LEARNING_TRACKS), ["english", "ai_agents"]);
  assert.equal(BASE_ECONOMY_CONFIG.proCoinMultiplier, 3);
  assert.equal(BASE_ECONOMY_CONFIG.proTimerMultiplier, 0.2);
  assert.equal(BASE_ECONOMY_CONFIG.heartsMax, 4);
  assert.equal(BASE_ECONOMY_CONFIG.heartRefillMinutes, 30);
  assert.equal(BASE_ECONOMY_CONFIG.maxBuildingLevel, 6);
  assert.equal(BASE_BUILDING_DEFINITIONS.length, 7);
  assert.equal(Object.keys(BASE_BUILDING_IDS).length, 7);
  assert.equal(Object.keys(BASE_SLOT_IDS).length, 7);
  assert.ok(Object.values(BUILDING_STATES).includes("quiz_required"));
});

test("building definitions match the MD unlock order and fixed slot IDs", () => {
  assert.equal(getBuildingDefinition(BASE_BUILDING_IDS.PALACE).slotId, BASE_SLOT_IDS.PALACE);
  assert.equal(getBuildingDefinition(BASE_BUILDING_IDS.LEARNING_HALL).unlock.type, "start");
  assert.equal(getBuildingDefinition(BASE_BUILDING_IDS.ATTACK_TOWER).unlock.palaceLevel, 2);
  assert.equal(getBuildingDefinition(BASE_BUILDING_IDS.TREASURY).unlock.palaceLevel, 2);
  assert.equal(getBuildingDefinition(BASE_BUILDING_IDS.WALL_GATE).unlock.palaceLevel, 3);
  assert.equal(getBuildingDefinition(BASE_BUILDING_IDS.DRONE_STATION).unlock.palaceLevel, 4);
  assert.equal(getBuildingDefinition(BASE_BUILDING_IDS.TROPHY_HALL).unlock.palaceLevel, 5);
  assert.equal(getBuildingDefinition("innovation_hub"), null);
});

test("base coin and Pro final coin helpers use coins-only V1 values", () => {
  assert.equal(getBaseCoinsForOutcome("win"), 100);
  assert.equal(getBaseCoinsForOutcome("draw"), 50);
  assert.equal(getBaseCoinsForOutcome("loss"), 25);
  assert.equal(getBaseCoinsForOutcome("unknown"), 0);
  assert.equal(calculateFinalCoins(100, false), 100);
  assert.equal(calculateFinalCoins(100, true), 300);
  assert.equal(calculateFinalCoins(-10, true), 0);
});

test("upgrade costs and timers match the base-building docs", () => {
  assert.equal(getUpgradeCostForTargetLevel(2), 3000);
  assert.equal(getUpgradeCostForTargetLevel(3), 8000);
  assert.equal(getUpgradeCostForTargetLevel(4), 20000);
  assert.equal(getUpgradeCostForTargetLevel(5), 50000);
  assert.equal(getUpgradeCostForTargetLevel(6), 100000);
  assert.equal(getUpgradeCostForTargetLevel(2, { isTutorialUpgrade: true }), 0);

  assert.equal(getFreeTimerMinutesForTargetLevel(2), 60);
  assert.equal(getFreeTimerMinutesForTargetLevel(3), 180);
  assert.equal(getFreeTimerMinutesForTargetLevel(4), 360);
  assert.equal(getFreeTimerMinutesForTargetLevel(5), 720);
  assert.equal(getFreeTimerMinutesForTargetLevel(6), 1440);

  assert.equal(getTimerDurationMinutesForTargetLevel(2, true), 12);
  assert.equal(getTimerDurationMinutesForTargetLevel(3, true), 36);
  assert.equal(getTimerDurationMinutesForTargetLevel(4, true), 72);
  assert.equal(getTimerDurationMinutesForTargetLevel(5, true), 144);
  assert.equal(getTimerDurationMinutesForTargetLevel(6, true), 288);
});

test("level and unlock helpers enforce Level 1 through Level 6 progression", () => {
  assert.equal(getNextBuildingLevel(1), 2);
  assert.equal(getNextBuildingLevel(5), 6);
  assert.equal(getNextBuildingLevel(6), null);
  assert.equal(getNextBuildingLevel("bad"), null);

  const palace = getBuildingDefinition(BASE_BUILDING_IDS.PALACE);
  const attackTower = getBuildingDefinition(BASE_BUILDING_IDS.ATTACK_TOWER);
  const wallGate = getBuildingDefinition(BASE_BUILDING_IDS.WALL_GATE);

  assert.equal(isBuildingUnlocked(palace, 1), true);
  assert.equal(isBuildingUnlocked(attackTower, 1), false);
  assert.equal(isBuildingUnlocked(attackTower, 2), true);
  assert.equal(isBuildingUnlocked(wallGate, 2), false);
  assert.equal(isBuildingUnlocked(wallGate, 3), true);
  assert.equal(isBuildingUnlocked(null, 6), false);
});

test("unsupported target levels fail instead of creating hidden economy values", () => {
  assert.throws(() => getUpgradeCostForTargetLevel(1), RangeError);
  assert.throws(() => getFreeTimerMinutesForTargetLevel(7), RangeError);
  assert.throws(() => getTimerDurationMinutesForTargetLevel(0), RangeError);
});
