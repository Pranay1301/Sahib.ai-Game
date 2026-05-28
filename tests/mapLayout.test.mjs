import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { PNG } from "pngjs";

import {
  CENTER_DOORS,
  CENTER_ZONE,
  CORE_ACCESS_POINTS,
  ENEMY_CORE_POSITION,
  HERO_START_POSITION,
  INTERSECTION_TRIGGER_RADIUS,
  MAJOR_INTERSECTIONS,
  MAP_DOORS,
  MAP_LANES,
  SIDE_ROUTES,
  PLAYER_CORE_ATTACK_POSITION,
  PLAYER_CORE_POSITION,
  WORLD_BOUNDS,
  isWalkableBody,
  isWalkablePoint
} from "../src/game/mapLayout.js";

test("generated walkmask world matches the active map canvas", () => {
  const map = PNG.sync.read(fs.readFileSync("map.png"));

  assert.deepEqual(WORLD_BOUNDS, { width: map.width, height: map.height });
});

test("map blockout has three lanes, side routes, four major intersections, and a center zone", () => {
  assert.equal(MAP_LANES.length, 3);
  assert.deepEqual(
    MAP_LANES.map((lane) => lane.id),
    ["top_lane", "mid_lane", "bottom_lane"]
  );
  assert.equal(SIDE_ROUTES.length, 4);
  assert.equal(MAJOR_INTERSECTIONS.length, 4);
  assert.equal(CENTER_ZONE.id, "center_drop_zone");
});

test("each major intersection supports three mechanical door slots", () => {
  for (const intersection of MAJOR_INTERSECTIONS) {
    assert.equal(intersection.triggerRadius, INTERSECTION_TRIGGER_RADIUS);
    assert.equal(intersection.doors.length, 3);
    assert.deepEqual(
      intersection.doors.map((door) => door.role),
      ["front", "side", "rear_diagonal"]
    );
  }

  assert.equal(MAP_DOORS.length, 12);
  assert.equal(CENTER_DOORS.length, 3);
});

test("door slots attach to perimeter instead of blocking walkable exits", () => {
  for (const intersection of MAJOR_INTERSECTIONS) {
    for (const exit of intersection.exits) {
      assert.equal(isWalkableBody(exit.point), true, `${exit.id} should stay open`);
    }

    for (const door of intersection.doors) {
      assert.equal(Number.isFinite(door.center.x), true, `${door.id} needs a valid x position`);
      assert.equal(Number.isFinite(door.center.y), true, `${door.id} needs a valid y position`);
      assert.equal(door.width > 0, true, `${door.id} needs a visible width`);
      assert.equal(door.height > 0, true, `${door.id} needs a visible height`);
    }
  }

  for (const door of CENTER_DOORS) {
    assert.equal(Number.isFinite(door.center.x), true, `${door.id} needs a valid x position`);
    assert.equal(Number.isFinite(door.center.y), true, `${door.id} needs a valid y position`);
  }
});

test("core-to-core routes pass through intended danger spaces without side bypass", () => {
  assert.equal(Number.isFinite(PLAYER_CORE_POSITION.x), true);
  assert.equal(Number.isFinite(ENEMY_CORE_POSITION.x), true);
  assert.equal(isWalkableBody(PLAYER_CORE_ATTACK_POSITION), true);
  assert.equal(isWalkablePoint(CENTER_ZONE.center), true);
  assert.equal(isWalkableBody(HERO_START_POSITION), true);
  assert.equal(isWalkableBody(CENTER_ZONE.center), true);

  for (const intersection of MAJOR_INTERSECTIONS) {
    assert.equal(isWalkableBody(intersection.center), true, `${intersection.id} should be playable`);
  }

  assert.equal(isWalkablePoint({ x: 100, y: 100 }), false);
  assert.equal(isWalkablePoint({ x: 838, y: 350 }), false);
  assert.equal(isWalkablePoint({ x: 760, y: 470 }), false);
});

test("both core areas are accessible from top, mid, and bottom approaches", () => {
  const playerAccess = CORE_ACCESS_POINTS.filter((access) => access.coreId === "player");
  const enemyAccess = CORE_ACCESS_POINTS.filter((access) => access.coreId === "enemy");

  assert.equal(playerAccess.length, 3);
  assert.equal(enemyAccess.length, 3);

  for (const access of CORE_ACCESS_POINTS) {
    assert.equal(isWalkableBody(access.point), true, `${access.id} should be walkable`);
  }
});

test("image-backed map collision blocks visual walls and tree pockets", () => {
  assert.equal(isWalkableBody({ x: 1000, y: 600 }), false);
  assert.equal(isWalkableBody({ x: 838, y: 350 }), false);
  assert.equal(isWalkableBody({ x: 760, y: 470 }), false);
  assert.equal(isWalkableBody({ x: 570, y: 420 }), true);
  assert.equal(isWalkableBody({ x: 764, y: 326 }), true);
  assert.equal(isWalkableBody({ x: 1166, y: 444 }), true);
});

test("stair bridge crossings stay walkable on the final mask", () => {
  assert.equal(isWalkableBody({ x: 624, y: 605 }), true);
  assert.equal(isWalkableBody({ x: 1118, y: 266 }), true);
});
