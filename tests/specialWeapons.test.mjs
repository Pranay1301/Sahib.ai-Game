import assert from "node:assert/strict";
import test from "node:test";

import {
  ENERGY_BURST_RIFLE,
  RIFLE,
  WEAPON_IDS,
  createHeroCombatState,
  fireRifleBurst
} from "../src/game/heroCombat.js";
import {
  ENERGY_BURST_DROP_TIMES_SECONDS,
  SPECIAL_WEAPON_DROP_POINTS,
  SPECIAL_WEAPON_PICKUP_LIFETIME_SECONDS,
  areSpecialWeaponDropPointsWalkable,
  createSpecialWeaponDropState,
  tickSpecialWeaponDrops
} from "../src/game/specialWeapons.js";

test("Energy Burst Rifle drop points are not beside either Core and stay walkable", () => {
  assert.equal(areSpecialWeaponDropPointsWalkable(), true);
  assert.equal(SPECIAL_WEAPON_DROP_POINTS.length, ENERGY_BURST_DROP_TIMES_SECONDS.length);
});

test("special weapon pickup appears at the first timed drop", () => {
  const beforeDrop = tickSpecialWeaponDrops(createSpecialWeaponDropState(), 0, {
    elapsedSeconds: ENERGY_BURST_DROP_TIMES_SECONDS[0] - 0.01,
    hero: farHero()
  });
  const atDrop = tickSpecialWeaponDrops(beforeDrop.specialWeapons, 0, {
    elapsedSeconds: ENERGY_BURST_DROP_TIMES_SECONDS[0],
    hero: farHero()
  });

  assert.equal(beforeDrop.specialWeapons.activePickups.length, 0);
  assert.equal(atDrop.specialWeapons.activePickups.length, 1);
  assert.equal(atDrop.specialWeapons.activePickups[0].type, ENERGY_BURST_RIFLE.id);
  assert.equal(atDrop.specialWeapons.activePickups[0].ammo, ENERGY_BURST_RIFLE.ammo);
});

test("hero auto-collects nearby Energy Burst Rifle pickup", () => {
  const hero = createHeroCombatState({
    position: SPECIAL_WEAPON_DROP_POINTS[0].position
  });
  const tick = tickSpecialWeaponDrops(createSpecialWeaponDropState(), 0, {
    elapsedSeconds: ENERGY_BURST_DROP_TIMES_SECONDS[0],
    hero
  });

  assert.equal(tick.specialWeapons.activePickups.length, 0);
  assert.equal(tick.hero.activeWeaponId, WEAPON_IDS.ENERGY_BURST_RIFLE);
  assert.equal(tick.hero.energyBurstAmmo, ENERGY_BURST_RIFLE.ammo);
  assert.equal(tick.collectedPickup.type, ENERGY_BURST_RIFLE.id);
});

test("uncollected special weapon pickup expires after its lifetime", () => {
  const spawned = tickSpecialWeaponDrops(createSpecialWeaponDropState(), 0, {
    elapsedSeconds: ENERGY_BURST_DROP_TIMES_SECONDS[0],
    hero: farHero()
  });
  const expired = tickSpecialWeaponDrops(
    spawned.specialWeapons,
    SPECIAL_WEAPON_PICKUP_LIFETIME_SECONDS + 0.1,
    {
      elapsedSeconds: ENERGY_BURST_DROP_TIMES_SECONDS[0] + SPECIAL_WEAPON_PICKUP_LIFETIME_SECONDS + 0.1,
      hero: farHero()
    }
  );

  assert.equal(spawned.specialWeapons.activePickups.length, 1);
  assert.equal(expired.specialWeapons.activePickups.length, 0);
});

test("Energy Burst Rifle fires stronger limited-ammo projectiles without using rifle magazine", () => {
  const hero = createHeroCombatState({
    activeWeaponId: WEAPON_IDS.ENERGY_BURST_RIFLE,
    energyBurstAmmo: ENERGY_BURST_RIFLE.ammo
  });
  const fired = fireRifleBurst(hero);

  assert.equal(fired.shotsFired, 1);
  assert.equal(fired.hero.energyBurstAmmo, ENERGY_BURST_RIFLE.ammo - 1);
  assert.equal(fired.hero.magazineAmmo, RIFLE.magazineSize);
  assert.equal(fired.projectileSpawns[0].damageToEnemy, ENERGY_BURST_RIFLE.damageToEnemy);
  assert.equal(fired.projectileSpawns[0].damageToEnemyCore, ENERGY_BURST_RIFLE.damageToEnemyCore);
  assert.equal(fired.projectileSpawns[0].weaponId, WEAPON_IDS.ENERGY_BURST_RIFLE);
});

test("Energy Burst Rifle returns to default rifle after 12 shots", () => {
  let hero = createHeroCombatState({
    activeWeaponId: WEAPON_IDS.ENERGY_BURST_RIFLE,
    energyBurstAmmo: ENERGY_BURST_RIFLE.ammo
  });

  for (let shotIndex = 0; shotIndex < ENERGY_BURST_RIFLE.ammo; shotIndex += 1) {
    const fired = fireRifleBurst({
      ...hero,
      fireCooldownSeconds: 0
    });
    hero = fired.hero;
  }

  assert.equal(hero.activeWeaponId, WEAPON_IDS.RIFLE);
  assert.equal(hero.energyBurstAmmo, 0);
  assert.equal(hero.isReloading, false);
});

function farHero() {
  return createHeroCombatState({
    position: {
      x: 610,
      y: 710
    }
  });
}
