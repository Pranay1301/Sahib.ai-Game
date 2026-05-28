import {
  HERO_COLLISION_RADIUS,
  PLAYER_CORE_ATTACK_POSITION,
  PLAYER_CORE_POSITION,
  WORLD_BOUNDS,
  isWalkableBody
} from "./mapLayout.js";
import {
  ENEMY_ATTACK_ANIMATION_SECONDS,
  ENEMY_DEATH_VISUAL_SECONDS
} from "./characterAnimation.js";
import { distanceBetween, normalizeVector } from "./heroCombat.js";
import {
  doesSegmentHitWall,
  isPointBlockedByWalls
} from "./wallSystem.js";

export const ENEMY_TYPES = Object.freeze({
  ALIEN_HUNTER: "alien_hunter",
  HUNTER_EXOSUIT: "hunter_exosuit",
  HEAVY_BRUTE: "heavy_brute",
  BREAKER_BOT: "breaker_bot"
});

export const ENEMY_TARGETS = Object.freeze({
  HERO: "hero",
  PLAYER_CORE: "player_core",
  WALL: "wall"
});

export const ENEMIES_PER_DOOR = 2;
export const DEFAULT_ENEMIES_PER_DOOR = ENEMIES_PER_DOOR;

const ROUTE_WAYPOINT_TARGET = "route_waypoint";
const DYNAMIC_ROUTE_TARGET = "dynamic_route";
const ROUTE_WAYPOINT_REACHED_RADIUS = 18;
const DYNAMIC_ROUTE_REACHED_RADIUS = 18;
const ENEMY_PATH_GRID_SIZE = 16;
const ENEMY_PATH_REPLAN_SECONDS = 0.75;
const ENEMY_PATH_INITIAL_STAGGER_SECONDS = 0.08;
const ENEMY_PATH_INITIAL_STAGGER_BUCKETS = 6;
const ENEMY_PATH_TARGET_REPLAN_DISTANCE = 72;
const ENEMY_PATH_LINE_SAMPLE_STEP = 14;
const ENEMY_PATH_MAX_WAYPOINTS = 18;
const CHARACTER_SEPARATION_PADDING = 4;
const CHARACTER_SEPARATION_ITERATIONS = 2;

const enemyPathGridCache = new Map();

export const ENEMY_STATS = Object.freeze({
  [ENEMY_TYPES.ALIEN_HUNTER]: Object.freeze({
    id: ENEMY_TYPES.ALIEN_HUNTER,
    label: "Alien Hunter",
    maxHp: 30,
    damage: 4,
    wallDamage: 7,
    speed: 42,
    attackRange: 112,
    attackCooldownSeconds: 0.75,
    target: ENEMY_TARGETS.HERO,
    collisionRadius: 7,
    renderSize: 36
  }),
  [ENEMY_TYPES.HUNTER_EXOSUIT]: Object.freeze({
    id: ENEMY_TYPES.HUNTER_EXOSUIT,
    label: "Hunter Exosuit Trooper",
    maxHp: 100,
    damage: 5,
    wallDamage: 12,
    speed: 31,
    attackRange: 62,
    attackCooldownSeconds: 1.15,
    target: ENEMY_TARGETS.PLAYER_CORE,
    collisionRadius: 8,
    renderSize: 40
  }),
  [ENEMY_TYPES.HEAVY_BRUTE]: Object.freeze({
    id: ENEMY_TYPES.HEAVY_BRUTE,
    label: "Heavy Alien Brute",
    maxHp: 220,
    damage: 12,
    wallDamage: 24,
    speed: 23,
    attackRange: 116,
    attackCooldownSeconds: 1.45,
    target: ENEMY_TARGETS.HERO,
    collisionRadius: 9,
    renderSize: 48
  }),
  [ENEMY_TYPES.BREAKER_BOT]: Object.freeze({
    id: ENEMY_TYPES.BREAKER_BOT,
    label: "Breaker Bot",
    maxHp: 160,
    damage: 8,
    wallDamage: 28,
    speed: 28,
    attackRange: 120,
    attackCooldownSeconds: 1.05,
    target: ENEMY_TARGETS.HERO,
    collisionRadius: 8,
    renderSize: 42
  })
});

export function createEnemy(type, options = {}) {
  const stats = getEnemyStats(type);
  const id = options.id ?? `${type}_${Date.now()}`;

  return {
    id,
    type,
    zoneId: options.zoneId ?? null,
    doorId: options.doorId ?? null,
    hp: stats.maxHp,
    maxHp: stats.maxHp,
    position: {
      x: options.position?.x ?? PLAYER_CORE_POSITION.x,
      y: options.position?.y ?? PLAYER_CORE_POSITION.y
    },
    attackCooldownRemainingSeconds: 0,
    attackAnimationRemainingSeconds: 0,
    deathAnimationRemainingSeconds: 0,
    animationTimeSeconds: 0,
    lastTarget: stats.target,
    facingVector: options.facingVector ?? { x: 1, y: 0 },
    routePoints: normalizeRoutePoints(options.routePoints),
    routePointIndex: 0,
    dynamicRoutePoints: [],
    dynamicRoutePointIndex: 0,
    pathReplanRemainingSeconds:
      options.pathReplanRemainingSeconds ?? getInitialPathReplanDelay(id),
    pathTargetSnapshot: null
  };
}

export function createDoorEnemySpawns(zone, door, firstSpawnId, options = {}) {
  const direction = normalizeVector({
    x: zone.center.x - door.center.x,
    y: zone.center.y - door.center.y
  });
  const perpendicular = {
    x: -direction.y,
    y: direction.x
  };
  const types = getDoorEnemyTypes(zone, door);
  const enemyCount = Math.max(0, Math.floor(options.count ?? DEFAULT_ENEMIES_PER_DOOR));
  const enemies = [];
  let nextSpawnId = firstSpawnId;

  for (let index = 0; index < enemyCount; index += 1) {
    const spread = getDoorSpawnSpread(index, enemyCount);
    const rawPosition = {
      x: door.center.x + direction.x * 34 + perpendicular.x * spread,
      y: door.center.y + direction.y * 34 + perpendicular.y * spread
    };
    enemies.push(
      createEnemy(types[index % types.length], {
        id: `door_spawn_${nextSpawnId}`,
        zoneId: zone.id,
        doorId: door.id,
        position: findNearestWalkableSpawn(rawPosition, direction, perpendicular),
        facingVector: direction
      })
    );
    nextSpawnId += 1;
  }

  return {
    enemies,
    nextSpawnId
  };
}

export function getDoorEnemyTypes(zone, door) {
  if (zone.id === "intersection_4" && door.role === "front") {
    return [ENEMY_TYPES.HUNTER_EXOSUIT, ENEMY_TYPES.ALIEN_HUNTER];
  }

  if (door.role === "side" || door.role === "east") {
    return [ENEMY_TYPES.BREAKER_BOT, ENEMY_TYPES.ALIEN_HUNTER];
  }

  if (door.role === "rear_diagonal" || door.role === "south") {
    return [ENEMY_TYPES.HEAVY_BRUTE, ENEMY_TYPES.ALIEN_HUNTER];
  }

  return [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.BREAKER_BOT];
}

export function tickEnemyBehavior(enemies, context, deltaSeconds) {
  const safeDelta = Math.max(0, deltaSeconds);
  if (safeDelta === 0 || enemies.length === 0) {
    return {
      enemies,
      heroDamage: 0,
      playerCoreDamage: 0,
      wallDamageEvents: []
    };
  }

  let changed = false;
  let heroDamage = 0;
  let playerCoreDamage = 0;
  const wallDamageEvents = [];
  const nextEnemies = [];

  for (const enemy of enemies) {
    if (enemy.hp <= 0) {
      const deathAnimationRemainingSeconds = Math.max(
        0,
        (enemy.deathAnimationRemainingSeconds ?? 0) - safeDelta
      );
      if (deathAnimationRemainingSeconds > 0) {
        nextEnemies.push({
          ...enemy,
          deathAnimationRemainingSeconds
        });
      }
      changed = true;
      continue;
    }

    const stats = getEnemyStats(enemy.type);
    const routedEnemy = advanceEnemyRoute(enemy);
    const target = getEnemyTarget(routedEnemy, context);
    const ticked = tickSingleEnemy(routedEnemy, stats, target, safeDelta, context);
    heroDamage += ticked.heroDamage;
    playerCoreDamage += ticked.playerCoreDamage;
    wallDamageEvents.push(...ticked.wallDamageEvents);
    nextEnemies.push(ticked.enemy);
    changed =
      changed ||
      routedEnemy !== enemy ||
      ticked.enemy !== routedEnemy ||
      ticked.heroDamage > 0 ||
      ticked.playerCoreDamage > 0 ||
      ticked.wallDamageEvents.length > 0;
  }

  const separatedEnemies = resolveCharacterSeparation(nextEnemies, context);

  return {
    enemies: changed || separatedEnemies !== nextEnemies ? separatedEnemies : enemies,
    heroDamage,
    playerCoreDamage,
    wallDamageEvents
  };
}

export function getEnemyStats(type) {
  const stats = ENEMY_STATS[type];
  if (!stats) {
    throw new Error(`Unknown enemy type: ${type}`);
  }
  return stats;
}

function tickSingleEnemy(enemy, stats, target, deltaSeconds, context = {}) {
  const cooldown = Math.max(0, enemy.attackCooldownRemainingSeconds - deltaSeconds);
  const attackAnimationRemainingSeconds = Math.max(
    0,
    (enemy.attackAnimationRemainingSeconds ?? 0) - deltaSeconds
  );
  const navigation = prepareEnemyNavigation(enemy, target, stats, deltaSeconds, context);
  const navigatedEnemy = navigation.enemy;
  const distance = distanceBetween(navigatedEnemy.position, target.position);
  const canAttack =
    target.type !== ROUTE_WAYPOINT_TARGET &&
    target.type !== DYNAMIC_ROUTE_TARGET &&
    (target.type === ENEMY_TARGETS.WALL || navigation.hasLineToFinalTarget) &&
    distance <= stats.attackRange &&
    cooldown <= 0;
  const facingVector = getFacingVector(
    navigatedEnemy.position,
    navigation.moveTarget.position,
    navigatedEnemy.facingVector
  );

  if (canAttack) {
    const nextEnemy = {
      ...navigatedEnemy,
      attackCooldownRemainingSeconds: stats.attackCooldownSeconds,
      attackAnimationRemainingSeconds: ENEMY_ATTACK_ANIMATION_SECONDS,
      animationTimeSeconds: navigatedEnemy.animationTimeSeconds + deltaSeconds,
      lastTarget: target.type,
      facingVector
    };
    const wallDamageEvents =
      target.type === ENEMY_TARGETS.WALL
        ? [
            {
              wallId: target.wallId,
              amount: stats.wallDamage
            }
          ]
        : [];
    return {
      enemy: nextEnemy,
      heroDamage: target.type === ENEMY_TARGETS.HERO ? stats.damage : 0,
      playerCoreDamage: target.type === ENEMY_TARGETS.PLAYER_CORE ? stats.damage : 0,
      wallDamageEvents
    };
  }

  const nextPosition = moveEnemyToward(
    navigatedEnemy.position,
    navigation.moveTarget.position,
    stats.speed * deltaSeconds,
    stats.collisionRadius,
    context
  );
  return {
    enemy: {
      ...navigatedEnemy,
      position: nextPosition,
      attackCooldownRemainingSeconds: cooldown,
      attackAnimationRemainingSeconds,
      animationTimeSeconds: navigatedEnemy.animationTimeSeconds + deltaSeconds,
      lastTarget: target.type,
      facingVector
    },
    heroDamage: 0,
    playerCoreDamage: 0,
    wallDamageEvents: []
  };
}

function getFacingVector(currentPosition, targetPosition, fallback) {
  const vector = normalizeVector({
    x: targetPosition.x - currentPosition.x,
    y: targetPosition.y - currentPosition.y
  });

  if (vector.x === 0 && vector.y === 0) {
    return fallback ?? { x: 1, y: 0 };
  }

  return vector;
}

function getEnemyTarget(enemy, context) {
  const routeTarget = getActiveRouteTarget(enemy);
  if (routeTarget) {
    return {
      type: ROUTE_WAYPOINT_TARGET,
      position: routeTarget
    };
  }

  const stats = getEnemyStats(enemy.type);
  const defaultTarget =
    stats.target === ENEMY_TARGETS.PLAYER_CORE
      ? {
          type: ENEMY_TARGETS.PLAYER_CORE,
          position: context.playerCorePosition ?? PLAYER_CORE_ATTACK_POSITION
        }
      : {
          type: ENEMY_TARGETS.HERO,
          position: context.heroPosition
        };
  const wallTarget = getWallTargetForEnemy(enemy, defaultTarget, stats, context);
  if (wallTarget) {
    return wallTarget;
  }

  return defaultTarget;
}

function getWallTargetForEnemy(enemy, defaultTarget, stats, context) {
  const walls = context.walls ?? [];
  if (walls.length === 0) {
    return null;
  }

  const blockingHit = doesSegmentHitWall(
    enemy.position,
    defaultTarget.position,
    walls,
    stats.collisionRadius
  );
  if (blockingHit) {
    return {
      type: ENEMY_TARGETS.WALL,
      wallId: blockingHit.wallId,
      position: blockingHit.point
    };
  }

  if (enemy.type !== ENEMY_TYPES.BREAKER_BOT) {
    return null;
  }

  const nearestWall = getNearestWall(enemy.position, walls, stats.attackRange + 90);
  if (!nearestWall) {
    return null;
  }

  return {
    type: ENEMY_TARGETS.WALL,
    wallId: nearestWall.id,
    position: nearestWall.position
  };
}

function getNearestWall(position, walls, maxDistance) {
  let nearest = null;
  let nearestDistance = Infinity;

  for (const wall of walls) {
    if (wall.hp <= 0) {
      continue;
    }

    const distance = distanceBetween(position, wall.position);
    if (distance <= maxDistance && distance < nearestDistance) {
      nearest = wall;
      nearestDistance = distance;
    }
  }

  return nearest;
}

function advanceEnemyRoute(enemy) {
  if (!Array.isArray(enemy.routePoints) || enemy.routePoints.length === 0) {
    return enemy;
  }

  let routePointIndex = Math.max(0, Math.floor(enemy.routePointIndex ?? 0));
  while (
    routePointIndex < enemy.routePoints.length &&
    distanceBetween(enemy.position, enemy.routePoints[routePointIndex]) <= ROUTE_WAYPOINT_REACHED_RADIUS
  ) {
    routePointIndex += 1;
  }

  return routePointIndex === (enemy.routePointIndex ?? 0)
    ? enemy
    : {
        ...enemy,
        routePointIndex
      };
}

function getActiveRouteTarget(enemy) {
  if (!Array.isArray(enemy.routePoints) || enemy.routePoints.length === 0) {
    return null;
  }

  const routePointIndex = Math.max(0, Math.floor(enemy.routePointIndex ?? 0));
  return enemy.routePoints[routePointIndex] ?? null;
}

function prepareEnemyNavigation(enemy, target, stats, deltaSeconds, context = {}) {
  if (target.type === ROUTE_WAYPOINT_TARGET) {
    return {
      enemy,
      moveTarget: target,
      hasLineToFinalTarget: false
    };
  }

  let nextEnemy = decayDynamicPath(enemy, deltaSeconds);
  const hasLineToFinalTarget = hasWalkableLineBetween(
    nextEnemy.position,
    target.position,
    stats.collisionRadius,
    target.type === ENEMY_TARGETS.WALL ? [] : context.walls
  );

  if (hasLineToFinalTarget) {
    nextEnemy = clearDynamicRoute(nextEnemy);
    return {
      enemy: nextEnemy,
      moveTarget: target,
      hasLineToFinalTarget: true
    };
  }

  nextEnemy = advanceDynamicRoute(nextEnemy);
  const activeDynamicRouteTarget = getActiveDynamicRouteTarget(nextEnemy);
  const needsReplan =
    nextEnemy.pathReplanRemainingSeconds <= 0 &&
    (!activeDynamicRouteTarget || hasPathTargetMoved(nextEnemy.pathTargetSnapshot, target.position));

  if (needsReplan) {
    const routePoints = findEnemyPath(
      nextEnemy.position,
      target.position,
      stats.collisionRadius
    );
    nextEnemy = {
      ...nextEnemy,
      dynamicRoutePoints: routePoints,
      dynamicRoutePointIndex: 0,
      pathReplanRemainingSeconds: ENEMY_PATH_REPLAN_SECONDS,
      pathTargetSnapshot: { ...target.position }
    };
  }

  const routeTarget = getActiveDynamicRouteTarget(nextEnemy);
  return {
    enemy: nextEnemy,
    moveTarget: routeTarget
      ? {
          type: DYNAMIC_ROUTE_TARGET,
          position: routeTarget
        }
      : target,
    hasLineToFinalTarget: false
  };
}

function decayDynamicPath(enemy, deltaSeconds) {
  const pathReplanRemainingSeconds = Math.max(
    0,
    (enemy.pathReplanRemainingSeconds ?? 0) - Math.max(0, deltaSeconds)
  );

  return pathReplanRemainingSeconds === (enemy.pathReplanRemainingSeconds ?? 0)
    ? enemy
    : {
        ...enemy,
        pathReplanRemainingSeconds
      };
}

function advanceDynamicRoute(enemy) {
  if (!Array.isArray(enemy.dynamicRoutePoints) || enemy.dynamicRoutePoints.length === 0) {
    return enemy;
  }

  let dynamicRoutePointIndex = Math.max(0, Math.floor(enemy.dynamicRoutePointIndex ?? 0));
  while (
    dynamicRoutePointIndex < enemy.dynamicRoutePoints.length &&
    distanceBetween(enemy.position, enemy.dynamicRoutePoints[dynamicRoutePointIndex]) <=
      DYNAMIC_ROUTE_REACHED_RADIUS
  ) {
    dynamicRoutePointIndex += 1;
  }

  return dynamicRoutePointIndex === (enemy.dynamicRoutePointIndex ?? 0)
    ? enemy
    : {
        ...enemy,
        dynamicRoutePointIndex
      };
}

function getActiveDynamicRouteTarget(enemy) {
  if (!Array.isArray(enemy.dynamicRoutePoints) || enemy.dynamicRoutePoints.length === 0) {
    return null;
  }

  const dynamicRoutePointIndex = Math.max(0, Math.floor(enemy.dynamicRoutePointIndex ?? 0));
  return enemy.dynamicRoutePoints[dynamicRoutePointIndex] ?? null;
}

function clearDynamicRoute(enemy) {
  if (
    (!Array.isArray(enemy.dynamicRoutePoints) || enemy.dynamicRoutePoints.length === 0) &&
    (enemy.dynamicRoutePointIndex ?? 0) === 0 &&
    !enemy.pathTargetSnapshot
  ) {
    return enemy;
  }

  return {
    ...enemy,
    dynamicRoutePoints: [],
    dynamicRoutePointIndex: 0,
    pathTargetSnapshot: null
  };
}

function hasPathTargetMoved(snapshot, targetPosition) {
  if (!snapshot) {
    return true;
  }

  return distanceBetween(snapshot, targetPosition) > ENEMY_PATH_TARGET_REPLAN_DISTANCE;
}

function moveEnemyToward(currentPosition, targetPosition, distance, radius, context = {}) {
  if (distance <= 0) {
    return currentPosition;
  }

  const vector = normalizeVector({
    x: targetPosition.x - currentPosition.x,
    y: targetPosition.y - currentPosition.y
  });
  if (vector.x === 0 && vector.y === 0) {
    return currentPosition;
  }

  const target = {
    x: clamp(currentPosition.x + vector.x * distance, radius, WORLD_BOUNDS.width - radius),
    y: clamp(currentPosition.y + vector.y * distance, radius, WORLD_BOUNDS.height - radius)
  };

  return resolveWalkableMove(currentPosition, target, radius, context);
}

function resolveWalkableMove(currentPosition, targetPosition, radius, context = {}) {
  if (isWalkableBody(targetPosition, radius) && !isPointBlockedByWalls(targetPosition, context.walls, radius)) {
    return targetPosition;
  }

  const xOnlyPosition = {
    x: targetPosition.x,
    y: currentPosition.y
  };
  if (isWalkableBody(xOnlyPosition, radius) && !isPointBlockedByWalls(xOnlyPosition, context.walls, radius)) {
    return xOnlyPosition;
  }

  const yOnlyPosition = {
    x: currentPosition.x,
    y: targetPosition.y
  };
  if (isWalkableBody(yOnlyPosition, radius) && !isPointBlockedByWalls(yOnlyPosition, context.walls, radius)) {
    return yOnlyPosition;
  }

  return currentPosition;
}

function resolveCharacterSeparation(enemies, context = {}) {
  if (enemies.length === 0) {
    return enemies;
  }

  let changed = false;
  let nextEnemies = enemies.map((enemy) => ({
    enemy,
    position: enemy.position
  }));

  for (let iteration = 0; iteration < CHARACTER_SEPARATION_ITERATIONS; iteration += 1) {
    for (let index = 0; index < nextEnemies.length; index += 1) {
      const entry = nextEnemies[index];
      if (entry.enemy.hp <= 0) {
        continue;
      }
      const stats = getEnemyStats(entry.enemy.type);
      if (context.heroPosition) {
        const separated = separatePointFromPoint(
          entry.position,
          context.heroPosition,
          stats.collisionRadius,
          HERO_COLLISION_RADIUS,
          index,
          context
        );
        if (separated !== entry.position) {
          entry.position = separated;
          changed = true;
        }
      }
    }

    for (let a = 0; a < nextEnemies.length; a += 1) {
      for (let b = a + 1; b < nextEnemies.length; b += 1) {
        const first = nextEnemies[a];
        const second = nextEnemies[b];
        if (first.enemy.hp <= 0 || second.enemy.hp <= 0) {
          continue;
        }
        const firstStats = getEnemyStats(first.enemy.type);
        const secondStats = getEnemyStats(second.enemy.type);
        const separated = separatePair(
          first.position,
          second.position,
          firstStats.collisionRadius,
          secondStats.collisionRadius,
          a,
          b,
          context
        );

        if (separated.first !== first.position) {
          first.position = separated.first;
          changed = true;
        }
        if (separated.second !== second.position) {
          second.position = separated.second;
          changed = true;
        }
      }
    }
  }

  if (!changed) {
    return enemies;
  }

  return nextEnemies.map(({ enemy, position }) =>
    position === enemy.position
      ? enemy
      : {
          ...enemy,
          position
        }
  );
}

function separatePointFromPoint(position, blockerPosition, radius, blockerRadius, index, context) {
  const minimumDistance = radius + blockerRadius + CHARACTER_SEPARATION_PADDING;
  const offset = getSeparationOffset(position, blockerPosition, minimumDistance, index);
  if (!offset) {
    return position;
  }

  return resolveSeparatedPosition(
    position,
    {
      x: position.x + offset.x,
      y: position.y + offset.y
    },
    radius,
    context
  );
}

function separatePair(firstPosition, secondPosition, firstRadius, secondRadius, firstIndex, secondIndex, context) {
  const minimumDistance = firstRadius + secondRadius + CHARACTER_SEPARATION_PADDING;
  const offset = getSeparationOffset(firstPosition, secondPosition, minimumDistance, firstIndex + secondIndex);
  if (!offset) {
    return {
      first: firstPosition,
      second: secondPosition
    };
  }

  const first = resolveSeparatedPosition(
    firstPosition,
    {
      x: firstPosition.x + offset.x * 0.5,
      y: firstPosition.y + offset.y * 0.5
    },
    firstRadius,
    context
  );
  const second = resolveSeparatedPosition(
    secondPosition,
    {
      x: secondPosition.x - offset.x * 0.5,
      y: secondPosition.y - offset.y * 0.5
    },
    secondRadius,
    context
  );

  return {
    first,
    second
  };
}

function getSeparationOffset(position, blockerPosition, minimumDistance, fallbackIndex) {
  const dx = position.x - blockerPosition.x;
  const dy = position.y - blockerPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const overlap = minimumDistance - distance;
  if (overlap <= 0) {
    return null;
  }

  if (distance > 0.001) {
    return {
      x: (dx / distance) * overlap,
      y: (dy / distance) * overlap
    };
  }

  const angle = (fallbackIndex + 1) * 2.399963;
  return {
    x: Math.cos(angle) * minimumDistance,
    y: Math.sin(angle) * minimumDistance
  };
}

function resolveSeparatedPosition(currentPosition, desiredPosition, radius, context) {
  const clamped = {
    x: clamp(desiredPosition.x, radius, WORLD_BOUNDS.width - radius),
    y: clamp(desiredPosition.y, radius, WORLD_BOUNDS.height - radius)
  };

  return isWalkableBody(clamped, radius) && !isPointBlockedByWalls(clamped, context.walls, radius)
    ? clamped
    : currentPosition;
}

function hasWalkableLineBetween(start, end, radius, walls = []) {
  const distance = distanceBetween(start, end);
  const steps = Math.max(1, Math.ceil(distance / ENEMY_PATH_LINE_SAMPLE_STEP));

  for (let step = 1; step <= steps; step += 1) {
    const point = {
      x: start.x + ((end.x - start.x) * step) / steps,
      y: start.y + ((end.y - start.y) * step) / steps
    };

    if (!isWalkableBody(point, radius) || isPointBlockedByWalls(point, walls, radius)) {
      return false;
    }
  }

  return true;
}

function findEnemyPath(start, end, radius) {
  const grid = getEnemyPathGrid(radius);
  const startCell = findNearestPathCell(grid, start);
  const endCell = findNearestPathCell(grid, end);

  if (!startCell || !endCell) {
    return [];
  }

  const startKey = getPathCellKey(startCell);
  const endKey = getPathCellKey(endCell);
  const queue = [startCell];
  let queueIndex = 0;
  const visited = new Set([startKey]);
  const previous = new Map();

  while (queueIndex < queue.length) {
    const cell = queue[queueIndex];
    queueIndex += 1;
    const cellKey = getPathCellKey(cell);

    if (cellKey === endKey) {
      return compressPathCells(reconstructPathCells(cell, previous), grid, end);
    }

    for (const neighbor of getPathNeighbors(cell, grid)) {
      const neighborKey = getPathCellKey(neighbor);
      if (visited.has(neighborKey)) {
        continue;
      }

      visited.add(neighborKey);
      previous.set(neighborKey, cell);
      queue.push(neighbor);
    }
  }

  return [];
}

function getEnemyPathGrid(radius) {
  const cacheKey = Math.ceil(radius);
  const cached = enemyPathGridCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const columns = Math.floor(WORLD_BOUNDS.width / ENEMY_PATH_GRID_SIZE) + 1;
  const rows = Math.floor(WORLD_BOUNDS.height / ENEMY_PATH_GRID_SIZE) + 1;
  const walkable = new Set();

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const point = getPathCellPoint({ x, y });
      if (isWalkableBody(point, radius)) {
        walkable.add(`${x},${y}`);
      }
    }
  }

  const grid = {
    columns,
    rows,
    walkable
  };
  enemyPathGridCache.set(cacheKey, grid);
  return grid;
}

function findNearestPathCell(grid, point) {
  const origin = {
    x: Math.round(point.x / ENEMY_PATH_GRID_SIZE),
    y: Math.round(point.y / ENEMY_PATH_GRID_SIZE)
  };

  for (let radius = 0; radius <= 10; radius += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        const cell = {
          x: origin.x + dx,
          y: origin.y + dy
        };
        if (isPathCellWalkable(grid, cell)) {
          return cell;
        }
      }
    }
  }

  return null;
}

function getPathNeighbors(cell, grid) {
  const neighbors = [];
  for (let dx = -1; dx <= 1; dx += 1) {
    for (let dy = -1; dy <= 1; dy += 1) {
      if (dx === 0 && dy === 0) {
        continue;
      }

      const neighbor = {
        x: cell.x + dx,
        y: cell.y + dy
      };
      if (isPathCellWalkable(grid, neighbor)) {
        neighbors.push(neighbor);
      }
    }
  }

  return neighbors;
}

function isPathCellWalkable(grid, cell) {
  return (
    cell.x >= 0 &&
    cell.y >= 0 &&
    cell.x < grid.columns &&
    cell.y < grid.rows &&
    grid.walkable.has(getPathCellKey(cell))
  );
}

function reconstructPathCells(endCell, previous) {
  const cells = [];
  let current = endCell;

  while (current) {
    cells.push(current);
    current = previous.get(getPathCellKey(current));
  }

  return cells.reverse();
}

function compressPathCells(cells, grid, finalTarget) {
  if (cells.length <= 1) {
    return [];
  }

  const points = [];
  let previousDirection = null;

  for (let index = 1; index < cells.length; index += 1) {
    const previousCell = cells[index - 1];
    const cell = cells[index];
    const direction = {
      x: Math.sign(cell.x - previousCell.x),
      y: Math.sign(cell.y - previousCell.y)
    };
    const isDirectionChange =
      !previousDirection ||
      direction.x !== previousDirection.x ||
      direction.y !== previousDirection.y;

    if (isDirectionChange || index === cells.length - 1) {
      points.push(getPathCellPoint(cell));
      previousDirection = direction;
    }
  }

  if (isWalkableBody(finalTarget, HERO_COLLISION_RADIUS)) {
    points.push(finalTarget);
  }

  return points.slice(0, ENEMY_PATH_MAX_WAYPOINTS);
}

function getPathCellKey(cell) {
  return `${cell.x},${cell.y}`;
}

function getPathCellPoint(cell) {
  return {
    x: cell.x * ENEMY_PATH_GRID_SIZE,
    y: cell.y * ENEMY_PATH_GRID_SIZE
  };
}

function findNearestWalkableSpawn(rawPosition, direction, perpendicular) {
  const candidates = [
    rawPosition,
    addVectors(rawPosition, scaleVector(direction, 18)),
    addVectors(rawPosition, scaleVector(direction, 34)),
    addVectors(rawPosition, scaleVector(direction, 52)),
    addVectors(addVectors(rawPosition, scaleVector(direction, 34)), scaleVector(perpendicular, 16)),
    addVectors(addVectors(rawPosition, scaleVector(direction, 34)), scaleVector(perpendicular, -16)),
    addVectors(rawPosition, scaleVector(perpendicular, 20)),
    addVectors(rawPosition, scaleVector(perpendicular, -20))
  ];

  return candidates.find((candidate) => isWalkableBody(candidate, HERO_COLLISION_RADIUS)) ?? rawPosition;
}

function getDoorSpawnSpread(index, enemyCount) {
  if (enemyCount <= 1) {
    return 0;
  }

  return (index - (enemyCount - 1) / 2) * 18;
}

function getInitialPathReplanDelay(id) {
  const text = String(id ?? "");
  let hash = 0;
  for (let index = 0; index < text.length; index += 1) {
    hash = (Math.imul(hash, 31) + text.charCodeAt(index)) >>> 0;
  }

  return (
    (hash % ENEMY_PATH_INITIAL_STAGGER_BUCKETS) *
    ENEMY_PATH_INITIAL_STAGGER_SECONDS
  );
}

function addVectors(a, b) {
  return {
    x: a.x + b.x,
    y: a.y + b.y
  };
}

function scaleVector(vector, amount) {
  return {
    x: vector.x * amount,
    y: vector.y * amount
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeRoutePoints(routePoints) {
  if (!Array.isArray(routePoints)) {
    return [];
  }

  return routePoints
    .filter(
      (point) =>
        point &&
        Number.isFinite(point.x) &&
        Number.isFinite(point.y)
    )
    .map((point) => ({
      x: point.x,
      y: point.y
    }));
}
