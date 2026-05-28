import assert from "node:assert/strict";
import test from "node:test";

import {
  ENEMY_CORE_ATTACK_DAMAGE_PER_SECOND,
  ENEMY_CORE_DEFENSE_ZONE_ID,
  createCoreDefenseState,
  getCoreDefenseWaveTypes,
  tickCoreDefense
} from "../src/game/coreDefense.js";
import { ENEMY_TYPES } from "../src/game/enemyBehavior.js";
import { createHeroCombatState } from "../src/game/heroCombat.js";
import { createMatchState } from "../src/game/matchState.js";
import { MATCH_STATUS } from "../src/game/constants.js";
import {
  ENEMY_CORE_ATTACK_POSITION,
  ENEMY_CORE_DEFENSE_DOORS,
  isWalkableBody
} from "../src/game/mapLayout.js";
import {
  MATCH_PRESSURE_PHASES
} from "../src/game/timePressure.js";
import { WALL_TOOL_TYPES } from "../src/game/wallSystem.js";

test("Enemy Core defense doors are walkable side-door spawn points", () => {
  assert.equal(ENEMY_CORE_DEFENSE_DOORS.length, 2);
  for (const door of ENEMY_CORE_DEFENSE_DOORS) {
    assert.equal(isWalkableBody(door.center), true, `${door.id} should be walkable`);
  }
});

test("Enemy Core defense does not trigger above the 75 percent threshold", () => {
  const match = createRunningMatch({ enemyCoreHp: 751 });
  const tick = tickCoreDefense(createCoreDefenseState(), match, farHero(), 0.5);

  assert.equal(tick.spawnedEnemies.length, 0);
  assert.deepEqual(tick.coreDefense.triggeredThresholdIds, []);
});

test("Enemy Core defense triggers the 75 percent wave exactly once", () => {
  const match = createRunningMatch({ enemyCoreHp: 750, elapsedSeconds: 60 });
  const firstTick = tickCoreDefense(createCoreDefenseState(), match, farHero(), 0.5);
  const repeatTick = tickCoreDefense(firstTick.coreDefense, match, farHero(), 0.5);

  assert.equal(firstTick.spawnedEnemies.length, 1);
  assert.equal(firstTick.spawnedEnemies[0].type, ENEMY_TYPES.ALIEN_HUNTER);
  assert.equal(firstTick.spawnedEnemies[0].zoneId, ENEMY_CORE_DEFENSE_ZONE_ID);
  assert.equal(firstTick.spawnedEnemies[0].doorId, ENEMY_CORE_DEFENSE_DOORS[0].id);
  assert.deepEqual(firstTick.coreDefense.triggeredThresholdIds, ["enemy_core_75"]);
  assert.equal(firstTick.coreDefense.doorSignals.length, 1);
  assert.equal(repeatTick.spawnedEnemies.length, 0);
  assert.deepEqual(repeatTick.coreDefense.triggeredThresholdIds, ["enemy_core_75"]);
});

test("Enemy Core defense intensity increases by threshold and match phase", () => {
  assert.deepEqual(
    getCoreDefenseWaveTypes("enemy_core_75", MATCH_PRESSURE_PHASES.MID_FIGHT),
    [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.BREAKER_BOT]
  );
  assert.deepEqual(
    getCoreDefenseWaveTypes("enemy_core_25", MATCH_PRESSURE_PHASES.FINAL_CHAOS),
    [
      ENEMY_TYPES.ALIEN_HUNTER,
      ENEMY_TYPES.HEAVY_BRUTE,
      ENEMY_TYPES.BREAKER_BOT,
      ENEMY_TYPES.ALIEN_HUNTER
    ]
  );

  const match = createRunningMatch({ enemyCoreHp: 250, elapsedSeconds: 330 });
  const state = {
    ...createCoreDefenseState(),
    triggeredThresholdIds: ["enemy_core_75", "enemy_core_50"]
  };
  const tick = tickCoreDefense(state, match, farHero(), 0.5);

  assert.deepEqual(
    tick.spawnedEnemies.map((enemy) => enemy.type),
    [
      ENEMY_TYPES.ALIEN_HUNTER,
      ENEMY_TYPES.HEAVY_BRUTE,
      ENEMY_TYPES.BREAKER_BOT,
      ENEMY_TYPES.ALIEN_HUNTER
    ]
  );
  assert.deepEqual(tick.coreDefense.triggeredThresholdIds, [
    "enemy_core_75",
    "enemy_core_50",
    "enemy_core_25"
  ]);
});

test("Enemy Core lightly damages the hero while in range", () => {
  const match = createRunningMatch({ enemyCoreHp: 900, elapsedSeconds: 90 });
  const hero = createHeroCombatState({
    position: {
      x: ENEMY_CORE_ATTACK_POSITION.x,
      y: ENEMY_CORE_ATTACK_POSITION.y + 60
    }
  });
  const tick = tickCoreDefense(createCoreDefenseState(), match, hero, 1);

  assert.equal(tick.heroDamage, ENEMY_CORE_ATTACK_DAMAGE_PER_SECOND);
});

test("Enemy Core attack does not hit out of range or through a Block Wall", () => {
  const match = createRunningMatch({ enemyCoreHp: 900, elapsedSeconds: 90 });
  const farTick = tickCoreDefense(createCoreDefenseState(), match, farHero(), 1);
  const nearbyHero = createHeroCombatState({
    position: {
      x: ENEMY_CORE_ATTACK_POSITION.x,
      y: ENEMY_CORE_ATTACK_POSITION.y + 60
    }
  });
  const blockedTick = tickCoreDefense(createCoreDefenseState(), match, nearbyHero, 1, {
    walls: [
      {
        id: "test_block_wall",
        type: WALL_TOOL_TYPES.BLOCK,
        position: {
          x: ENEMY_CORE_ATTACK_POSITION.x,
          y: ENEMY_CORE_ATTACK_POSITION.y + 30
        },
        rotation: 0,
        hp: 180,
        maxHp: 180
      }
    ]
  });

  assert.equal(farTick.heroDamage, 0);
  assert.equal(blockedTick.heroDamage, 0);
});

function createRunningMatch(overrides = {}) {
  return createMatchState({
    status: MATCH_STATUS.RUNNING,
    ...overrides
  });
}

function farHero() {
  return createHeroCombatState({
    position: {
      x: 610,
      y: 710
    }
  });
}
