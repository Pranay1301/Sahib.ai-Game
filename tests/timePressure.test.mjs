import assert from "node:assert/strict";
import test from "node:test";

import {
  BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE,
  INTENSE_DOOR_ENEMY_COUNTS_BY_PHASE,
  MATCH_PRESSURE_PHASES,
  getDoorEnemyCountsForPhase,
  getDoorEnemySpawnCount,
  getMatchPressurePhase
} from "../src/game/timePressure.js";

test("match pressure phase follows the documented 8-minute breakpoints", () => {
  assert.equal(getMatchPressurePhase(0).id, MATCH_PRESSURE_PHASES.OPENING_CONTACT);
  assert.equal(getMatchPressurePhase(44.99).id, MATCH_PRESSURE_PHASES.OPENING_CONTACT);
  assert.equal(getMatchPressurePhase(45).id, MATCH_PRESSURE_PHASES.EARLY_FIGHT);
  assert.equal(getMatchPressurePhase(119.99).id, MATCH_PRESSURE_PHASES.EARLY_FIGHT);
  assert.equal(getMatchPressurePhase(120).id, MATCH_PRESSURE_PHASES.MID_FIGHT);
  assert.equal(getMatchPressurePhase(329.99).id, MATCH_PRESSURE_PHASES.MID_FIGHT);
  assert.equal(getMatchPressurePhase(330).id, MATCH_PRESSURE_PHASES.FINAL_CHAOS);
  assert.equal(getMatchPressurePhase(480).id, MATCH_PRESSURE_PHASES.FINAL_CHAOS);
});

test("baseline door enemy count table matches Phase 7 rules", () => {
  assert.deepEqual(
    getDoorEnemyCountsForPhase(MATCH_PRESSURE_PHASES.OPENING_CONTACT),
    [1, 1, 2]
  );
  assert.deepEqual(getDoorEnemyCountsForPhase(MATCH_PRESSURE_PHASES.EARLY_FIGHT), [2, 2, 2]);
  assert.deepEqual(getDoorEnemyCountsForPhase(MATCH_PRESSURE_PHASES.MID_FIGHT), [3, 3, 3]);
  assert.deepEqual(getDoorEnemyCountsForPhase(MATCH_PRESSURE_PHASES.FINAL_CHAOS), [4, 4, 4]);
  assert.equal(Object.keys(BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE).length, 4);
});

test("intense table is available only behind an explicit option", () => {
  assert.deepEqual(
    getDoorEnemyCountsForPhase(MATCH_PRESSURE_PHASES.MID_FIGHT, { useIntenseTable: true }),
    INTENSE_DOOR_ENEMY_COUNTS_BY_PHASE[MATCH_PRESSURE_PHASES.MID_FIGHT]
  );
});

test("door spawn count is based on match elapsed time and door sequence index", () => {
  assert.equal(getDoorEnemySpawnCount(0, 0), 1);
  assert.equal(getDoorEnemySpawnCount(0, 2), 2);
  assert.equal(getDoorEnemySpawnCount(90, 2), 2);
  assert.equal(getDoorEnemySpawnCount(180, 1), 3);
  assert.equal(getDoorEnemySpawnCount(400, 0), 4);
});
