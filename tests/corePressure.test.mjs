import assert from "node:assert/strict";
import test from "node:test";

import {
  CORE_PRESSURE_START_SECONDS,
  CORE_PRESSURE_ROUTE_POINTS_BY_LANE_ID,
  CORE_PRESSURE_WAVE_CONFIG_BY_PHASE,
  CORE_PRESSURE_ZONE_ID,
  createCorePressureState,
  tickCorePressure
} from "../src/game/corePressure.js";
import {
  ENEMY_STATS,
  ENEMY_TYPES,
  tickEnemyBehavior
} from "../src/game/enemyBehavior.js";
import { distanceBetween } from "../src/game/heroCombat.js";
import {
  CORE_PRESSURE_SPAWN_POINTS,
  PLAYER_CORE_ATTACK_POSITION,
  isWalkableBody
} from "../src/game/mapLayout.js";
import { MATCH_PRESSURE_PHASES } from "../src/game/timePressure.js";

test("Core pressure does not spawn during opening contact", () => {
  const state = createCorePressureState();
  const tick = tickCorePressure(state, 1, {
    elapsedSeconds: CORE_PRESSURE_START_SECONDS - 0.01
  });

  assert.equal(tick.spawnedEnemies.length, 0);
  assert.equal(tick.corePressure.waveCount, 0);
});

test("Core pressure starts at 45 seconds with one Hunter Exosuit", () => {
  const state = createCorePressureState();
  const tick = tickCorePressure(state, 0.05, {
    elapsedSeconds: CORE_PRESSURE_START_SECONDS
  });

  assert.equal(tick.spawnedEnemies.length, 1);
  assert.equal(tick.spawnedEnemies[0].type, ENEMY_TYPES.HUNTER_EXOSUIT);
  assert.equal(tick.spawnedEnemies[0].zoneId, CORE_PRESSURE_ZONE_ID);
  assert.equal(tick.spawnedEnemies[0].doorId, CORE_PRESSURE_SPAWN_POINTS[0].id);
  assert.ok(tick.spawnedEnemies[0].routePoints.length > 0);
  assert.equal(tick.spawnedEnemies[0].maxHp, ENEMY_STATS[ENEMY_TYPES.HUNTER_EXOSUIT].maxHp);
  assert.equal(tick.spawnedEnemies[0].hp, ENEMY_STATS[ENEMY_TYPES.HUNTER_EXOSUIT].maxHp);
  assert.equal(
    tick.corePressure.nextWaveRemainingSeconds,
    CORE_PRESSURE_WAVE_CONFIG_BY_PHASE[MATCH_PRESSURE_PHASES.EARLY_FIGHT].intervalSeconds
  );
});

test("Core pressure uses interval timing before repeating an early wave", () => {
  const firstTick = tickCorePressure(createCorePressureState(), 0.05, {
    elapsedSeconds: CORE_PRESSURE_START_SECONDS
  });
  const tooSoonTick = tickCorePressure(firstTick.corePressure, 10, {
    elapsedSeconds: CORE_PRESSURE_START_SECONDS + 10
  });
  const intervalTick = tickCorePressure(tooSoonTick.corePressure, 25, {
    elapsedSeconds: CORE_PRESSURE_START_SECONDS + 35
  });

  assert.equal(tooSoonTick.spawnedEnemies.length, 0);
  assert.equal(intervalTick.spawnedEnemies.length, 1);
  assert.equal(intervalTick.corePressure.waveCount, 2);
});

test("Core pressure wave count scales by phase without changing enemy stats", () => {
  const midTick = tickCorePressure(createCorePressureState(), 0.05, {
    elapsedSeconds: 120
  });
  const finalTick = tickCorePressure(createCorePressureState(), 0.05, {
    elapsedSeconds: 330
  });

  assert.equal(midTick.spawnedEnemies.length, 2);
  assert.equal(finalTick.spawnedEnemies.length, 3);
  for (const enemy of [...midTick.spawnedEnemies, ...finalTick.spawnedEnemies]) {
    assert.equal(enemy.type, ENEMY_TYPES.HUNTER_EXOSUIT);
    assert.equal(enemy.maxHp, ENEMY_STATS[ENEMY_TYPES.HUNTER_EXOSUIT].maxHp);
    assert.equal(enemy.hp, ENEMY_STATS[ENEMY_TYPES.HUNTER_EXOSUIT].maxHp);
  }
});

test("Core pressure spawn points are walkable and cycle by lane", () => {
  for (const spawnPoint of CORE_PRESSURE_SPAWN_POINTS) {
    assert.equal(isWalkableBody(spawnPoint.point), true, `${spawnPoint.id} should be walkable`);
    for (const routePoint of CORE_PRESSURE_ROUTE_POINTS_BY_LANE_ID[spawnPoint.laneId]) {
      assert.equal(isWalkableBody(routePoint), true, `${spawnPoint.laneId} route should stay walkable`);
    }
  }

  const tick = tickCorePressure(createCorePressureState(), 0.05, {
    elapsedSeconds: 330
  });

  assert.deepEqual(
    tick.spawnedEnemies.map((enemy) => enemy.doorId),
    CORE_PRESSURE_SPAWN_POINTS.map((spawnPoint) => spawnPoint.id)
  );
});

test("Core pressure enemies follow static lane routes toward Player Core", () => {
  const tick = tickCorePressure(createCorePressureState(), 0.05, {
    elapsedSeconds: 330
  });

  for (const enemy of tick.spawnedEnemies) {
    const before = distanceBetween(enemy.position, PLAYER_CORE_ATTACK_POSITION);
    const moved = tickEnemyBehavior(
      [enemy],
      {
        heroPosition: { x: 610, y: 710 },
        playerCorePosition: PLAYER_CORE_ATTACK_POSITION
      },
      1
    );
    const after = distanceBetween(moved.enemies[0].position, PLAYER_CORE_ATTACK_POSITION);

    assert.ok(after < before, `${enemy.doorId} should move closer to Player Core`);
  }
});

test("Core pressure does not tick while the match is paused", () => {
  const state = createCorePressureState();
  const tick = tickCorePressure(state, 1, {
    elapsedSeconds: 200,
    isRunning: false
  });

  assert.equal(tick.corePressure, state);
  assert.equal(tick.spawnedEnemies.length, 0);
});
