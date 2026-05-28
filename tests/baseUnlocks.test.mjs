import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_IDS,
  BUILDING_STATES
} from "../src/base/baseConfig.js";
import {
  BASE_BUILDING_TAP_ACTIONS,
  createBuildingTapResult,
  getBuildingUnlockRequirement,
  getPalaceLevelFromBuildings,
  resolveBaseBuildingRows,
  resolveBuildingState
} from "../src/base/baseUnlocks.js";

const USER_ID = "user_phase5";

test("Phase 5 derives Palace level from building rows and clamps invalid values", () => {
  assert.equal(getPalaceLevelFromBuildings([]), 1);
  assert.equal(getPalaceLevelFromBuildings([{ building_id: BASE_BUILDING_IDS.PALACE, level: 4.9 }]), 4);
  assert.equal(getPalaceLevelFromBuildings([{ building_id: BASE_BUILDING_IDS.PALACE, level: 0 }]), 1);
  assert.equal(getPalaceLevelFromBuildings([{ building_id: BASE_BUILDING_IDS.PALACE, level: 999 }]), 6);
});

test("building unlock requirements expose only documented Palace gates", () => {
  assert.equal(getBuildingUnlockRequirement(BASE_BUILDING_IDS.PALACE), null);
  assert.equal(getBuildingUnlockRequirement(BASE_BUILDING_IDS.LEARNING_HALL), null);
  assert.deepEqual(getBuildingUnlockRequirement(BASE_BUILDING_IDS.ATTACK_TOWER), {
    type: "palace_level",
    palaceLevel: 2
  });
  assert.deepEqual(getBuildingUnlockRequirement(BASE_BUILDING_IDS.TREASURY), {
    type: "palace_level",
    palaceLevel: 2
  });
  assert.deepEqual(getBuildingUnlockRequirement(BASE_BUILDING_IDS.WALL_GATE), {
    type: "palace_level",
    palaceLevel: 3
  });
  assert.deepEqual(getBuildingUnlockRequirement(BASE_BUILDING_IDS.DRONE_STATION), {
    type: "palace_level",
    palaceLevel: 4
  });
  assert.deepEqual(getBuildingUnlockRequirement(BASE_BUILDING_IDS.TROPHY_HALL), {
    type: "palace_level",
    palaceLevel: 5
  });
  assert.equal(getBuildingUnlockRequirement("unknown_building"), null);
});

test("initial resolved rows create all fixed buildings with Palace Level 1 unlocks", () => {
  const rows = resolveBaseBuildingRows([], {
    userId: USER_ID,
    palaceLevel: 1
  });

  assert.equal(rows.length, 7);
  assert.ok(rows.every((row) => row.user_id === USER_ID));
  assert.ok(rows.every((row) => row.level === 1));
  assert.equal(stateFor(rows, BASE_BUILDING_IDS.PALACE), BUILDING_STATES.AVAILABLE);
  assert.equal(stateFor(rows, BASE_BUILDING_IDS.LEARNING_HALL), BUILDING_STATES.AVAILABLE);
  assert.equal(stateFor(rows, BASE_BUILDING_IDS.ATTACK_TOWER), BUILDING_STATES.LOCKED);
  assert.equal(stateFor(rows, BASE_BUILDING_IDS.TREASURY), BUILDING_STATES.LOCKED);
});

test("resolved rows unlock stale locked buildings when Palace reaches each gate", () => {
  const staleLevelTwoRows = resolveBaseBuildingRows([], {
    userId: USER_ID,
    palaceLevel: 1
  }).map((row) => {
    if (row.building_id === BASE_BUILDING_IDS.PALACE) {
      return { ...row, level: 2, state: BUILDING_STATES.AVAILABLE };
    }
    if (
      row.building_id === BASE_BUILDING_IDS.ATTACK_TOWER ||
      row.building_id === BASE_BUILDING_IDS.TREASURY
    ) {
      return { ...row, state: BUILDING_STATES.LOCKED };
    }
    return row;
  });
  const levelTwoRows = resolveBaseBuildingRows(staleLevelTwoRows);

  assert.equal(stateFor(levelTwoRows, BASE_BUILDING_IDS.ATTACK_TOWER), BUILDING_STATES.AVAILABLE);
  assert.equal(stateFor(levelTwoRows, BASE_BUILDING_IDS.TREASURY), BUILDING_STATES.AVAILABLE);
  assert.equal(stateFor(levelTwoRows, BASE_BUILDING_IDS.WALL_GATE), BUILDING_STATES.LOCKED);

  assert.equal(stateFor(rowsForPalaceLevel(3), BASE_BUILDING_IDS.WALL_GATE), BUILDING_STATES.AVAILABLE);
  assert.equal(stateFor(rowsForPalaceLevel(4), BASE_BUILDING_IDS.DRONE_STATION), BUILDING_STATES.AVAILABLE);
  assert.equal(stateFor(rowsForPalaceLevel(5), BASE_BUILDING_IDS.TROPHY_HALL), BUILDING_STATES.AVAILABLE);
});

test("resolved rows preserve active states for unlocked buildings", () => {
  const rows = resolveBaseBuildingRows([
    {
      user_id: USER_ID,
      building_id: BASE_BUILDING_IDS.PALACE,
      level: 5,
      state: BUILDING_STATES.AVAILABLE
    },
    {
      user_id: USER_ID,
      building_id: BASE_BUILDING_IDS.ATTACK_TOWER,
      level: 2,
      state: BUILDING_STATES.QUIZ_REQUIRED
    },
    {
      user_id: USER_ID,
      building_id: BASE_BUILDING_IDS.TREASURY,
      level: 2,
      state: BUILDING_STATES.UPGRADING
    },
    {
      user_id: USER_ID,
      building_id: BASE_BUILDING_IDS.WALL_GATE,
      level: 2,
      state: BUILDING_STATES.COMPLETED
    }
  ]);

  assert.equal(stateFor(rows, BASE_BUILDING_IDS.ATTACK_TOWER), BUILDING_STATES.QUIZ_REQUIRED);
  assert.equal(stateFor(rows, BASE_BUILDING_IDS.TREASURY), BUILDING_STATES.UPGRADING);
  assert.equal(stateFor(rows, BASE_BUILDING_IDS.WALL_GATE), BUILDING_STATES.COMPLETED);
});

test("building state resolver turns stale locked rows into available rows after unlock", () => {
  assert.equal(
    resolveBuildingState({
      requestedState: BUILDING_STATES.LOCKED,
      unlocked: true,
      level: 1
    }),
    BUILDING_STATES.AVAILABLE
  );
  assert.equal(
    resolveBuildingState({
      requestedState: BUILDING_STATES.AVAILABLE,
      unlocked: false,
      level: 1
    }),
    BUILDING_STATES.LOCKED
  );
  assert.equal(
    resolveBuildingState({
      requestedState: BUILDING_STATES.AVAILABLE,
      unlocked: false,
      level: 6
    }),
    BUILDING_STATES.MAX_LEVEL
  );
});

test("locked building tap result returns requirement only", () => {
  const result = createBuildingTapResult({
    slotId: "slot_wall_gate",
    buildingId: BASE_BUILDING_IDS.WALL_GATE,
    state: BUILDING_STATES.LOCKED,
    level: 1,
    upgradeCost: 8000,
    timerDurationMinutes: 180,
    lockedRequirement: {
      palaceLevel: 3,
      labelKey: "base.locked.requirement",
      label: "Requires Palace Level 3"
    }
  });

  assert.equal(result.action, BASE_BUILDING_TAP_ACTIONS.LOCKED_REQUIREMENT);
  assert.equal(result.buildingId, BASE_BUILDING_IDS.WALL_GATE);
  assert.deepEqual(result.requirement, {
    palaceLevel: 3,
    labelKey: "base.locked.requirement",
    label: "Requires Palace Level 3"
  });
  assert.equal(hasOwn(result, "level"), false);
  assert.equal(hasOwn(result, "state"), false);
  assert.equal(hasOwn(result, "upgradeCost"), false);
  assert.equal(hasOwn(result, "timerDurationMinutes"), false);
});

test("available building tap result starts the upgrade path", () => {
  assert.deepEqual(
    createBuildingTapResult({
      slotId: "slot_attack_tower",
      buildingId: BASE_BUILDING_IDS.ATTACK_TOWER,
      state: BUILDING_STATES.AVAILABLE,
      level: 1
    }),
    {
      action: BASE_BUILDING_TAP_ACTIONS.UPGRADE_AVAILABLE,
      buildingId: BASE_BUILDING_IDS.ATTACK_TOWER,
      slotId: "slot_attack_tower",
      level: 1,
      state: BUILDING_STATES.AVAILABLE
    }
  );
});

function rowsForPalaceLevel(level) {
  return resolveBaseBuildingRows([
    {
      user_id: USER_ID,
      building_id: BASE_BUILDING_IDS.PALACE,
      level,
      state: BUILDING_STATES.AVAILABLE
    }
  ]);
}

function stateFor(rows, buildingId) {
  return rows.find((row) => row.building_id === buildingId)?.state;
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}
