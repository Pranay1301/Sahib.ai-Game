import {
  CORE_PRESSURE_SPAWN_POINTS,
  PLAYER_CORE_ATTACK_POSITION
} from "./mapLayout.js";
import { createEnemy, ENEMY_TYPES } from "./enemyBehavior.js";
import {
  MATCH_PRESSURE_PHASES,
  getMatchPressurePhase
} from "./timePressure.js";

export const CORE_PRESSURE_START_SECONDS = 45;
export const CORE_PRESSURE_ZONE_ID = "core_pressure";

export const CORE_PRESSURE_WAVE_CONFIG_BY_PHASE = Object.freeze({
  [MATCH_PRESSURE_PHASES.OPENING_CONTACT]: Object.freeze({
    enemyCount: 0,
    intervalSeconds: Infinity
  }),
  [MATCH_PRESSURE_PHASES.EARLY_FIGHT]: Object.freeze({
    enemyCount: 1,
    intervalSeconds: 35
  }),
  [MATCH_PRESSURE_PHASES.MID_FIGHT]: Object.freeze({
    enemyCount: 2,
    intervalSeconds: 28
  }),
  [MATCH_PRESSURE_PHASES.FINAL_CHAOS]: Object.freeze({
    enemyCount: 3,
    intervalSeconds: 20
  })
});

export const CORE_PRESSURE_ROUTE_POINTS_BY_LANE_ID = Object.freeze({
  top_lane: Object.freeze([
    Object.freeze({ x: 1104, y: 288 }),
    Object.freeze({ x: 1024, y: 336 }),
    Object.freeze({ x: 944, y: 384 }),
    Object.freeze({ x: 864, y: 432 }),
    Object.freeze({ x: 784, y: 496 }),
    Object.freeze({ x: 704, y: 544 }),
    Object.freeze({ x: 624, y: 608 })
  ]),
  mid_lane: Object.freeze([
    Object.freeze({ x: 1168, y: 256 }),
    Object.freeze({ x: 1088, y: 304 }),
    Object.freeze({ x: 1008, y: 336 }),
    Object.freeze({ x: 928, y: 384 }),
    Object.freeze({ x: 848, y: 448 }),
    Object.freeze({ x: 768, y: 512 }),
    Object.freeze({ x: 688, y: 560 }),
    Object.freeze({ x: 608, y: 608 })
  ]),
  bottom_lane: Object.freeze([
    Object.freeze({ x: 1120, y: 464 }),
    Object.freeze({ x: 1040, y: 528 }),
    Object.freeze({ x: 960, y: 480 }),
    Object.freeze({ x: 880, y: 480 }),
    Object.freeze({ x: 800, y: 496 }),
    Object.freeze({ x: 720, y: 528 }),
    Object.freeze({ x: 640, y: 592 })
  ])
});

export function createCorePressureState() {
  return {
    nextWaveRemainingSeconds: 0,
    waveCount: 0,
    nextSpawnId: 1,
    spawnPointIndex: 0,
    lastPhaseId: null
  };
}

export function tickCorePressure(state, deltaSeconds, options = {}) {
  if (options.isRunning === false) {
    return {
      corePressure: state,
      spawnedEnemies: []
    };
  }

  const elapsedSeconds = Math.max(0, Number(options.elapsedSeconds) || 0);
  const pressurePhase = getMatchPressurePhase(elapsedSeconds);
  const config = getCorePressureWaveConfig(pressurePhase.id);

  if (elapsedSeconds < CORE_PRESSURE_START_SECONDS || config.enemyCount <= 0) {
    return {
      corePressure:
        state.lastPhaseId === pressurePhase.id
          ? state
          : {
              ...state,
              lastPhaseId: pressurePhase.id
            },
      spawnedEnemies: []
    };
  }

  const safeDelta = Math.max(0, Number(deltaSeconds) || 0);
  const phaseChanged = state.lastPhaseId !== null && state.lastPhaseId !== pressurePhase.id;
  const nextWaveRemainingSeconds = phaseChanged
    ? 0
    : Math.max(0, state.nextWaveRemainingSeconds - safeDelta);

  if (nextWaveRemainingSeconds > 0) {
    return {
      corePressure: {
        ...state,
        nextWaveRemainingSeconds,
        lastPhaseId: pressurePhase.id
      },
      spawnedEnemies: []
    };
  }

  const spawned = createCorePressureWave(state, config.enemyCount);

  return {
    corePressure: {
      ...state,
      nextWaveRemainingSeconds: config.intervalSeconds,
      waveCount: state.waveCount + 1,
      nextSpawnId: spawned.nextSpawnId,
      spawnPointIndex: spawned.nextSpawnPointIndex,
      lastPhaseId: pressurePhase.id
    },
    spawnedEnemies: spawned.enemies
  };
}

export function getCorePressureWaveConfig(phaseId) {
  return (
    CORE_PRESSURE_WAVE_CONFIG_BY_PHASE[phaseId] ??
    CORE_PRESSURE_WAVE_CONFIG_BY_PHASE[MATCH_PRESSURE_PHASES.OPENING_CONTACT]
  );
}

function createCorePressureWave(state, enemyCount) {
  const enemies = [];
  let nextSpawnId = state.nextSpawnId;
  let nextSpawnPointIndex = state.spawnPointIndex;

  for (let index = 0; index < enemyCount; index += 1) {
    const spawnPoint =
      CORE_PRESSURE_SPAWN_POINTS[nextSpawnPointIndex % CORE_PRESSURE_SPAWN_POINTS.length];
    enemies.push(
      createEnemy(ENEMY_TYPES.HUNTER_EXOSUIT, {
        id: `core_pressure_${nextSpawnId}`,
        zoneId: CORE_PRESSURE_ZONE_ID,
        doorId: spawnPoint.id,
        position: spawnPoint.point,
        facingVector: getFacingVectorToPlayerCore(spawnPoint.point),
        routePoints: CORE_PRESSURE_ROUTE_POINTS_BY_LANE_ID[spawnPoint.laneId] ?? []
      })
    );

    nextSpawnId += 1;
    nextSpawnPointIndex += 1;
  }

  return {
    enemies,
    nextSpawnId,
    nextSpawnPointIndex
  };
}

function getFacingVectorToPlayerCore(point) {
  const vector = {
    x: PLAYER_CORE_ATTACK_POSITION.x - point.x,
    y: PLAYER_CORE_ATTACK_POSITION.y - point.y
  };
  const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y);

  if (length === 0) {
    return { x: -1, y: 0 };
  }

  return {
    x: vector.x / length,
    y: vector.y / length
  };
}
