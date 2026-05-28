import {
  ENEMY_CORE_POSITION,
  HERO_RESPAWN_POSITION,
  HERO_START_POSITION,
  HERO_COLLISION_RADIUS,
  PLAYER_CORE_POSITION,
  WORLD_BOUNDS,
  isWalkableBody
} from "./mapLayout.js";
import { HERO_ATTACK_ANIMATION_SECONDS } from "./characterAnimation.js";
import { isPointBlockedByWalls } from "./wallSystem.js";

export const HERO_MAX_HP = 100;
export const HERO_RESPAWN_SECONDS = 5;
export const HERO_DEATH_SCORE_PENALTY = 100;

export const HERO_STATUS = Object.freeze({
  ALIVE: "alive",
  DOWNED: "downed"
});

export const WEAPON_IDS = Object.freeze({
  RIFLE: "sahib_ar_7",
  ENERGY_BURST_RIFLE: "energy_burst_rifle"
});

export {
  ENEMY_CORE_POSITION,
  HERO_RESPAWN_POSITION,
  HERO_START_POSITION,
  HERO_COLLISION_RADIUS,
  PLAYER_CORE_POSITION,
  WORLD_BOUNDS
};

export const HERO_MOVE_SPEED = 80;
const HERO_MOVE_COLLISION_STEP = 6;

export const RIFLE = Object.freeze({
  id: WEAPON_IDS.RIFLE,
  name: "Sahib AR-7 Tactical Rifle",
  magazineSize: 30,
  damageToEnemy: 10,
  damageToEnemyCore: 5,
  fireRatePerSecond: 11,
  reloadSeconds: 1.8,
  range: 340,
  projectileSpeed: 900,
  projectileRadius: 5
});

export const ENERGY_BURST_RIFLE = Object.freeze({
  id: WEAPON_IDS.ENERGY_BURST_RIFLE,
  name: "Energy Burst Rifle",
  ammo: 12,
  damageToEnemy: 35,
  damageToEnemyCore: 12,
  fireRatePerSecond: 4,
  range: 380,
  projectileSpeed: 820,
  projectileRadius: 7
});

export function createHeroCombatState(overrides = {}) {
  return {
    status: HERO_STATUS.ALIVE,
    hp: HERO_MAX_HP,
    position: { ...HERO_START_POSITION },
    magazineAmmo: RIFLE.magazineSize,
    isReloading: false,
    reloadRemainingSeconds: 0,
    respawnRemainingSeconds: 0,
    deaths: 0,
    scorePenalty: 0,
    fireCooldownSeconds: 0,
    shotsFired: 0,
    activeWeaponId: WEAPON_IDS.RIFLE,
    energyBurstAmmo: 0,
    lastShotHitCore: false,
    facingVector: { x: 1, y: 0 },
    attackAnimationRemainingSeconds: 0,
    animationTimeSeconds: 0,
    isMoving: false,
    ...overrides
  };
}

export function tickHeroCombat(hero, controls, deltaSeconds, context = {}) {
  if (hero.status !== HERO_STATUS.ALIVE) {
    const nextHero = tickRespawn(hero, deltaSeconds);
    return {
      hero: nextHero,
      enemyCoreDamage: 0,
      shotsFired: 0,
      projectileSpawns: []
    };
  }

  let nextHero = moveHero(hero, controls, deltaSeconds, context);
  nextHero = aimHero(nextHero, controls);
  nextHero = tickRifleTimers(nextHero, deltaSeconds, controls.isFiring);

  if (!controls.isFiring) {
    return {
      hero: {
        ...nextHero,
        lastShotHitCore: false
      },
      enemyCoreDamage: 0,
      shotsFired: 0,
      projectileSpawns: []
    };
  }

  return fireRifleBurst(nextHero);
}

export function moveHero(hero, controls, deltaSeconds, context = {}) {
  const vector = normalizeVector({
    x: controls.moveX || 0,
    y: controls.moveY || 0
  });
  const distance = HERO_MOVE_SPEED * Math.max(0, deltaSeconds);

  if (distance === 0 || (vector.x === 0 && vector.y === 0)) {
    return hero.isMoving ? { ...hero, isMoving: false } : hero;
  }

  const targetPosition = {
    x: clamp(
      hero.position.x + vector.x * distance,
      HERO_COLLISION_RADIUS,
      WORLD_BOUNDS.width - HERO_COLLISION_RADIUS
    ),
    y: clamp(
      hero.position.y + vector.y * distance,
      HERO_COLLISION_RADIUS,
      WORLD_BOUNDS.height - HERO_COLLISION_RADIUS
    )
  };
  const nextPosition = resolveWalkableMove(hero.position, targetPosition, context);

  if (areSamePosition(nextPosition, hero.position)) {
    return hero.isMoving ? { ...hero, isMoving: false, facingVector: vector } : { ...hero, facingVector: vector };
  }

  return {
    ...hero,
    position: nextPosition,
    facingVector: vector,
    isMoving: true,
    animationTimeSeconds: (hero.animationTimeSeconds ?? 0) + Math.max(0, deltaSeconds)
  };
}

export function tickRifleTimers(hero, deltaSeconds, isFiring = false) {
  const safeDelta = Math.max(0, deltaSeconds);
  const weapon = getActiveWeaponConfig(hero);
  const fireIntervalSeconds = getFireIntervalSeconds(weapon);
  const rawFireCooldownSeconds = hero.fireCooldownSeconds - safeDelta;
  const fireCooldownSeconds = isFiring
    ? Math.max(-fireIntervalSeconds, rawFireCooldownSeconds)
    : Math.max(0, rawFireCooldownSeconds);
  const attackAnimationRemainingSeconds = Math.max(
    0,
    (hero.attackAnimationRemainingSeconds ?? 0) - safeDelta
  );

  if (!hero.isReloading) {
    return {
      ...hero,
      fireCooldownSeconds,
      attackAnimationRemainingSeconds
    };
  }

  const reloadRemainingSeconds = Math.max(0, hero.reloadRemainingSeconds - safeDelta);
  if (reloadRemainingSeconds > 0) {
    return {
      ...hero,
      fireCooldownSeconds,
      reloadRemainingSeconds,
      attackAnimationRemainingSeconds
    };
  }

  return {
    ...hero,
    magazineAmmo: RIFLE.magazineSize,
    isReloading: false,
    reloadRemainingSeconds: 0,
    fireCooldownSeconds,
    attackAnimationRemainingSeconds
  };
}

export function fireRifleBurst(hero) {
  const weapon = getActiveWeaponConfig(hero);

  if (weapon.id === WEAPON_IDS.ENERGY_BURST_RIFLE) {
    return fireEnergyBurst(hero, weapon);
  }

  if (hero.isReloading) {
    return {
      hero,
      enemyCoreDamage: 0,
      shotsFired: 0,
      projectileSpawns: []
    };
  }

  if (hero.magazineAmmo <= 0) {
    return {
      hero: startReload(hero),
      enemyCoreDamage: 0,
      shotsFired: 0,
      projectileSpawns: []
    };
  }

  let nextHero = hero;
  let shotsFired = 0;
  let nextCooldown = nextHero.fireCooldownSeconds;
  const fireIntervalSeconds = getFireIntervalSeconds(weapon);
  const shotDirection = getRifleShotDirection(nextHero);
  const projectileSpawns = [];

  while (nextHero.magazineAmmo > 0 && nextCooldown <= 0) {
    shotsFired += 1;
    nextCooldown += fireIntervalSeconds;
    projectileSpawns.push({
      origin: getRifleMuzzlePosition(nextHero.position, shotDirection),
      direction: shotDirection,
      range: weapon.range,
      speed: weapon.projectileSpeed,
      radius: weapon.projectileRadius,
      damageToEnemy: weapon.damageToEnemy,
      damageToEnemyCore: weapon.damageToEnemyCore,
      weaponId: weapon.id
    });
    nextHero = {
      ...nextHero,
      magazineAmmo: nextHero.magazineAmmo - 1,
      shotsFired: nextHero.shotsFired + 1
    };
  }

  if (nextHero.magazineAmmo <= 0) {
    nextHero = startReload(nextHero);
  } else {
    nextHero = {
      ...nextHero,
      fireCooldownSeconds: nextCooldown
    };
  }

  return {
    hero: {
      ...nextHero,
      lastShotHitCore: false,
      attackAnimationRemainingSeconds:
        shotsFired > 0 ? HERO_ATTACK_ANIMATION_SECONDS : nextHero.attackAnimationRemainingSeconds
    },
    enemyCoreDamage: 0,
    shotsFired,
    projectileSpawns
  };
}

function fireEnergyBurst(hero, weapon) {
  if (hero.energyBurstAmmo <= 0) {
    return {
      hero: returnToDefaultRifle(hero),
      enemyCoreDamage: 0,
      shotsFired: 0,
      projectileSpawns: []
    };
  }

  let nextHero = hero;
  let shotsFired = 0;
  let nextCooldown = nextHero.fireCooldownSeconds;
  const fireIntervalSeconds = getFireIntervalSeconds(weapon);
  const shotDirection = getRifleShotDirection(nextHero);
  const projectileSpawns = [];

  while (nextHero.energyBurstAmmo > 0 && nextCooldown <= 0) {
    shotsFired += 1;
    nextCooldown += fireIntervalSeconds;
    projectileSpawns.push({
      origin: getRifleMuzzlePosition(nextHero.position, shotDirection),
      direction: shotDirection,
      range: weapon.range,
      speed: weapon.projectileSpeed,
      radius: weapon.projectileRadius,
      damageToEnemy: weapon.damageToEnemy,
      damageToEnemyCore: weapon.damageToEnemyCore,
      weaponId: weapon.id
    });
    nextHero = {
      ...nextHero,
      energyBurstAmmo: nextHero.energyBurstAmmo - 1,
      shotsFired: nextHero.shotsFired + 1
    };
  }

  const hasAmmoRemaining = nextHero.energyBurstAmmo > 0;
  return {
    hero: {
      ...(hasAmmoRemaining ? nextHero : returnToDefaultRifle(nextHero)),
      fireCooldownSeconds: hasAmmoRemaining ? nextCooldown : 0,
      lastShotHitCore: false,
      attackAnimationRemainingSeconds:
        shotsFired > 0 ? HERO_ATTACK_ANIMATION_SECONDS : nextHero.attackAnimationRemainingSeconds
    },
    enemyCoreDamage: 0,
    shotsFired,
    projectileSpawns
  };
}

export function startReload(hero) {
  if (hero.status !== HERO_STATUS.ALIVE || hero.isReloading || hero.magazineAmmo >= RIFLE.magazineSize) {
    return hero;
  }

  return {
    ...hero,
    isReloading: true,
    reloadRemainingSeconds: RIFLE.reloadSeconds,
    fireCooldownSeconds: 0
  };
}

export function damageHero(hero, rawAmount) {
  const amount = Math.max(0, rawAmount);
  if (amount === 0 || hero.status !== HERO_STATUS.ALIVE) {
    return hero;
  }

  const hp = Math.max(0, hero.hp - amount);
  if (hp > 0) {
    return {
      ...hero,
      hp,
      status: HERO_STATUS.ALIVE
    };
  }

  return {
    ...hero,
    hp: 0,
    status: HERO_STATUS.DOWNED,
    respawnRemainingSeconds: HERO_RESPAWN_SECONDS,
    deaths: hero.deaths + 1,
    scorePenalty: hero.scorePenalty + HERO_DEATH_SCORE_PENALTY,
    isReloading: false,
    reloadRemainingSeconds: 0,
    fireCooldownSeconds: 0,
    activeWeaponId: WEAPON_IDS.RIFLE,
    energyBurstAmmo: 0,
    lastShotHitCore: false,
    attackAnimationRemainingSeconds: 0
  };
}

export function tickRespawn(hero, deltaSeconds) {
  if (hero.status !== HERO_STATUS.DOWNED) {
    return hero;
  }

  const respawnRemainingSeconds = Math.max(
    0,
    hero.respawnRemainingSeconds - Math.max(0, deltaSeconds)
  );

  if (respawnRemainingSeconds > 0) {
    return {
      ...hero,
      respawnRemainingSeconds
    };
  }

  return respawnHero(hero);
}

export function respawnHero(hero) {
  return {
    ...hero,
    status: HERO_STATUS.ALIVE,
    hp: HERO_MAX_HP,
    position: { ...HERO_RESPAWN_POSITION },
    respawnRemainingSeconds: 0,
    fireCooldownSeconds: 0,
    isReloading: false,
    reloadRemainingSeconds: 0,
    activeWeaponId: WEAPON_IDS.RIFLE,
    energyBurstAmmo: 0,
    lastShotHitCore: false,
    attackAnimationRemainingSeconds: 0,
    isMoving: false
  };
}

export function equipEnergyBurstRifle(hero) {
  if (!hero || hero.status !== HERO_STATUS.ALIVE) {
    return hero;
  }

  return {
    ...hero,
    activeWeaponId: WEAPON_IDS.ENERGY_BURST_RIFLE,
    energyBurstAmmo: ENERGY_BURST_RIFLE.ammo,
    isReloading: false,
    reloadRemainingSeconds: 0,
    fireCooldownSeconds: 0
  };
}

export function getActiveWeaponConfig(hero) {
  return hero?.activeWeaponId === WEAPON_IDS.ENERGY_BURST_RIFLE && hero.energyBurstAmmo > 0
    ? ENERGY_BURST_RIFLE
    : RIFLE;
}

function returnToDefaultRifle(hero) {
  return {
    ...hero,
    activeWeaponId: WEAPON_IDS.RIFLE,
    energyBurstAmmo: 0
  };
}

function getFireIntervalSeconds(weapon) {
  return 1 / Math.max(1, weapon.fireRatePerSecond);
}

export function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function normalizeVector(vector) {
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);
  if (length === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length
  };
}

export function getRifleShotDirection(hero) {
  const direction = normalizeVector(hero.facingVector ?? { x: 1, y: 0 });
  if (direction.x === 0 && direction.y === 0) {
    return { x: 1, y: 0 };
  }

  return direction;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function aimHero(hero, controls) {
  const aimVector = normalizeVector({
    x: controls.aimX || 0,
    y: controls.aimY || 0
  });

  if (aimVector.x === 0 && aimVector.y === 0) {
    return hero;
  }

  return {
    ...hero,
    facingVector: aimVector
  };
}

function getRifleMuzzlePosition(position, direction) {
  return {
    x: position.x + direction.x * 16,
    y: position.y + direction.y * 16
  };
}

function resolveWalkableMove(currentPosition, targetPosition, context = {}) {
  const totalDistance = distanceBetween(currentPosition, targetPosition);
  const steps = Math.max(1, Math.ceil(totalDistance / HERO_MOVE_COLLISION_STEP));
  let position = currentPosition;

  for (let step = 1; step <= steps; step += 1) {
    const stepTarget = {
      x: currentPosition.x + ((targetPosition.x - currentPosition.x) * step) / steps,
      y: currentPosition.y + ((targetPosition.y - currentPosition.y) * step) / steps
    };
    const nextPosition = resolveWalkableStep(position, stepTarget, context);

    if (areSamePosition(nextPosition, position)) {
      break;
    }

    position = nextPosition;
  }

  return position;
}

function resolveWalkableStep(currentPosition, targetPosition, context = {}) {
  if (isWalkableBody(targetPosition) && !isPointBlockedByWalls(targetPosition, context.walls, HERO_COLLISION_RADIUS)) {
    return targetPosition;
  }

  const xOnlyPosition = {
    x: targetPosition.x,
    y: currentPosition.y
  };
  if (isWalkableBody(xOnlyPosition) && !isPointBlockedByWalls(xOnlyPosition, context.walls, HERO_COLLISION_RADIUS)) {
    return xOnlyPosition;
  }

  const yOnlyPosition = {
    x: currentPosition.x,
    y: targetPosition.y
  };
  if (isWalkableBody(yOnlyPosition) && !isPointBlockedByWalls(yOnlyPosition, context.walls, HERO_COLLISION_RADIUS)) {
    return yOnlyPosition;
  }

  return currentPosition;
}

function areSamePosition(a, b) {
  return a.x === b.x && a.y === b.y;
}
