import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { PNG } from "pngjs";

import {
  CENTER_COOLDOWN_SECONDS,
  DOOR_SEQUENCE_GAP_SECONDS,
  INTERSECTION_COOLDOWN_SECONDS,
  CENTER_DOOR_ENCOUNTER_ZONE,
  createDoorEncounterState,
  getDoorEncounterZoneState,
  isPointInsideZoneTrigger,
  randomizeDoorSequence,
  tickDoorEncounters
} from "../src/game/doorEncounters.js";
import { CENTER_ZONE, MAJOR_INTERSECTIONS } from "../src/game/mapLayout.js";
import {
  BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE,
  MATCH_PRESSURE_PHASES
} from "../src/game/timePressure.js";

const TEST_ZONE = MAJOR_INTERSECTIONS[0];
const DOOR_SPRITE_PATH = "assets/phase5/mechanical-door-sprite.png";

test("entering an intersection starts a 3-door encounter and opens the first door immediately", () => {
  const state = tickDoorEncounters(
    createDoorEncounterState({ seed: 7 }),
    TEST_ZONE.center,
    0
  );
  const zoneState = getDoorEncounterZoneState(state, TEST_ZONE.id);

  assert.equal(zoneState.triggerCount, 1);
  assert.equal(zoneState.cooldownRemainingSeconds, INTERSECTION_COOLDOWN_SECONDS);
  assert.equal(zoneState.activeEvent.sequenceDoorIds.length, 3);
  assert.equal(zoneState.activeEvent.openedDoorIds.length, 1);
  assert.equal(state.doorSignals.length, 1);
  assert.equal(
    state.spawnedEnemies.length,
    BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE[MATCH_PRESSURE_PHASES.OPENING_CONTACT][0]
  );
});

test("door sequence opens the second and third doors after 2.5 second gaps", () => {
  let state = tickDoorEncounters(
    createDoorEncounterState({ seed: 11 }),
    TEST_ZONE.center,
    0
  );

  state = tickDoorEncounters(state, TEST_ZONE.center, DOOR_SEQUENCE_GAP_SECONDS - 0.1);
  assert.equal(getDoorEncounterZoneState(state, TEST_ZONE.id).activeEvent.openedDoorIds.length, 1);
  assert.equal(state.doorSignals.length, 1);

  state = tickDoorEncounters(state, TEST_ZONE.center, 0.1);
  assert.equal(getDoorEncounterZoneState(state, TEST_ZONE.id).activeEvent.openedDoorIds.length, 2);
  assert.equal(state.doorSignals.length, 2);

  state = tickDoorEncounters(state, TEST_ZONE.center, DOOR_SEQUENCE_GAP_SECONDS);
  assert.equal(getDoorEncounterZoneState(state, TEST_ZONE.id).activeEvent, null);
  assert.equal(state.doorSignals.length, 3);
  assert.equal(
    state.spawnedEnemies.length,
    BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE[MATCH_PRESSURE_PHASES.OPENING_CONTACT].reduce(
      (total, count) => total + count,
      0
    )
  );
});

test("same intersection cannot retrigger during cooldown", () => {
  let state = tickDoorEncounters(
    createDoorEncounterState({ seed: 13 }),
    TEST_ZONE.center,
    0
  );

  state = tickDoorEncounters(state, TEST_ZONE.center, DOOR_SEQUENCE_GAP_SECONDS * 2);
  const triggerCount = getDoorEncounterZoneState(state, TEST_ZONE.id).triggerCount;

  state = tickDoorEncounters(state, TEST_ZONE.center, 1);

  assert.equal(getDoorEncounterZoneState(state, TEST_ZONE.id).triggerCount, triggerCount);
});

test("intersection can retrigger after cooldown expires", () => {
  let state = tickDoorEncounters(
    createDoorEncounterState({ seed: 17 }),
    TEST_ZONE.center,
    0
  );

  state = tickDoorEncounters(state, TEST_ZONE.center, INTERSECTION_COOLDOWN_SECONDS);

  assert.equal(getDoorEncounterZoneState(state, TEST_ZONE.id).triggerCount, 2);
});

test("randomized door order contains each door exactly once", () => {
  const state = tickDoorEncounters(
    createDoorEncounterState({ seed: 19 }),
    TEST_ZONE.center,
    0
  );
  const sequenceDoorIds = getDoorEncounterZoneState(state, TEST_ZONE.id).activeEvent.sequenceDoorIds;

  assert.deepEqual(
    [...sequenceDoorIds].sort(),
    TEST_ZONE.doors.map((door) => door.id).sort()
  );
});

test("randomizer avoids repeating the same first door when possible", () => {
  const previousFirstDoorId = TEST_ZONE.doors[0].id;
  const result = randomizeDoorSequence(TEST_ZONE.doors, {
    previousFirstDoorId,
    randomValues: [0.99, 0.99]
  });

  assert.notEqual(result.sequence[0].id, previousFirstDoorId);
  assert.deepEqual(
    result.sequence.map((door) => door.id).sort(),
    TEST_ZONE.doors.map((door) => door.id).sort()
  );
});

test("seeded door randomization is reproducible", () => {
  const first = randomizeDoorSequence(TEST_ZONE.doors, { seed: 1234 });
  const second = randomizeDoorSequence(TEST_ZONE.doors, { seed: 1234 });

  assert.deepEqual(
    first.sequence.map((door) => door.id),
    second.sequence.map((door) => door.id)
  );
  assert.equal(first.seed, second.seed);
});

test("paused or non-running encounters do not advance door timers", () => {
  const state = tickDoorEncounters(
    createDoorEncounterState({ seed: 23 }),
    TEST_ZONE.center,
    0
  );
  const paused = tickDoorEncounters(state, TEST_ZONE.center, DOOR_SEQUENCE_GAP_SECONDS, {
    isRunning: false
  });

  assert.equal(paused, state);
  assert.equal(getDoorEncounterZoneState(paused, TEST_ZONE.id).activeEvent.openedDoorIds.length, 1);
});

test("trigger radius uses the current map intersection metadata", () => {
  assert.equal(isPointInsideZoneTrigger(TEST_ZONE.center, TEST_ZONE), true);
  assert.equal(
    isPointInsideZoneTrigger(
      {
        x: TEST_ZONE.center.x + TEST_ZONE.triggerRadius + 1,
        y: TEST_ZONE.center.y
      },
      TEST_ZONE
    ),
    false
  );
});

test("center zone uses the same randomized 3-door encounter system", () => {
  const state = tickDoorEncounters(
    createDoorEncounterState({ seed: 29 }),
    CENTER_ZONE.center,
    0
  );
  const centerState = getDoorEncounterZoneState(state, CENTER_ZONE.id);

  assert.equal(CENTER_DOOR_ENCOUNTER_ZONE.type, "center");
  assert.equal(centerState.triggerCount, 1);
  assert.equal(centerState.cooldownRemainingSeconds, CENTER_COOLDOWN_SECONDS);
  assert.equal(centerState.activeEvent.sequenceDoorIds.length, 3);
  assert.equal(centerState.activeEvent.openedDoorIds.length, 1);
  assert.deepEqual(
    [...centerState.activeEvent.sequenceDoorIds].sort(),
    CENTER_ZONE.doors.map((door) => door.id).sort()
  );
});

test("center zone opens all doors in sequence and can retrigger after its cooldown", () => {
  let state = tickDoorEncounters(
    createDoorEncounterState({ seed: 31 }),
    CENTER_ZONE.center,
    0
  );

  state = tickDoorEncounters(state, CENTER_ZONE.center, DOOR_SEQUENCE_GAP_SECONDS * 2);
  assert.equal(getDoorEncounterZoneState(state, CENTER_ZONE.id).activeEvent, null);
  assert.equal(state.doorSignals.length, 3);
  assert.equal(
    state.spawnedEnemies.length,
    BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE[MATCH_PRESSURE_PHASES.OPENING_CONTACT].reduce(
      (total, count) => total + count,
      0
    )
  );

  state = tickDoorEncounters(state, CENTER_ZONE.center, 1);
  assert.equal(getDoorEncounterZoneState(state, CENTER_ZONE.id).triggerCount, 1);

  state = tickDoorEncounters(state, CENTER_ZONE.center, CENTER_COOLDOWN_SECONDS - DOOR_SEQUENCE_GAP_SECONDS * 2 - 1);
  assert.equal(getDoorEncounterZoneState(state, CENTER_ZONE.id).triggerCount, 2);
});

test("door encounters use current match phase enemy count table for the full sequence", () => {
  let state = tickDoorEncounters(
    createDoorEncounterState({ seed: 37 }),
    TEST_ZONE.center,
    0,
    { elapsedSeconds: 330 }
  );
  const zoneState = getDoorEncounterZoneState(state, TEST_ZONE.id);

  assert.equal(zoneState.activeEvent.pressurePhaseId, MATCH_PRESSURE_PHASES.FINAL_CHAOS);
  assert.deepEqual(
    zoneState.activeEvent.enemyCountsByDoorIndex,
    BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE[MATCH_PRESSURE_PHASES.FINAL_CHAOS]
  );
  assert.equal(state.spawnedEnemies.length, 4);
  assert.equal(state.doorSignals[0].spawnCount, 4);

  state = tickDoorEncounters(state, TEST_ZONE.center, DOOR_SEQUENCE_GAP_SECONDS * 2);

  assert.equal(getDoorEncounterZoneState(state, TEST_ZONE.id).activeEvent, null);
  assert.equal(state.spawnedEnemies.length, 12);
  assert.deepEqual(
    state.doorSignals.map((signal) => signal.spawnCount),
    [4, 4, 4]
  );
});

test("mechanical door sprite sheet has four transparent animation frames", () => {
  const image = PNG.sync.read(fs.readFileSync(DOOR_SPRITE_PATH));
  assert.equal(image.width, 128 * 4);
  assert.equal(image.height, 48);

  const cornerAlpha = image.data[3];
  assert.equal(cornerAlpha, 0);
});
