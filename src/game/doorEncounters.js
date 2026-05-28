import { CENTER_ZONE, MAJOR_INTERSECTIONS } from "./mapLayout.js";
import {
  DEFAULT_ENEMIES_PER_DOOR,
  ENEMIES_PER_DOOR,
  createDoorEnemySpawns
} from "./enemyBehavior.js";
import {
  getDoorEnemyCountsForPhase,
  getMatchPressurePhase
} from "./timePressure.js";

export const DOOR_SEQUENCE_GAP_SECONDS = 2.5;
export const INTERSECTION_COOLDOWN_SECONDS = 20;
export const CENTER_COOLDOWN_SECONDS = 28;
export const DOOR_SIGNAL_SECONDS = 7;
export const DOOR_ENEMIES_PER_DOOR = ENEMIES_PER_DOOR;
export const PLACEHOLDER_ENEMIES_PER_DOOR = DOOR_ENEMIES_PER_DOOR;

const TIMER_EPSILON_SECONDS = 0.0001;

export const INTERSECTION_DOOR_ENCOUNTER_ZONES = Object.freeze(
  MAJOR_INTERSECTIONS.map((intersection) =>
    Object.freeze({
      id: intersection.id,
      type: "intersection",
      label: intersection.label,
      center: intersection.center,
      triggerRadius: intersection.triggerRadius,
      cooldownSeconds: INTERSECTION_COOLDOWN_SECONDS,
      doors: intersection.doors
    })
  )
);

export const CENTER_DOOR_ENCOUNTER_ZONE = Object.freeze({
  id: CENTER_ZONE.id,
  type: "center",
  label: CENTER_ZONE.label,
  center: CENTER_ZONE.center,
  triggerRadius: CENTER_ZONE.triggerRadius,
  cooldownSeconds: CENTER_COOLDOWN_SECONDS,
  doors: CENTER_ZONE.doors
});

export const DOOR_ENCOUNTER_ZONES = Object.freeze([
  ...INTERSECTION_DOOR_ENCOUNTER_ZONES,
  CENTER_DOOR_ENCOUNTER_ZONE
]);

export function createDoorEncounterState(options = {}) {
  const zones = {};
  for (const zone of DOOR_ENCOUNTER_ZONES) {
    zones[zone.id] = createZoneState(zone.id);
  }

  return {
    zones,
    doorSignals: [],
    spawnedEnemies: [],
    nextSpawnId: 1,
    randomSeed: normalizeSeed(options.seed)
  };
}

export function tickDoorEncounters(state, heroPosition, deltaSeconds, options = {}) {
  if (options.isRunning === false) {
    return state;
  }

  let nextState = advanceDoorEncounterTimers(state, deltaSeconds);
  if (!heroPosition) {
    return nextState;
  }

  for (const zone of DOOR_ENCOUNTER_ZONES) {
    if (
      canTriggerZone(nextState.zones[zone.id]) &&
      isPointInsideZoneTrigger(heroPosition, zone)
    ) {
      nextState = triggerDoorEncounter(nextState, zone.id, options);
    }
  }

  return nextState;
}

export function setDoorEncounterEnemies(state, spawnedEnemies) {
  if (state.spawnedEnemies === spawnedEnemies) {
    return state;
  }

  return {
    ...state,
    spawnedEnemies
  };
}

export function triggerDoorEncounter(state, zoneId, options = {}) {
  const zone = getDoorEncounterZone(zoneId);
  const zoneState = state.zones[zoneId];
  if (!zone || !zoneState || !canTriggerZone(zoneState)) {
    return state;
  }

  const randomized = randomizeDoorSequence(zone.doors, {
    previousFirstDoorId: zoneState.lastFirstDoorId,
    seed: state.randomSeed
  });
  const sequenceDoorIds = randomized.sequence.map((door) => door.id);
  const firstDoorId = sequenceDoorIds[0];
  if (!firstDoorId) {
    return state;
  }

  const pressurePhase = getMatchPressurePhase(options.elapsedSeconds ?? 0);
  const enemyCountsByDoorIndex = getDoorEnemyCountsForPhase(pressurePhase.id, {
    useIntenseTable: options.useIntenseEnemyCounts === true
  });
  const opened = addDoorOpenEffects(state, zone, firstDoorId, {
    pressurePhaseId: pressurePhase.id,
    sequenceIndex: 0,
    spawnCount: enemyCountsByDoorIndex[0]
  });
  const nextZone = {
    ...zoneState,
    cooldownRemainingSeconds: zone.cooldownSeconds,
    lastFirstDoorId: firstDoorId,
    triggerCount: zoneState.triggerCount + 1,
    activeEvent: {
      sequenceDoorIds,
      pressurePhaseId: pressurePhase.id,
      enemyCountsByDoorIndex,
      openedDoorIds: [firstDoorId],
      nextDoorIndex: 1,
      nextDoorRemainingSeconds: DOOR_SEQUENCE_GAP_SECONDS
    }
  };

  return {
    ...opened,
    randomSeed: randomized.seed,
    zones: {
      ...opened.zones,
      [zoneId]: nextZone
    }
  };
}

export function randomizeDoorSequence(doors, options = {}) {
  const sequence = [...doors];
  let randomSeed = normalizeSeed(options.seed);
  let randomValueIndex = 0;
  const randomValues = Array.isArray(options.randomValues) ? options.randomValues : null;

  const takeRandom = () => {
    if (randomValues && randomValueIndex < randomValues.length) {
      const value = randomValues[randomValueIndex];
      randomValueIndex += 1;
      return clamp01(value);
    }

    if (randomSeed !== null) {
      const next = nextSeededRandom(randomSeed);
      randomSeed = next.seed;
      return next.value;
    }

    return Math.random();
  };

  for (let index = sequence.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(takeRandom() * (index + 1));
    const item = sequence[index];
    sequence[index] = sequence[swapIndex];
    sequence[swapIndex] = item;
  }

  avoidRepeatedFirstDoor(sequence, options.previousFirstDoorId);

  return {
    sequence,
    seed: randomSeed
  };
}

export function isPointInsideZoneTrigger(point, zone) {
  return distanceBetween(point, zone.center) <= zone.triggerRadius;
}

export function getDoorEncounterZone(zoneId) {
  return DOOR_ENCOUNTER_ZONES.find((zone) => zone.id === zoneId) || null;
}

export function getDoorEncounterZoneState(state, zoneId) {
  return state.zones[zoneId] || null;
}

function advanceDoorEncounterTimers(state, deltaSeconds) {
  const safeDelta = Math.max(0, deltaSeconds);
  if (safeDelta === 0) {
    return state;
  }

  let changed = false;
  let zones = state.zones;
  let doorSignals = decayTimedList(state.doorSignals, safeDelta);
  let spawnedEnemies = state.spawnedEnemies;
  let nextSpawnId = state.nextSpawnId;

  if (doorSignals !== state.doorSignals) {
    changed = true;
  }

  for (const zone of DOOR_ENCOUNTER_ZONES) {
    const zoneState = zones[zone.id];
    let nextZoneState = zoneState;

    const nextCooldown = Math.max(
      0,
      zoneState.cooldownRemainingSeconds - safeDelta
    );
    if (nextCooldown !== zoneState.cooldownRemainingSeconds) {
      nextZoneState = {
        ...nextZoneState,
        cooldownRemainingSeconds: nextCooldown
      };
    }

    if (nextZoneState.activeEvent) {
      let event = {
        ...nextZoneState.activeEvent,
        openedDoorIds: [...nextZoneState.activeEvent.openedDoorIds]
      };
      let remainingSeconds = event.nextDoorRemainingSeconds - safeDelta;

      while (
        event.nextDoorIndex < event.sequenceDoorIds.length &&
        remainingSeconds <= TIMER_EPSILON_SECONDS
      ) {
        const doorId = event.sequenceDoorIds[event.nextDoorIndex];
        const opened = addDoorOpenEffects(
          {
            ...state,
            zones,
            doorSignals,
            spawnedEnemies,
            nextSpawnId
          },
          zone,
          doorId,
          {
            pressurePhaseId: event.pressurePhaseId,
            sequenceIndex: event.nextDoorIndex,
            spawnCount:
              event.enemyCountsByDoorIndex?.[event.nextDoorIndex] ?? DEFAULT_ENEMIES_PER_DOOR
          }
        );
        doorSignals = opened.doorSignals;
        spawnedEnemies = opened.spawnedEnemies;
        nextSpawnId = opened.nextSpawnId;

        event.openedDoorIds = [...event.openedDoorIds, doorId];
        event.nextDoorIndex += 1;
        changed = true;

        if (event.nextDoorIndex < event.sequenceDoorIds.length) {
          remainingSeconds += DOOR_SEQUENCE_GAP_SECONDS;
        }
      }

      nextZoneState =
        event.nextDoorIndex >= event.sequenceDoorIds.length
          ? {
              ...nextZoneState,
              activeEvent: null
            }
          : {
              ...nextZoneState,
              activeEvent: {
                ...event,
                nextDoorRemainingSeconds: remainingSeconds
              }
            };
    }

    if (nextZoneState !== zoneState) {
      zones = {
        ...zones,
        [zone.id]: nextZoneState
      };
      changed = true;
    }
  }

  return changed
    ? {
        ...state,
        zones,
        doorSignals,
        spawnedEnemies,
        nextSpawnId
      }
    : state;
}

function addDoorOpenEffects(state, zone, doorId, options = {}) {
  const door = zone.doors.find((candidate) => candidate.id === doorId);
  if (!door) {
    return state;
  }

  const spawnCount = Math.max(0, Math.floor(options.spawnCount ?? DEFAULT_ENEMIES_PER_DOOR));
  const existingSignals = state.doorSignals.filter((signal) => signal.doorId !== doorId);
  const doorSignals = [
    ...existingSignals,
    {
      id: `${doorId}_signal`,
      doorId,
      zoneId: zone.id,
      center: door.center,
      width: door.width,
      height: door.height,
      rotation: door.rotation,
      pressurePhaseId: options.pressurePhaseId ?? null,
      sequenceIndex: options.sequenceIndex ?? null,
      spawnCount,
      remainingSeconds: DOOR_SIGNAL_SECONDS
    }
  ];

  const spawned = createDoorEnemySpawns(zone, door, state.nextSpawnId, {
    count: spawnCount
  });
  return {
    ...state,
    doorSignals,
    spawnedEnemies: [...state.spawnedEnemies, ...spawned.enemies],
    nextSpawnId: spawned.nextSpawnId
  };
}

function decayTimedList(items, deltaSeconds) {
  let changed = false;
  const nextItems = [];

  for (const item of items) {
    const remainingSeconds = Math.max(0, item.remainingSeconds - deltaSeconds);
    if (remainingSeconds !== item.remainingSeconds) {
      changed = true;
    }
    if (remainingSeconds > 0) {
      nextItems.push({
        ...item,
        remainingSeconds
      });
    } else {
      changed = true;
    }
  }

  return changed ? nextItems : items;
}

function createZoneState(zoneId) {
  return {
    zoneId,
    cooldownRemainingSeconds: 0,
    lastFirstDoorId: null,
    triggerCount: 0,
    activeEvent: null
  };
}

function canTriggerZone(zoneState) {
  return Boolean(
    zoneState &&
      zoneState.cooldownRemainingSeconds <= 0 &&
      !zoneState.activeEvent
  );
}

function avoidRepeatedFirstDoor(sequence, previousFirstDoorId) {
  if (!previousFirstDoorId || sequence.length < 2 || sequence[0]?.id !== previousFirstDoorId) {
    return;
  }

  const swapIndex = sequence.findIndex((door, index) => index > 0 && door.id !== previousFirstDoorId);
  if (swapIndex === -1) {
    return;
  }

  const firstDoor = sequence[0];
  sequence[0] = sequence[swapIndex];
  sequence[swapIndex] = firstDoor;
}

function normalizeSeed(seed) {
  if (seed === null || typeof seed === "undefined") {
    return null;
  }

  const normalized = Number(seed);
  if (!Number.isFinite(normalized)) {
    return null;
  }

  return normalized >>> 0;
}

function nextSeededRandom(seed) {
  const nextSeed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
  return {
    seed: nextSeed,
    value: nextSeed / 4294967296
  };
}

function distanceBetween(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function clamp01(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(0.999999, value));
}
