import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { PNG } from "pngjs";

import {
  WALL_SPRITE_CELL_SIZE,
  WALL_SPRITE_FRAME_COUNT,
  WALL_SYSTEM_CONFIG,
  WALL_TOOL_CONFIGS,
  WALL_TOOL_TYPES,
  applyWallDamageEvents,
  createWallSystemState,
  doesSegmentHitWall,
  getFreePlacementPreview,
  getWallHitAtPoint,
  isPointBlockedByWalls,
  placeSelectedWallTool,
  placeWallToolAtPosition,
  placeWallToolAtSocket,
  tickWallSystem
} from "../src/game/wallSystem.js";

const WALL_ASSETS = [
  "assets/phase9/runtime/block_wall_runtime.png"
];

test("Phase 9 wall system keeps Block Wall as the only active tactical tool", () => {
  assert.deepEqual(Object.keys(WALL_TOOL_CONFIGS), [
    WALL_TOOL_TYPES.BLOCK
  ]);
  assert.equal(WALL_TOOL_CONFIGS[WALL_TOOL_TYPES.BLOCK].maxHp, 180);
  assert.equal(WALL_TOOL_CONFIGS[WALL_TOOL_TYPES.BLOCK].renderWidth, 58);
  assert.equal(WALL_TOOL_CONFIGS[WALL_TOOL_TYPES.BLOCK].renderHeight, 32);
  assert.equal(WALL_SYSTEM_CONFIG.placementPreviewRadius, 260);
  assert.equal(WALL_SYSTEM_CONFIG.maxCharges, 3);
  assert.equal(WALL_SYSTEM_CONFIG.chargeRefillSeconds, 10);
});

test("wall placement is freeform within hero range, spends charges, and rejects overlaps", () => {
  const state = createWallSystemState({
    selectedTool: WALL_TOOL_TYPES.BLOCK
  });
  const placed = placeSelectedWallTool(state, { x: 615, y: 610 }, {
    heroPosition: { x: 560, y: 610 },
    enemies: []
  });

  assert.equal(placed.placed, true);
  assert.equal(placed.wallSystem.activeWalls.length, 1);
  assert.equal(placed.wallSystem.activeWalls[0].socketId, null);
  assert.deepEqual(placed.wallSystem.activeWalls[0].position, { x: 615, y: 610 });
  assert.equal(placed.wallSystem.charges, 2);
  assert.equal(placed.wallSystem.refillRemainingSeconds, WALL_SYSTEM_CONFIG.chargeRefillSeconds);

  const secondPlacement = placeWallToolAtPosition(
    placed.wallSystem,
    WALL_TOOL_TYPES.BLOCK,
    { x: 615, y: 610 },
    { heroPosition: { x: 560, y: 610 }, enemies: [] }
  );

  assert.equal(secondPlacement.placed, false);
  assert.equal(secondPlacement.reason, "wall_overlap");
});

test("wall charges refill on the wall system timer", () => {
  const placed = placeWallToolAtSocket(
    createWallSystemState({ selectedTool: WALL_TOOL_TYPES.BLOCK }),
    WALL_TOOL_TYPES.BLOCK,
    "center_north_cover",
    { heroPosition: { x: 800, y: 390 }, enemies: [] }
  );

  assert.equal(placed.placed, true);
  assert.equal(placed.wallSystem.charges, 2);
  assert.equal(placed.wallSystem.activeWalls.length, 1);

  const afterRefill = tickWallSystem(placed.wallSystem, WALL_SYSTEM_CONFIG.chargeRefillSeconds);
  assert.equal(afterRefill.charges, 3);
  assert.equal(afterRefill.activeWalls.length, 1);
});

test("block walls block bodies and projectile line segments", () => {
  const block = placeWallToolAtSocket(
    createWallSystemState(),
    WALL_TOOL_TYPES.BLOCK,
    "player_mid_defense",
    { heroPosition: { x: 560, y: 610 }, enemies: [] }
  ).wallSystem.activeWalls[0];

  assert.equal(isPointBlockedByWalls(block.position, [block], 10), true);
  assert.equal(Boolean(getWallHitAtPoint(block.position, [block], 5)), true);
  assert.equal(Boolean(doesSegmentHitWall({ x: 540, y: 610 }, { x: 690, y: 610 }, [block], 5)), true);
});

test("walls take damage and are destroyed when HP reaches zero", () => {
  const placed = placeWallToolAtSocket(
    createWallSystemState(),
    WALL_TOOL_TYPES.BLOCK,
    "player_mid_defense",
    { heroPosition: { x: 560, y: 610 }, enemies: [] }
  );
  const wallId = placed.wallSystem.activeWalls[0].id;
  const damaged = applyWallDamageEvents(placed.wallSystem, [
    { wallId, amount: 60 }
  ]);

  assert.equal(damaged.activeWalls[0].hp, WALL_TOOL_CONFIGS[WALL_TOOL_TYPES.BLOCK].maxHp - 60);

  const destroyed = applyWallDamageEvents(damaged, [
    { wallId, amount: 999 }
  ]);
  assert.equal(destroyed.activeWalls.length, 0);
});

test("free placement preview marks valid and invalid battlefield positions", () => {
  const state = createWallSystemState({
    selectedTool: WALL_TOOL_TYPES.BLOCK
  });
  const valid = getFreePlacementPreview(state, { x: 615, y: 610 }, {
    heroPosition: { x: 560, y: 610 },
    enemies: []
  });
  const tooFar = getFreePlacementPreview(state, { x: 900, y: 610 }, {
    heroPosition: { x: 560, y: 610 },
    enemies: []
  });

  assert.equal(valid.valid, true);
  assert.equal(tooFar.valid, false);
  assert.equal(tooFar.reason, "too_far");
});

test("Phase 9 generated wall sprite sheets have four transparent frames", () => {
  for (const spritePath of WALL_ASSETS) {
    const image = PNG.sync.read(fs.readFileSync(spritePath));
    assert.equal(image.width, WALL_SPRITE_CELL_SIZE * WALL_SPRITE_FRAME_COUNT, `${spritePath} width`);
    assert.equal(image.height, WALL_SPRITE_CELL_SIZE, `${spritePath} height`);
    assert.equal(image.data[3], 0, `${spritePath} should have transparent corner`);
  }
});
