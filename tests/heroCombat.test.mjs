import assert from "node:assert/strict";
import test from "node:test";

import { CORE_IDS } from "../src/game/constants.js";
import {
  ENEMY_CORE_POSITION,
  HERO_COLLISION_RADIUS,
  HERO_DEATH_SCORE_PENALTY,
  HERO_MAX_HP,
  HERO_MOVE_SPEED,
  HERO_START_POSITION,
  HERO_RESPAWN_POSITION,
  HERO_RESPAWN_SECONDS,
  HERO_STATUS,
  RIFLE,
  WORLD_BOUNDS,
  createHeroCombatState,
  damageHero,
  normalizeVector,
  startReload,
  tickHeroCombat
} from "../src/game/heroCombat.js";
import { createMatchState, damageCore, startMatch } from "../src/game/matchState.js";
import { isWalkableBody } from "../src/game/mapLayout.js";
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

test("hero moves smoothly and stays inside walkable world bounds", () => {
  assert.equal(HERO_COLLISION_RADIUS, 8);
  assert.equal(HERO_MOVE_SPEED, 80);

  const hero = createHeroCombatState({
    position: { ...HERO_START_POSITION }
  });

  const tick = tickHeroCombat(hero, { moveX: 0, moveY: -1, isFiring: false }, 1);

  assert.equal(tick.hero.position.x, HERO_START_POSITION.x);
  assert.ok(tick.hero.position.y < HERO_START_POSITION.y);
  assert.ok(tick.hero.position.y >= HERO_START_POSITION.y - HERO_MOVE_SPEED);
  assert.equal(isWalkableBody(tick.hero.position), true);
});

test("hero cannot move outside the walkmask bounds", () => {
  const hero = createHeroCombatState({
    position: { x: WORLD_BOUNDS.width - 60, y: 310 }
  });

  const tick = tickHeroCombat(hero, { moveX: 1, moveY: 0, isFiring: false }, 1);

  assert.ok(tick.hero.position.x <= WORLD_BOUNDS.width - HERO_COLLISION_RADIUS);
  assert.ok(tick.hero.position.y >= HERO_COLLISION_RADIUS);
});

test("hero cannot move through blocked map terrain", () => {
  const hero = createHeroCombatState({
    position: { x: 250, y: 310 }
  });

  const tick = tickHeroCombat(hero, { moveX: 0, moveY: -1, isFiring: false }, 0.5);

  assert.equal(tick.hero.position.x, hero.position.x);
  assert.equal(tick.hero.position.y, hero.position.y);
});

test("hero cannot move through a placed Block Wall", () => {
  const wallSystem = placeWallToolAtSocket(
    createWallSystemState(),
    WALL_TOOL_TYPES.BLOCK,
    "player_mid_defense",
    { heroPosition: { x: 560, y: 610 }, enemies: [] }
  ).wallSystem;
  const hero = createHeroCombatState({
    position: { x: 560, y: 610 }
  });

  const tick = tickHeroCombat(
    hero,
    { moveX: 1, moveY: 0, isFiring: false },
    0.8,
    { walls: wallSystem.activeWalls }
  );

  assert.ok(tick.hero.position.x < wallSystem.activeWalls[0].position.x - HERO_COLLISION_RADIUS);
});

test("rifle fire consumes magazine ammo at the documented damage value", () => {
  assert.equal(RIFLE.magazineSize, 30);
  assert.equal(RIFLE.fireRatePerSecond, 11);
  assert.equal(RIFLE.reloadSeconds, 1.8);

  const hero = createHeroCombatState({
    position: { ...ENEMY_CORE_POSITION }
  });

  const tick = tickHeroCombat(hero, { moveX: 0, moveY: 0, aimX: 1, aimY: 0, isFiring: true }, 0.2);

  assert.equal(tick.shotsFired, 2);
  assert.equal(tick.hero.magazineAmmo, RIFLE.magazineSize - tick.shotsFired);
  assert.equal(tick.enemyCoreDamage, 0);
  assert.equal(tick.projectileSpawns.length, tick.shotsFired);
  assert.deepEqual(tick.projectileSpawns[0].direction, { x: 1, y: 0 });
  assert.equal(tick.projectileSpawns[0].damageToEnemy, RIFLE.damageToEnemy);
});

test("rifle projectiles can damage Enemy Core through match state", () => {
  let match = startMatch(createMatchState());
  const heroPosition = { x: 1216, y: 280 };
  const aim = normalizeVector({
    x: ENEMY_CORE_POSITION.x - heroPosition.x,
    y: ENEMY_CORE_POSITION.y - heroPosition.y
  });
  const hero = createHeroCombatState({
    position: heroPosition
  });
  const tick = tickHeroCombat(hero, {
    moveX: 0,
    moveY: 0,
    aimX: aim.x,
    aimY: aim.y,
    isFiring: true
  }, 0.2);
  const projectileState = addProjectileSpawns(createProjectileState(), tick.projectileSpawns);
  const projectileTick = tickProjectiles(projectileState, 0.2, { enemies: [] });

  match = damageCore(match, CORE_IDS.ENEMY, projectileTick.enemyCoreDamage);

  assert.equal(match.enemyCoreHp, 1000 - tick.shotsFired * RIFLE.damageToEnemyCore);
  assert.equal(match.playerCoreDamageDealt, tick.shotsFired * RIFLE.damageToEnemyCore);
});

test("manual reload refills the 30-round magazine after the configured reload time", () => {
  let hero = createHeroCombatState({
    magazineAmmo: 12
  });

  hero = startReload(hero);
  assert.equal(hero.isReloading, true);
  assert.equal(hero.reloadRemainingSeconds, RIFLE.reloadSeconds);

  const tick = tickHeroCombat(hero, { moveX: 0, moveY: 0, isFiring: false }, RIFLE.reloadSeconds);

  assert.equal(tick.hero.isReloading, false);
  assert.equal(tick.hero.magazineAmmo, RIFLE.magazineSize);
});

test("hero damage detects downed state without ending the match", () => {
  const hero = createHeroCombatState();
  const downed = damageHero(hero, 100);

  assert.equal(downed.hp, 0);
  assert.equal(downed.status, HERO_STATUS.DOWNED);
  assert.equal(downed.respawnRemainingSeconds, HERO_RESPAWN_SECONDS);
  assert.equal(downed.deaths, 1);
  assert.equal(downed.scorePenalty, HERO_DEATH_SCORE_PENALTY);
});

test("downed hero cannot move or fire while respawn timer is active", () => {
  const hero = damageHero(
    createHeroCombatState({
      position: { ...ENEMY_CORE_POSITION }
    }),
    100
  );

  const tick = tickHeroCombat(hero, { moveX: 1, moveY: 1, isFiring: true }, 1);

  assert.equal(tick.hero.status, HERO_STATUS.DOWNED);
  assert.equal(tick.hero.position.x, ENEMY_CORE_POSITION.x);
  assert.equal(tick.hero.position.y, ENEMY_CORE_POSITION.y);
  assert.equal(tick.enemyCoreDamage, 0);
  assert.equal(tick.shotsFired, 0);
  assert.equal(tick.projectileSpawns.length, 0);
  assert.equal(tick.hero.respawnRemainingSeconds, HERO_RESPAWN_SECONDS - 1);
});

test("hero respawns after 5 seconds near Player Core with HP restored", () => {
  const downed = damageHero(
    createHeroCombatState({
      hp: 10,
      position: { ...ENEMY_CORE_POSITION },
      magazineAmmo: 7
    }),
    10
  );

  const tick = tickHeroCombat(downed, { moveX: 0, moveY: 0, isFiring: false }, HERO_RESPAWN_SECONDS);

  assert.equal(tick.hero.status, HERO_STATUS.ALIVE);
  assert.equal(tick.hero.hp, HERO_MAX_HP);
  assert.deepEqual(tick.hero.position, HERO_RESPAWN_POSITION);
  assert.equal(tick.hero.magazineAmmo, 7);
  assert.equal(tick.hero.deaths, 1);
  assert.equal(tick.hero.scorePenalty, HERO_DEATH_SCORE_PENALTY);
});

test("hero death and respawn do not change match Core state", () => {
  const match = startMatch(createMatchState());
  const downed = damageHero(createHeroCombatState(), HERO_MAX_HP);
  const respawned = tickHeroCombat(downed, { moveX: 0, moveY: 0, isFiring: false }, HERO_RESPAWN_SECONDS);

  assert.equal(respawned.hero.status, HERO_STATUS.ALIVE);
  assert.equal(match.status, "running");
  assert.equal(match.playerCoreHp, 1000);
  assert.equal(match.enemyCoreHp, 1000);
  assert.equal(match.playerCoreDamageDealt, 0);
  assert.equal(match.enemyCoreDamageDealt, 0);
});
