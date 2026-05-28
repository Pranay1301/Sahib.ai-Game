import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { PNG } from "pngjs";

import {
  ENEMIES_PER_DOOR,
  ENEMY_STATS,
  ENEMY_TARGETS,
  ENEMY_TYPES,
  createDoorEnemySpawns,
  createEnemy,
  getDoorEnemyTypes,
  tickEnemyBehavior
} from "../src/game/enemyBehavior.js";
import {
  ATTACK_FRAME_COUNT,
  CHARACTER_SPRITE_CELL_SIZE,
  DIRECTION_COUNT,
  WALK_FRAME_COUNT,
  getDirectionIndexFromVector
} from "../src/game/characterAnimation.js";
import { distanceBetween } from "../src/game/heroCombat.js";
import {
  CENTER_ZONE,
  HERO_COLLISION_RADIUS,
  MAJOR_INTERSECTIONS,
  PLAYER_CORE_ATTACK_POSITION
} from "../src/game/mapLayout.js";
import {
  WALL_TOOL_TYPES,
  createWallSystemState,
  placeWallToolAtSocket
} from "../src/game/wallSystem.js";

const WALK_CHARACTER_SPRITES = [
  "assets/phase6/runtime/hero_walk_runtime.png",
  "assets/phase6/runtime/alien_hunter_walk_runtime.png",
  "assets/phase6/runtime/hunter_exosuit_walk_runtime.png",
  "assets/phase6/runtime/heavy_brute_walk_runtime.png",
  "assets/phase6/runtime/breaker_bot_walk_runtime.png"
];

const ATTACK_CHARACTER_SPRITES = [
  "assets/phase6/runtime/hero_shoot_runtime.png",
  "assets/phase6/runtime/alien_hunter_attack_runtime.png",
  "assets/phase6/runtime/hunter_exosuit_attack_runtime.png",
  "assets/phase6/runtime/heavy_brute_attack_runtime.png",
  "assets/phase6/runtime/breaker_bot_attack_runtime.png"
];

test("Phase 6 keeps exactly the four locked V1 enemy types", () => {
  assert.deepEqual(
    Object.keys(ENEMY_TYPES).sort(),
    ["ALIEN_HUNTER", "BREAKER_BOT", "HEAVY_BRUTE", "HUNTER_EXOSUIT"]
  );
  assert.equal(Object.keys(ENEMY_STATS).length, 4);
  assert.equal(ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].maxHp, 30);
  assert.equal(ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].speed, 42);
  assert.ok(ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].attackRange > 80);
  assert.equal(ENEMY_STATS[ENEMY_TYPES.HUNTER_EXOSUIT].target, ENEMY_TARGETS.PLAYER_CORE);
  assert.equal(ENEMY_STATS[ENEMY_TYPES.HUNTER_EXOSUIT].speed, 31);
  assert.equal(ENEMY_STATS[ENEMY_TYPES.HEAVY_BRUTE].damage, 12);
  assert.equal(ENEMY_STATS[ENEMY_TYPES.HEAVY_BRUTE].speed, 23);
  assert.ok(ENEMY_STATS[ENEMY_TYPES.HEAVY_BRUTE].attackRange > 80);
  assert.equal(ENEMY_STATS[ENEMY_TYPES.BREAKER_BOT].wallDamage, 28);
  assert.equal(ENEMY_STATS[ENEMY_TYPES.BREAKER_BOT].speed, 28);
  assert.ok(ENEMY_STATS[ENEMY_TYPES.BREAKER_BOT].attackRange > 80);
});

test("enemy collision bodies are smaller than their readable sprites", () => {
  for (const stats of Object.values(ENEMY_STATS)) {
    assert.ok(stats.collisionRadius * 2 < stats.renderSize, `${stats.id} collision should not match visual size`);
  }
});

test("door spawns create typed enemies at walkable spawn positions", () => {
  const zone = MAJOR_INTERSECTIONS[0];
  const spawned = createDoorEnemySpawns(zone, zone.doors[0], 1);

  assert.equal(spawned.enemies.length, ENEMIES_PER_DOOR);
  assert.equal(spawned.nextSpawnId, 3);
  assert.equal(spawned.enemies[0].type, ENEMY_TYPES.ALIEN_HUNTER);
  assert.equal(spawned.enemies[0].hp, ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].maxHp);
  assert.equal(spawned.enemies[0].zoneId, zone.id);
  assert.equal(spawned.enemies[0].doorId, zone.doors[0].id);
});

test("door spawns can scale count without changing enemy stats", () => {
  const zone = MAJOR_INTERSECTIONS[0];
  const spawned = createDoorEnemySpawns(zone, zone.doors[0], 1, { count: 4 });

  assert.equal(spawned.enemies.length, 4);
  assert.equal(spawned.nextSpawnId, 5);
  assert.deepEqual(
    spawned.enemies.map((enemy) => enemy.type),
    [
      ENEMY_TYPES.ALIEN_HUNTER,
      ENEMY_TYPES.BREAKER_BOT,
      ENEMY_TYPES.ALIEN_HUNTER,
      ENEMY_TYPES.BREAKER_BOT
    ]
  );
  assert.equal(spawned.enemies[2].maxHp, ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].maxHp);
  assert.equal(spawned.enemies[3].maxHp, ENEMY_STATS[ENEMY_TYPES.BREAKER_BOT].maxHp);
});

test("door enemy type selection follows V1 roles", () => {
  assert.deepEqual(
    getDoorEnemyTypes(CENTER_ZONE, CENTER_ZONE.doors[1]),
    [ENEMY_TYPES.BREAKER_BOT, ENEMY_TYPES.ALIEN_HUNTER]
  );
  assert.deepEqual(
    getDoorEnemyTypes(CENTER_ZONE, CENTER_ZONE.doors[2]),
    [ENEMY_TYPES.HEAVY_BRUTE, ENEMY_TYPES.ALIEN_HUNTER]
  );
  assert.equal(
    getDoorEnemyTypes(MAJOR_INTERSECTIONS[3], MAJOR_INTERSECTIONS[3].doors[0])[0],
    ENEMY_TYPES.HUNTER_EXOSUIT
  );
});

test("Alien Hunter damages the hero from short gun range", () => {
  const enemy = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "hunter_1",
    position: { x: 570, y: 420 }
  });
  const tick = tickEnemyBehavior(
    [enemy],
    { heroPosition: { x: 620, y: 420 }, playerCorePosition: PLAYER_CORE_ATTACK_POSITION },
    0.5
  );

  assert.equal(tick.heroDamage, ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].damage);
  assert.equal(tick.playerCoreDamage, 0);
  assert.equal(tick.enemies[0].attackCooldownRemainingSeconds, ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].attackCooldownSeconds);
  assert.ok(tick.enemies[0].attackAnimationRemainingSeconds > 0);
});

test("Hunter Exosuit damages Player Core instead of chasing the hero", () => {
  const enemy = createEnemy(ENEMY_TYPES.HUNTER_EXOSUIT, {
    id: "exosuit_1",
    position: { x: PLAYER_CORE_ATTACK_POSITION.x + 10, y: PLAYER_CORE_ATTACK_POSITION.y }
  });
  const tick = tickEnemyBehavior(
    [enemy],
    { heroPosition: { x: 1200, y: 250 }, playerCorePosition: PLAYER_CORE_ATTACK_POSITION },
    0.5
  );

  assert.equal(tick.heroDamage, 0);
  assert.equal(tick.playerCoreDamage, ENEMY_STATS[ENEMY_TYPES.HUNTER_EXOSUIT].damage);
});

test("enemy behavior keeps characters separated during chase", () => {
  const heroPosition = { x: 620, y: 420 };
  const first = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "separation_hunter_1",
    position: { x: 612, y: 420 }
  });
  const second = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "separation_hunter_2",
    position: { x: 614, y: 420 }
  });
  const tick = tickEnemyBehavior(
    [first, second],
    { heroPosition, playerCorePosition: PLAYER_CORE_ATTACK_POSITION },
    0.1
  );
  const enemyRadius = ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].collisionRadius;

  assert.ok(
    distanceBetween(tick.enemies[0].position, tick.enemies[1].position) >= enemyRadius * 2,
    "enemies should not stack on the same point"
  );
  for (const enemy of tick.enemies) {
    assert.ok(
      distanceBetween(enemy.position, heroPosition) >= enemyRadius + HERO_COLLISION_RADIUS,
      "enemies should keep distance from the hero body"
    );
  }
});

test("hero-pressure enemies can route around blocked walkmask paths", () => {
  const heroPosition = PLAYER_CORE_ATTACK_POSITION;
  const enemy = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "routing_hunter",
    position: { x: 1160, y: 216 }
  });
  const before = distanceBetween(enemy.position, heroPosition);
  const tick = tickEnemyBehavior(
    [enemy],
    { heroPosition, playerCorePosition: PLAYER_CORE_ATTACK_POSITION },
    1
  );
  const after = distanceBetween(tick.enemies[0].position, heroPosition);

  assert.ok(after < before);
  assert.ok(tick.enemies[0].dynamicRoutePoints.length > 0);
});

test("enemies attack placed walls when the wall blocks the target line", () => {
  const wallSystem = placeWallToolAtSocket(
    createWallSystemState(),
    WALL_TOOL_TYPES.BLOCK,
    "player_mid_defense",
    { heroPosition: { x: 560, y: 610 }, enemies: [] }
  ).wallSystem;
  const enemy = createEnemy(ENEMY_TYPES.ALIEN_HUNTER, {
    id: "wall_blocked_hunter",
    position: { x: 560, y: 610 }
  });
  const tick = tickEnemyBehavior(
    [enemy],
    {
      heroPosition: { x: 690, y: 610 },
      playerCorePosition: PLAYER_CORE_ATTACK_POSITION,
      walls: wallSystem.activeWalls
    },
    0.5
  );

  assert.equal(tick.heroDamage, 0);
  assert.deepEqual(tick.wallDamageEvents, [
    {
      wallId: wallSystem.activeWalls[0].id,
      amount: ENEMY_STATS[ENEMY_TYPES.ALIEN_HUNTER].wallDamage
    }
  ]);
});

test("Breaker Bot damages walls faster than Heavy Brute in the V1 hierarchy", () => {
  const wallSystem = placeWallToolAtSocket(
    createWallSystemState(),
    WALL_TOOL_TYPES.BLOCK,
    "player_mid_defense",
    { heroPosition: { x: 560, y: 610 }, enemies: [] }
  ).wallSystem;
  const breaker = createEnemy(ENEMY_TYPES.BREAKER_BOT, {
    id: "breaker_wall_test",
    position: { x: 560, y: 610 }
  });
  const brute = createEnemy(ENEMY_TYPES.HEAVY_BRUTE, {
    id: "brute_wall_test",
    position: { x: 560, y: 610 }
  });

  const breakerTick = tickEnemyBehavior(
    [breaker],
    {
      heroPosition: { x: 690, y: 610 },
      playerCorePosition: PLAYER_CORE_ATTACK_POSITION,
      walls: wallSystem.activeWalls
    },
    0.5
  );
  const bruteTick = tickEnemyBehavior(
    [brute],
    {
      heroPosition: { x: 690, y: 610 },
      playerCorePosition: PLAYER_CORE_ATTACK_POSITION,
      walls: wallSystem.activeWalls
    },
    0.5
  );

  assert.ok(breakerTick.wallDamageEvents[0].amount > bruteTick.wallDamageEvents[0].amount);
  assert.equal(bruteTick.wallDamageEvents[0].amount, ENEMY_STATS[ENEMY_TYPES.HEAVY_BRUTE].wallDamage);
});

test("Phase 6 runtime walk sprite sheets have eight directions and six transparent frames", () => {
  for (const spritePath of WALK_CHARACTER_SPRITES) {
    const image = PNG.sync.read(fs.readFileSync(spritePath));
    assert.equal(image.width, CHARACTER_SPRITE_CELL_SIZE * WALK_FRAME_COUNT, `${spritePath} width`);
    assert.equal(image.height, CHARACTER_SPRITE_CELL_SIZE * DIRECTION_COUNT, `${spritePath} height`);
    assert.equal(image.data[3], 0, `${spritePath} should have transparent corner`);
  }
});

test("Phase 6 runtime attack sprite sheets have eight directions and four transparent frames", () => {
  for (const spritePath of ATTACK_CHARACTER_SPRITES) {
    const image = PNG.sync.read(fs.readFileSync(spritePath));
    assert.equal(image.width, CHARACTER_SPRITE_CELL_SIZE * ATTACK_FRAME_COUNT, `${spritePath} width`);
    assert.equal(image.height, CHARACTER_SPRITE_CELL_SIZE * DIRECTION_COUNT, `${spritePath} height`);
    assert.equal(image.data[3], 0, `${spritePath} should have transparent corner`);
  }
});

test("character direction rows map movement vectors to the generated sheet order", () => {
  assert.equal(getDirectionIndexFromVector({ x: 0, y: 1 }), 0);
  assert.equal(getDirectionIndexFromVector({ x: 1, y: 1 }), 1);
  assert.equal(getDirectionIndexFromVector({ x: 1, y: 0 }), 2);
  assert.equal(getDirectionIndexFromVector({ x: 1, y: -1 }), 3);
  assert.equal(getDirectionIndexFromVector({ x: 0, y: -1 }), 4);
  assert.equal(getDirectionIndexFromVector({ x: -1, y: -1 }), 5);
  assert.equal(getDirectionIndexFromVector({ x: -1, y: 0 }), 6);
  assert.equal(getDirectionIndexFromVector({ x: -1, y: 1 }), 7);
});
