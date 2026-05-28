import assert from "node:assert/strict";
import test from "node:test";

import {
  ENEMY_STATS,
  ENEMY_TYPES,
  createEnemy
} from "../src/game/enemyBehavior.js";
import {
  RIFLE,
  normalizeVector
} from "../src/game/heroCombat.js";
import {
  addProjectileSpawns,
  createProjectileState,
  tickProjectiles
} from "../src/game/projectiles.js";
import {
  WALL_TOOL_TYPES,
  createWallSystemState,
  placeWallToolAtSocket
} from "../src/game/wallSystem.js";

test("rifle projectile damages an enemy only when the shot path intersects it", () => {
  const enemy = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "projectile_target",
    position: { x: 650, y: 420 }
  });
  const projectileState = addProjectileSpawns(createProjectileState(), [
    createTestProjectileSpawn({
      origin: { x: 570, y: 420 },
      direction: { x: 1, y: 0 }
    })
  ]);

  const tick = tickProjectiles(projectileState, 0.2, { enemies: [enemy] });

  assert.equal(tick.enemies.length, 1);
  assert.equal(
    tick.enemies[0].hp,
    ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].maxHp - RIFLE.damageToEnemy
  );
  assert.equal(tick.projectileState.active.length, 0);
  assert.equal(tick.projectileState.trails.length, 1);
});

test("rifle projectile misses when the aim line does not intersect the enemy", () => {
  const enemy = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "missed_target",
    position: { x: 650, y: 460 }
  });
  const projectileState = addProjectileSpawns(createProjectileState(), [
    createTestProjectileSpawn({
      origin: { x: 570, y: 420 },
      direction: { x: 1, y: 0 }
    })
  ]);

  const tick = tickProjectiles(projectileState, 0.08, { enemies: [enemy] });

  assert.equal(tick.enemies[0].hp, ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].maxHp);
  assert.equal(tick.projectileState.active.length, 1);
});

test("killed enemies remain briefly for the death animation", () => {
  const enemy = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "death_visual_target",
    position: { x: 650, y: 420 }
  });
  const projectileState = addProjectileSpawns(createProjectileState(), [
    createTestProjectileSpawn({
      origin: { x: 570, y: 420 },
      direction: { x: 1, y: 0 }
    })
  ]);

  const tick = tickProjectiles(projectileState, 0.2, {
    enemies: [
      {
        ...enemy,
        hp: RIFLE.damageToEnemy
      }
    ]
  });

  assert.equal(tick.enemyKills, 1);
  assert.equal(tick.enemies.length, 1);
  assert.equal(tick.enemies[0].hp, 0);
  assert.ok(tick.enemies[0].deathAnimationRemainingSeconds > 0);
});

test("rifle projectile is blocked by walkmask walls before reaching an enemy", () => {
  const enemy = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "wall_blocked_target",
    position: { x: 940, y: 380 }
  });
  const projectileState = addProjectileSpawns(createProjectileState(), [
    createTestProjectileSpawn({
      origin: { x: 790, y: 340 },
      direction: normalizeVector({ x: 150, y: 40 })
    })
  ]);

  const tick = tickProjectiles(projectileState, 0.3, { enemies: [enemy] });

  assert.equal(tick.enemies[0].hp, ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].maxHp);
  assert.equal(tick.projectileState.active.length, 0);
});

test("rifle projectile is blocked by placed walls and damages the wall", () => {
  const wallSystem = placeWallToolAtSocket(
    createWallSystemState(),
    WALL_TOOL_TYPES.BLOCK,
    "player_mid_defense",
    { heroPosition: { x: 560, y: 610 }, enemies: [] }
  ).wallSystem;
  const enemy = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "wall_protected_target",
    position: { x: 690, y: 600 }
  });
  const projectileState = addProjectileSpawns(createProjectileState(), [
    createTestProjectileSpawn({
      origin: { x: 560, y: 600 },
      direction: { x: 1, y: 0 }
    })
  ]);

  const tick = tickProjectiles(projectileState, 0.3, {
    enemies: [enemy],
    walls: wallSystem.activeWalls
  });

  assert.equal(tick.enemies[0].hp, ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].maxHp);
  assert.equal(tick.projectileState.active.length, 0);
  assert.deepEqual(tick.wallDamageEvents, [
    {
      wallId: wallSystem.activeWalls[0].id,
      amount: RIFLE.damageToEnemy
    }
  ]);
});

function createTestProjectileSpawn(overrides = {}) {
  return {
    origin: overrides.origin ?? { x: 570, y: 420 },
    direction: overrides.direction ?? { x: 1, y: 0 },
    range: 300,
    speed: 720,
    radius: RIFLE.projectileRadius,
    damageToEnemy: RIFLE.damageToEnemy,
    damageToEnemyCore: RIFLE.damageToEnemyCore
  };
}
