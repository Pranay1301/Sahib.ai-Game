import {
  ENEMY_CORE_POSITION,
  WORLD_BOUNDS,
  isWalkablePoint
} from "./mapLayout.js";
import { distanceBetween } from "./heroCombat.js";
import { getEnemyStats } from "./enemyBehavior.js";
import { getWallHitAtPoint } from "./wallSystem.js";
import { ENEMY_DEATH_VISUAL_SECONDS } from "./characterAnimation.js";

export const PROJECTILE_COLLISION_STEP = 8;
export const ENEMY_CORE_PROJECTILE_RADIUS = 58;
export const PROJECTILE_LIFETIME_SECONDS = 0.75;
export const PROJECTILE_IMPACT_TRAIL_SECONDS = 0.12;

export function createProjectileState() {
  return {
    active: [],
    trails: [],
    nextProjectileId: 1
  };
}

export function addProjectileSpawns(state, spawns) {
  if (!Array.isArray(spawns) || spawns.length === 0) {
    return state;
  }

  let nextProjectileId = state.nextProjectileId;
  const active = [...state.active];

  for (const spawn of spawns) {
    active.push({
      id: `rifle_projectile_${nextProjectileId}`,
      position: { ...spawn.origin },
      previousPosition: { ...spawn.origin },
      direction: { ...spawn.direction },
      remainingRange: spawn.range,
      speed: spawn.speed,
      radius: spawn.radius,
      damageToEnemy: spawn.damageToEnemy,
      damageToEnemyCore: spawn.damageToEnemyCore,
      weaponId: spawn.weaponId ?? null,
      ageSeconds: 0
    });
    nextProjectileId += 1;
  }

  return {
    active,
    nextProjectileId
  };
}

export function tickProjectiles(state, deltaSeconds, context = {}) {
  const safeDelta = Math.max(0, Number(deltaSeconds) || 0);
  if (safeDelta === 0 || state.active.length === 0) {
    return {
      projectileState:
        safeDelta === 0
          ? state
          : {
              ...state,
              trails: decayProjectileTrails(state.trails ?? [], safeDelta)
            },
      enemies: context.enemies ?? [],
      enemyCoreDamage: 0,
      enemyKills: 0,
      wallDamageEvents: []
    };
  }

  let enemies = Array.isArray(context.enemies)
    ? context.enemies.map((enemy) => ({ ...enemy }))
    : [];
  const enemyCorePosition = context.enemyCorePosition ?? ENEMY_CORE_POSITION;
  const walls = context.walls ?? [];
  let enemyCoreDamage = 0;
  let enemyKills = 0;
  const wallDamageEvents = [];
  const active = [];
  const trails = decayProjectileTrails(state.trails ?? [], safeDelta);

  for (const projectile of state.active) {
    const travelDistance = Math.min(
      projectile.speed * safeDelta,
      projectile.remainingRange
    );
    const targetPosition = {
      x: projectile.position.x + projectile.direction.x * travelDistance,
      y: projectile.position.y + projectile.direction.y * travelDistance
    };
    const resolved = resolveProjectileSegment(projectile, targetPosition, {
      enemies,
      enemyCorePosition,
      walls
    });

    enemies = resolved.enemies;
    enemyCoreDamage += resolved.enemyCoreDamage;
    enemyKills += resolved.enemyKills;
    wallDamageEvents.push(...resolved.wallDamageEvents);
    if (resolved.expired) {
      trails.push(createProjectileTrail(projectile, resolved.position));
    }

    const ageSeconds = projectile.ageSeconds + safeDelta;
    const remainingRange = Math.max(
      0,
      projectile.remainingRange - distanceBetween(projectile.position, resolved.position)
    );

    if (!resolved.expired && remainingRange > 0 && ageSeconds < PROJECTILE_LIFETIME_SECONDS) {
      active.push({
        ...projectile,
        previousPosition: projectile.position,
        position: resolved.position,
        remainingRange,
        ageSeconds
      });
    }
  }

  return {
    projectileState: {
      ...state,
      active,
      trails
    },
    enemies: enemies.filter(
      (enemy) => enemy.hp > 0 || (enemy.deathAnimationRemainingSeconds ?? 0) > 0
    ),
    enemyCoreDamage,
    enemyKills,
    wallDamageEvents
  };
}

function resolveProjectileSegment(projectile, targetPosition, context) {
  const distance = distanceBetween(projectile.position, targetPosition);
  const steps = Math.max(1, Math.ceil(distance / PROJECTILE_COLLISION_STEP));
  let enemies = context.enemies;

  for (let step = 1; step <= steps; step += 1) {
    const point = {
      x: projectile.position.x + ((targetPosition.x - projectile.position.x) * step) / steps,
      y: projectile.position.y + ((targetPosition.y - projectile.position.y) * step) / steps
    };

    const wallHit = getWallHitAtPoint(point, context.walls, projectile.radius);
    if (wallHit) {
      return {
        position: point,
        expired: true,
        enemies,
        enemyCoreDamage: 0,
        enemyKills: 0,
        wallDamageEvents: [
          {
            wallId: wallHit.wallId,
            amount: projectile.damageToEnemy
          }
        ]
      };
    }

    const enemyHitIndex = getProjectileEnemyHitIndex(enemies, point, projectile.radius);
    if (enemyHitIndex !== -1) {
      const damaged = damageEnemyAtIndex(enemies, enemyHitIndex, projectile.damageToEnemy);
      enemies = damaged.enemies;
      return {
        position: point,
        expired: true,
        enemies,
        enemyCoreDamage: 0,
        enemyKills: damaged.enemyKilled ? 1 : 0,
        wallDamageEvents: []
      };
    }

    if (
      distanceBetween(point, context.enemyCorePosition) <=
      ENEMY_CORE_PROJECTILE_RADIUS + projectile.radius
    ) {
      return {
        position: point,
        expired: true,
        enemies,
        enemyCoreDamage: projectile.damageToEnemyCore,
        enemyKills: 0,
        wallDamageEvents: []
      };
    }

    if (!isPointInsideWorld(point) || !isWalkablePoint(point)) {
      return {
        position: point,
        expired: true,
        enemies,
        enemyCoreDamage: 0,
        enemyKills: 0,
        wallDamageEvents: []
      };
    }
  }

  return {
    position: targetPosition,
    expired: false,
    enemies,
    enemyCoreDamage: 0,
    enemyKills: 0,
    wallDamageEvents: []
  };
}

function getProjectileEnemyHitIndex(enemies, point, projectileRadius) {
  let bestIndex = -1;
  let bestDistance = Infinity;

  for (let index = 0; index < enemies.length; index += 1) {
    const enemy = enemies[index];
    if (enemy.hp <= 0) {
      continue;
    }

    const stats = getEnemyStats(enemy.type);
    const hitDistance = stats.collisionRadius + projectileRadius;
    const distance = distanceBetween(point, enemy.position);
    if (distance <= hitDistance && distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
  }

  return bestIndex;
}

function damageEnemyAtIndex(enemies, index, damage) {
  const beforeHp = enemies[index]?.hp ?? 0;
  const nextEnemies = enemies.map((enemy, enemyIndex) =>
    enemyIndex === index
      ? {
          ...enemy,
          hp: Math.max(0, enemy.hp - damage),
          deathAnimationRemainingSeconds:
            enemy.hp - damage <= 0 && enemy.hp > 0
              ? ENEMY_DEATH_VISUAL_SECONDS
              : enemy.deathAnimationRemainingSeconds ?? 0
        }
      : enemy
  );

  return {
    enemies: nextEnemies,
    enemyKilled: beforeHp > 0 && (nextEnemies[index]?.hp ?? 0) <= 0
  };
}

function createProjectileTrail(projectile, impactPosition) {
  return {
    id: `${projectile.id}_trail_${Math.round((projectile.ageSeconds ?? 0) * 1000)}`,
    previousPosition: projectile.position,
    position: impactPosition,
    ageSeconds: 0,
    lifetimeSeconds: PROJECTILE_IMPACT_TRAIL_SECONDS,
    weaponId: projectile.weaponId ?? null
  };
}

function decayProjectileTrails(trails, deltaSeconds) {
  if (!Array.isArray(trails) || trails.length === 0) {
    return [];
  }

  const nextTrails = [];
  for (const trail of trails) {
    const ageSeconds = (trail.ageSeconds ?? 0) + deltaSeconds;
    if (ageSeconds < (trail.lifetimeSeconds ?? PROJECTILE_IMPACT_TRAIL_SECONDS)) {
      nextTrails.push({
        ...trail,
        ageSeconds
      });
    }
  }

  return nextTrails;
}

function isPointInsideWorld(point) {
  return (
    point.x >= 0 &&
    point.y >= 0 &&
    point.x <= WORLD_BOUNDS.width &&
    point.y <= WORLD_BOUNDS.height
  );
}
