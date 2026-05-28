import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  CHARACTER_MODEL_ACTIONS,
  CHARACTER_MODEL_ASSET_IDS,
  CHARACTER_MODEL_CLIPS,
  CHARACTER_MODEL_IDS,
  getCharacterModelClip,
  getCharacterModelSpec
} from "../src/game/characterModels.js";
import {
  getEnemyModelDescriptor,
  getCharacterModelYawRadians,
  getHeroModelDescriptor,
  getEnemyModelAction,
  getHeroModelAction,
  worldToViewportModelPoint
} from "../src/game/characterModelRuntime.js";
import { createEnemy, ENEMY_TYPES } from "../src/game/enemyBehavior.js";
import { HERO_STATUS } from "../src/game/heroCombat.js";

const GLB_JSON_CHUNK_TYPE = 0x4e4f534a;

const EXPECTED_GLB_FILES = Object.freeze({
  [CHARACTER_MODEL_IDS.HERO]: "assets/phase6/glb/hero.glb",
  [CHARACTER_MODEL_IDS.ALIEN_HUNTER]: "assets/phase6/glb/alien_hunter.glb",
  [CHARACTER_MODEL_IDS.HUNTER_EXOSUIT]: "assets/phase6/glb/hunter_exosuit.glb",
  [CHARACTER_MODEL_IDS.HEAVY_BRUTE]: "assets/phase6/glb/heavy_brute.glb",
  [CHARACTER_MODEL_IDS.BREAKER_BOT]: "assets/phase6/glb/breaker_bot.glb"
});

test("Phase 6 GLB character specs cover hero and all locked V1 enemy types", () => {
  assert.deepEqual(
    [...CHARACTER_MODEL_ASSET_IDS].sort(),
    [
      CHARACTER_MODEL_IDS.HERO,
      ENEMY_TYPES.ALIEN_HUNTER,
      ENEMY_TYPES.HUNTER_EXOSUIT,
      ENEMY_TYPES.HEAVY_BRUTE,
      ENEMY_TYPES.BREAKER_BOT
    ].sort()
  );

  assert.equal(getCharacterModelSpec(CHARACTER_MODEL_IDS.HERO).assetId, "hero");
  assert.equal(getCharacterModelSpec(ENEMY_TYPES.ALIEN_HUNTER).assetId, "alien_hunter");
  assert.equal(getCharacterModelSpec(ENEMY_TYPES.HUNTER_EXOSUIT).assetId, "hunter_exosuit");
  assert.equal(getCharacterModelSpec(ENEMY_TYPES.HEAVY_BRUTE).assetId, "heavy_brute");
  assert.equal(getCharacterModelSpec(ENEMY_TYPES.BREAKER_BOT).assetId, "breaker_bot");
});

test("Phase 6 GLB character clips map current Meshy animations to game actions", () => {
  assert.equal(getCharacterModelClip(CHARACTER_MODEL_ACTIONS.IDLE), "Idle_02");
  assert.equal(getCharacterModelClip(CHARACTER_MODEL_ACTIONS.WALK), "Walking");
  assert.equal(getCharacterModelClip(CHARACTER_MODEL_ACTIONS.RUN), "Running");
  assert.equal(getCharacterModelClip(CHARACTER_MODEL_ACTIONS.ATTACK), "Walk_Forward_While_Shooting");
  assert.equal(getCharacterModelClip(CHARACTER_MODEL_ACTIONS.DEATH), "Dead");
});

test("Phase 6 GLB runtime helpers select actions from current gameplay state", () => {
  assert.equal(
    getHeroModelAction({
      status: HERO_STATUS.ALIVE,
      attackAnimationRemainingSeconds: 0,
      isMoving: false
    }),
    CHARACTER_MODEL_ACTIONS.IDLE
  );
  assert.equal(
    getHeroModelAction({
      status: HERO_STATUS.ALIVE,
      attackAnimationRemainingSeconds: 0.2,
      isMoving: true
    }),
    CHARACTER_MODEL_ACTIONS.ATTACK
  );
  assert.equal(
    getHeroModelAction({
      status: HERO_STATUS.ALIVE,
      attackAnimationRemainingSeconds: 0,
      isMoving: true
    }),
    CHARACTER_MODEL_ACTIONS.RUN
  );
  assert.equal(
    getHeroModelAction({
      status: HERO_STATUS.DOWNED,
      attackAnimationRemainingSeconds: 0,
      isMoving: false
    }),
    CHARACTER_MODEL_ACTIONS.DEATH
  );
  assert.equal(
    getEnemyModelAction({ attackAnimationRemainingSeconds: 0 }),
    CHARACTER_MODEL_ACTIONS.RUN
  );
  assert.equal(
    getEnemyModelAction({ attackAnimationRemainingSeconds: 0.1 }),
    CHARACTER_MODEL_ACTIONS.ATTACK
  );
  assert.equal(
    getEnemyModelAction({ hp: 0, deathAnimationRemainingSeconds: 0.3 }),
    CHARACTER_MODEL_ACTIONS.DEATH
  );
});

test("Phase 6 GLB runtime helpers align world points to the image camera viewport", () => {
  assert.deepEqual(
    worldToViewportModelPoint(
      { x: 200, y: 120 },
      { scale: 2, offsetX: 50, offsetY: 30 }
    ),
    { x: 350, y: 210 }
  );
  assert.equal(getCharacterModelYawRadians({ x: 0, y: 1 }), 0);
  assert.equal(Math.round(getCharacterModelYawRadians({ x: 1, y: 0 }) * 1000), 1571);
});

test("Phase 6 GLB runtime helpers keep live 3D characters compact for lane movement", () => {
  const heroDescriptor = getHeroModelDescriptor({
    position: { x: 0, y: 0 },
    facingVector: { x: 0, y: 1 },
    status: HERO_STATUS.ALIVE,
    attackAnimationRemainingSeconds: 0,
    isMoving: false
  });
  assert.equal(heroDescriptor.targetHeight, 46);

  const enemySizes = [
    ENEMY_TYPES.ALIEN_HUNTER,
    ENEMY_TYPES.HUNTER_EXOSUIT,
    ENEMY_TYPES.HEAVY_BRUTE,
    ENEMY_TYPES.BREAKER_BOT
  ].map((enemyType) => getEnemyModelDescriptor(createEnemy(enemyType, { id: enemyType })).targetHeight);

  assert.deepEqual(
    enemySizes.map((size) => Math.round(size)),
    [35, 39, 47, 41]
  );
});

test("optimized Phase 6 character GLBs exist and stay Expo-safe for runtime loading", () => {
  for (const [characterId, glbPath] of Object.entries(EXPECTED_GLB_FILES)) {
    assert.ok(fs.existsSync(glbPath), `${glbPath} should exist`);

    const json = readGlbJson(glbPath);
    const animationNames = new Set((json.animations ?? []).map((animation) => animation.name));
    const expectedClips =
      characterId === CHARACTER_MODEL_IDS.HERO
        ? Object.values(CHARACTER_MODEL_CLIPS)
        : [
            CHARACTER_MODEL_CLIPS[CHARACTER_MODEL_ACTIONS.DEATH],
            CHARACTER_MODEL_CLIPS[CHARACTER_MODEL_ACTIONS.RUN],
            CHARACTER_MODEL_CLIPS[CHARACTER_MODEL_ACTIONS.ATTACK]
          ];

    for (const clipName of expectedClips) {
      assert.equal(
        animationNames.has(clipName),
        true,
        `${characterId} should include ${clipName}`
      );
    }

    assert.deepEqual(json.extensionsRequired ?? [], [], `${characterId} should not require GLB decoders`);
    assert.equal((json.textures ?? []).length, 0, `${characterId} should not load runtime textures`);
    assert.equal((json.images ?? []).length, 0, `${characterId} should not reference runtime images`);
    assert.ok(
      countColorAttributes(json) > 0,
      `${characterId} should bake natural texture colors into vertex colors`
    );
    assert.ok(fs.statSync(glbPath).size < 6 * 1024 * 1024, `${characterId} GLB should stay under 6 MB`);
  }
});

function countColorAttributes(json) {
  return (json.meshes ?? []).reduce(
    (count, mesh) =>
      count +
      (mesh.primitives ?? []).filter((primitive) => Boolean(primitive.attributes?.COLOR_0)).length,
    0
  );
}

function readGlbJson(glbPath) {
  const buffer = fs.readFileSync(path.resolve(glbPath));
  assert.equal(buffer.toString("utf8", 0, 4), "glTF", `${glbPath} should be a GLB`);

  let offset = 12;
  while (offset < buffer.length) {
    const chunkLength = buffer.readUInt32LE(offset);
    const chunkType = buffer.readUInt32LE(offset + 4);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;

    if (chunkType === GLB_JSON_CHUNK_TYPE) {
      return JSON.parse(buffer.toString("utf8", chunkStart, chunkEnd).trim());
    }

    offset = chunkEnd;
  }

  throw new Error(`No JSON chunk found in ${glbPath}`);
}
