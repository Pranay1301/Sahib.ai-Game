import { MATCH_STATUS } from "./constants.js";
import {
  ENEMY_CORE_ATTACK_POSITION,
  ENEMY_CORE_DEFENSE_DOORS
} from "./mapLayout.js";
import { createEnemy, ENEMY_TYPES } from "./enemyBehavior.js";
import { HERO_STATUS, distanceBetween, normalizeVector } from "./heroCombat.js";
import {
  MATCH_PRESSURE_PHASES,
  getMatchPressurePhase
} from "./timePressure.js";
import { doesSegmentHitWall } from "./wallSystem.js";

export const ENEMY_CORE_DEFENSE_ZONE_ID = "enemy_core_defense";
export const ENEMY_CORE_ATTACK_DAMAGE_PER_SECOND = 5;
export const ENEMY_CORE_ATTACK_RANGE = 190;
export const ENEMY_CORE_DEFENSE_SIGNAL_SECONDS = 7;

export const ENEMY_CORE_DEFENSE_THRESHOLDS = Object.freeze([
  Object.freeze({
    id: "enemy_core_75",
    hpPercent: 0.75
  }),
  Object.freeze({
    id: "enemy_core_50",
    hpPercent: 0.5
  }),
  Object.freeze({
    id: "enemy_core_25",
    hpPercent: 0.25
  })
]);

export const ENEMY_CORE_DEFENSE_WAVE_TYPES = Object.freeze({
  enemy_core_75: freezePhaseWaveTypes({
    [MATCH_PRESSURE_PHASES.OPENING_CONTACT]: [ENEMY_TYPES.ALIEN_HUNTER],
    [MATCH_PRESSURE_PHASES.EARLY_FIGHT]: [ENEMY_TYPES.ALIEN_HUNTER],
    [MATCH_PRESSURE_PHASES.MID_FIGHT]: [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.BREAKER_BOT],
    [MATCH_PRESSURE_PHASES.FINAL_CHAOS]: [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.BREAKER_BOT]
  }),
  enemy_core_50: freezePhaseWaveTypes({
    [MATCH_PRESSURE_PHASES.OPENING_CONTACT]: [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.BREAKER_BOT],
    [MATCH_PRESSURE_PHASES.EARLY_FIGHT]: [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.BREAKER_BOT],
    [MATCH_PRESSURE_PHASES.MID_FIGHT]: [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.BREAKER_BOT],
    [MATCH_PRESSURE_PHASES.FINAL_CHAOS]: [
      ENEMY_TYPES.ALIEN_HUNTER,
      ENEMY_TYPES.HEAVY_BRUTE,
      ENEMY_TYPES.BREAKER_BOT
    ]
  }),
  enemy_core_25: freezePhaseWaveTypes({
    [MATCH_PRESSURE_PHASES.OPENING_CONTACT]: [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.HEAVY_BRUTE],
    [MATCH_PRESSURE_PHASES.EARLY_FIGHT]: [ENEMY_TYPES.ALIEN_HUNTER, ENEMY_TYPES.HEAVY_BRUTE],
    [MATCH_PRESSURE_PHASES.MID_FIGHT]: [
      ENEMY_TYPES.ALIEN_HUNTER,
      ENEMY_TYPES.HEAVY_BRUTE,
      ENEMY_TYPES.BREAKER_BOT
    ],
    [MATCH_PRESSURE_PHASES.FINAL_CHAOS]: [
      ENEMY_TYPES.ALIEN_HUNTER,
      ENEMY_TYPES.HEAVY_BRUTE,
      ENEMY_TYPES.BREAKER_BOT,
      ENEMY_TYPES.ALIEN_HUNTER
    ]
  })
});

export function createCoreDefenseState() {
  return {
    triggeredThresholdIds: [],
    doorSignals: [],
    nextSpawnId: 1,
    spawnDoorIndex: 0
  };
}

export function tickCoreDefense(state, match, hero, deltaSeconds, options = {}) {
  if (
    options.isRunning === false ||
    !match ||
    match.status !== MATCH_STATUS.RUNNING ||
    match.enemyCoreHp <= 0
  ) {
    return {
      coreDefense: state,
      spawnedEnemies: [],
      heroDamage: 0
    };
  }

  const safeDelta = Math.max(0, Number(deltaSeconds) || 0);
  let nextState = decayCoreDefenseSignals(state, safeDelta);
  const pressurePhase = getMatchPressurePhase(match.elapsedSeconds);
  const spawnedEnemies = [];

  for (const threshold of ENEMY_CORE_DEFENSE_THRESHOLDS) {
    if (
      !nextState.triggeredThresholdIds.includes(threshold.id) &&
      match.enemyCoreHp <= match.coreMaxHp * threshold.hpPercent
    ) {
      const wave = createCoreDefenseWave(nextState, threshold.id, pressurePhase.id, {
        heroPosition: hero?.position
      });
      nextState = {
        ...nextState,
        triggeredThresholdIds: [...nextState.triggeredThresholdIds, threshold.id],
        doorSignals: addCoreDefenseDoorSignals(nextState.doorSignals, wave.doors),
        nextSpawnId: wave.nextSpawnId,
        spawnDoorIndex: wave.nextSpawnDoorIndex
      };
      spawnedEnemies.push(...wave.enemies);
    }
  }

  return {
    coreDefense: nextState,
    spawnedEnemies,
    heroDamage: getEnemyCoreAttackDamage(hero, safeDelta, options)
  };
}

export function getCoreDefenseWaveTypes(thresholdId, phaseId) {
  return (
    ENEMY_CORE_DEFENSE_WAVE_TYPES[thresholdId]?.[phaseId] ??
    ENEMY_CORE_DEFENSE_WAVE_TYPES[thresholdId]?.[MATCH_PRESSURE_PHASES.OPENING_CONTACT] ??
    []
  );
}

function createCoreDefenseWave(state, thresholdId, phaseId, options = {}) {
  const enemyTypes = getCoreDefenseWaveTypes(thresholdId, phaseId);
  const enemies = [];
  const doors = [];
  let nextSpawnId = state.nextSpawnId;
  let nextSpawnDoorIndex = state.spawnDoorIndex;

  for (const enemyType of enemyTypes) {
    const door = ENEMY_CORE_DEFENSE_DOORS[nextSpawnDoorIndex % ENEMY_CORE_DEFENSE_DOORS.length];
    doors.push(door);
    enemies.push(
      createEnemy(enemyType, {
        id: `enemy_core_defense_${nextSpawnId}`,
        zoneId: ENEMY_CORE_DEFENSE_ZONE_ID,
        doorId: door.id,
        position: door.center,
        facingVector: getFacingVectorToTarget(door.center, options.heroPosition)
      })
    );
    nextSpawnId += 1;
    nextSpawnDoorIndex += 1;
  }

  return {
    enemies,
    doors,
    nextSpawnId,
    nextSpawnDoorIndex
  };
}

function getEnemyCoreAttackDamage(hero, deltaSeconds, options = {}) {
  if (
    deltaSeconds <= 0 ||
    !hero ||
    hero.status !== HERO_STATUS.ALIVE ||
    distanceBetween(ENEMY_CORE_ATTACK_POSITION, hero.position) > ENEMY_CORE_ATTACK_RANGE
  ) {
    return 0;
  }

  if (doesSegmentHitWall(ENEMY_CORE_ATTACK_POSITION, hero.position, options.walls ?? [], 4)) {
    return 0;
  }

  return ENEMY_CORE_ATTACK_DAMAGE_PER_SECOND * deltaSeconds;
}

function addCoreDefenseDoorSignals(existingSignals, doors) {
  const uniqueDoors = [];
  for (const door of doors) {
    if (!uniqueDoors.some((candidate) => candidate.id === door.id)) {
      uniqueDoors.push(door);
    }
  }

  const doorIds = new Set(uniqueDoors.map((door) => door.id));
  return [
    ...existingSignals.filter((signal) => !doorIds.has(signal.doorId)),
    ...uniqueDoors.map((door) => ({
      id: `${door.id}_signal`,
      doorId: door.id,
      zoneId: ENEMY_CORE_DEFENSE_ZONE_ID,
      center: door.center,
      width: door.width,
      height: door.height,
      rotation: door.rotation,
      remainingSeconds: ENEMY_CORE_DEFENSE_SIGNAL_SECONDS
    }))
  ];
}

function decayCoreDefenseSignals(state, deltaSeconds) {
  if (deltaSeconds === 0 || state.doorSignals.length === 0) {
    return state;
  }

  let changed = false;
  const doorSignals = [];
  for (const signal of state.doorSignals) {
    const remainingSeconds = Math.max(0, signal.remainingSeconds - deltaSeconds);
    if (remainingSeconds !== signal.remainingSeconds) {
      changed = true;
    }
    if (remainingSeconds > 0) {
      doorSignals.push({
        ...signal,
        remainingSeconds
      });
    } else {
      changed = true;
    }
  }

  return changed
    ? {
        ...state,
        doorSignals
      }
    : state;
}

function getFacingVectorToTarget(source, target) {
  if (!target) {
    return { x: -1, y: 0 };
  }

  const vector = normalizeVector({
    x: target.x - source.x,
    y: target.y - source.y
  });

  return vector.x === 0 && vector.y === 0 ? { x: -1, y: 0 } : vector;
}

function freezePhaseWaveTypes(config) {
  return Object.freeze(
    Object.fromEntries(
      Object.entries(config).map(([phaseId, enemyTypes]) => [
        phaseId,
        Object.freeze([...enemyTypes])
      ])
    )
  );
}
