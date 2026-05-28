import {
  CENTER_ZONE,
  MAJOR_INTERSECTIONS,
  isWalkableBody
} from "./mapLayout.js";
import {
  ENERGY_BURST_RIFLE,
  HERO_STATUS,
  distanceBetween,
  equipEnergyBurstRifle
} from "./heroCombat.js";

export const SPECIAL_WEAPON_PICKUP_RADIUS = 36;
export const SPECIAL_WEAPON_PICKUP_LIFETIME_SECONDS = 30;
export const ENERGY_BURST_DROP_TIMES_SECONDS = Object.freeze([150, 330]);

export const SPECIAL_WEAPON_DROP_POINTS = Object.freeze([
  Object.freeze({
    id: "center_energy_burst_drop",
    position: CENTER_ZONE.center
  }),
  Object.freeze({
    id: "lower_intersection_energy_burst_drop",
    position: MAJOR_INTERSECTIONS[2].center
  })
]);

export function createSpecialWeaponDropState() {
  return {
    activePickups: [],
    nextDropIndex: 0,
    nextPickupId: 1
  };
}

export function tickSpecialWeaponDrops(state, deltaSeconds, context = {}) {
  if (context.isRunning === false) {
    return {
      specialWeapons: state,
      hero: context.hero,
      collectedPickup: null
    };
  }

  const safeDelta = Math.max(0, Number(deltaSeconds) || 0);
  const elapsedSeconds = Math.max(0, Number(context.elapsedSeconds) || 0);
  let nextState = decayPickups(state, safeDelta);
  nextState = spawnDuePickups(nextState, elapsedSeconds);

  const collected = collectNearbyPickup(nextState, context.hero);
  return {
    specialWeapons: collected.specialWeapons,
    hero: collected.hero,
    collectedPickup: collected.collectedPickup
  };
}

function spawnDuePickups(state, elapsedSeconds) {
  let changed = false;
  let nextDropIndex = state.nextDropIndex;
  let nextPickupId = state.nextPickupId;
  let activePickups = state.activePickups;

  while (
    nextDropIndex < ENERGY_BURST_DROP_TIMES_SECONDS.length &&
    elapsedSeconds >= ENERGY_BURST_DROP_TIMES_SECONDS[nextDropIndex]
  ) {
    const dropPoint = SPECIAL_WEAPON_DROP_POINTS[nextDropIndex % SPECIAL_WEAPON_DROP_POINTS.length];
    activePickups = [
      ...activePickups,
      {
        id: `energy_burst_pickup_${nextPickupId}`,
        type: ENERGY_BURST_RIFLE.id,
        position: dropPoint.position,
        dropPointId: dropPoint.id,
        ammo: ENERGY_BURST_RIFLE.ammo,
        remainingSeconds: SPECIAL_WEAPON_PICKUP_LIFETIME_SECONDS
      }
    ];
    nextDropIndex += 1;
    nextPickupId += 1;
    changed = true;
  }

  return changed
    ? {
        ...state,
        activePickups,
        nextDropIndex,
        nextPickupId
      }
    : state;
}

function decayPickups(state, deltaSeconds) {
  if (deltaSeconds === 0 || state.activePickups.length === 0) {
    return state;
  }

  let changed = false;
  const activePickups = [];
  for (const pickup of state.activePickups) {
    const remainingSeconds = Math.max(0, pickup.remainingSeconds - deltaSeconds);
    if (remainingSeconds !== pickup.remainingSeconds) {
      changed = true;
    }
    if (remainingSeconds > 0) {
      activePickups.push({
        ...pickup,
        remainingSeconds
      });
    } else {
      changed = true;
    }
  }

  return changed
    ? {
        ...state,
        activePickups
      }
    : state;
}

function collectNearbyPickup(state, hero) {
  if (!hero || hero.status !== HERO_STATUS.ALIVE || state.activePickups.length === 0) {
    return {
      specialWeapons: state,
      hero,
      collectedPickup: null
    };
  }

  const pickup = state.activePickups.find(
    (candidate) => distanceBetween(candidate.position, hero.position) <= SPECIAL_WEAPON_PICKUP_RADIUS
  );
  if (!pickup) {
    return {
      specialWeapons: state,
      hero,
      collectedPickup: null
    };
  }

  return {
    specialWeapons: {
      ...state,
      activePickups: state.activePickups.filter((candidate) => candidate.id !== pickup.id)
    },
    hero: equipEnergyBurstRifle(hero),
    collectedPickup: pickup
  };
}

export function areSpecialWeaponDropPointsWalkable() {
  return SPECIAL_WEAPON_DROP_POINTS.every((dropPoint) => isWalkableBody(dropPoint.position));
}
