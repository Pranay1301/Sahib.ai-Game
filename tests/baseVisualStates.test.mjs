import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_DEFINITIONS,
  BASE_BUILDING_IDS,
  BUILDING_STATES
} from "../src/base/baseConfig.js";
import {
  BASE_BUILDING_STATUS_VISUALS,
  BASE_BUILDING_VISUAL_ASSET_ROOT,
  BASE_BUILDING_VISUAL_LEVELS,
  BASE_BUILDING_VISUAL_STATE_COUNT,
  createBaseVisualStateCatalog,
  createBuildingVisualState,
  getBuildingVisualAssetKey,
  getBuildingVisualLevel,
  normalizeBuildingVisualLevel
} from "../src/base/baseVisualStates.js";

test("Phase 11 visual catalog exposes exactly 7 buildings times 6 levels", () => {
  const catalog = createBaseVisualStateCatalog();

  assert.equal(BASE_BUILDING_VISUAL_STATE_COUNT, 42);
  assert.equal(catalog.length, BASE_BUILDING_DEFINITIONS.length * BASE_BUILDING_VISUAL_LEVELS.length);
  assert.equal(catalog.length, 42);

  for (const definition of BASE_BUILDING_DEFINITIONS) {
    const states = catalog.filter((entry) => entry.buildingId === definition.id);
    assert.deepEqual(states.map((entry) => entry.level), [1, 2, 3, 4, 5, 6]);
    assert.equal(states.every((entry) => entry.slotId === definition.slotId), true);
  }
});

test("visual levels match the documented Level 1 through Level 6 progression", () => {
  assert.deepEqual(
    BASE_BUILDING_VISUAL_LEVELS.map((entry) => entry.visualStyle),
    [
      "Basic/newly built",
      "Cleaner/slightly upgraded",
      "Stronger/more detailed",
      "Premium",
      "Elite",
      "Signature high-status version"
    ]
  );
  assert.equal(getBuildingVisualLevel(4).key, "premium");
  assert.equal(getBuildingVisualLevel(6).key, "signature");
});

test("visual asset keys preserve the MD naming structure for placeholder art", () => {
  assert.equal(BASE_BUILDING_VISUAL_ASSET_ROOT, "/images/buildings");
  assert.equal(
    getBuildingVisualAssetKey(BASE_BUILDING_IDS.PALACE, 6),
    "/images/buildings/palace_level_6.png"
  );
  assert.equal(
    getBuildingVisualAssetKey(BASE_BUILDING_IDS.LEARNING_HALL, 1),
    "/images/buildings/learning_hall_level_1.png"
  );
  assert.equal(getBuildingVisualAssetKey("unknown_building", 1), null);
});

test("visual levels clamp to the documented min and max without creating extra states", () => {
  assert.equal(normalizeBuildingVisualLevel(-4), 1);
  assert.equal(normalizeBuildingVisualLevel(0), 1);
  assert.equal(normalizeBuildingVisualLevel(3.8), 3);
  assert.equal(normalizeBuildingVisualLevel(99), 6);
});

test("building visual states encode locked, upgrading, completed, and max-level ownership cues", () => {
  const locked = createBuildingVisualState({
    buildingId: BASE_BUILDING_IDS.ATTACK_TOWER,
    level: 1,
    state: BUILDING_STATES.LOCKED
  });
  const upgrading = createBuildingVisualState({
    buildingId: BASE_BUILDING_IDS.TREASURY,
    level: 3,
    state: BUILDING_STATES.UPGRADING
  });
  const completed = createBuildingVisualState({
    buildingId: BASE_BUILDING_IDS.WALL_GATE,
    level: 4,
    state: BUILDING_STATES.COMPLETED
  });
  const maxLevel = createBuildingVisualState({
    buildingId: BASE_BUILDING_IDS.PALACE,
    level: 6,
    state: BUILDING_STATES.MAX_LEVEL
  });

  assert.equal(locked.isLocked, true);
  assert.equal(locked.isDimmed, true);
  assert.equal(locked.tapCue, "unlock_requirement");

  assert.equal(upgrading.glow, "construction");
  assert.equal(upgrading.isUpgrading, true);
  assert.equal(upgrading.tapCue, "timer");

  assert.equal(completed.glow, "ready");
  assert.equal(completed.isCompleted, true);
  assert.equal(completed.isPremiumVisual, true);

  assert.equal(maxLevel.glow, "premium");
  assert.equal(maxLevel.isMaxLevel, true);
  assert.equal(maxLevel.isSignatureVisual, true);
  assert.equal(maxLevel.usesPlaceholderAsset, true);
});

test("Learning Hall visual state is marked as the skill progress anchor", () => {
  const learningHall = createBuildingVisualState({
    buildingId: BASE_BUILDING_IDS.LEARNING_HALL,
    level: 2,
    state: BUILDING_STATES.AVAILABLE
  });
  const palace = createBuildingVisualState({
    buildingId: BASE_BUILDING_IDS.PALACE,
    level: 2,
    state: BUILDING_STATES.AVAILABLE
  });

  assert.equal(learningHall.isSkillProgressAnchor, true);
  assert.equal(palace.isSkillProgressAnchor, false);
  assert.equal(BASE_BUILDING_STATUS_VISUALS[BUILDING_STATES.QUIZ_REQUIRED].tapCue, "skill_challenge");
});

test("unknown visual inputs fall back without inventing buildings or states", () => {
  assert.equal(createBuildingVisualState({ buildingId: "innovation_hub" }), null);

  const fallback = createBuildingVisualState({
    buildingId: BASE_BUILDING_IDS.TROPHY_HALL,
    level: 2,
    state: "unknown_state"
  });

  assert.equal(fallback.state, BUILDING_STATES.AVAILABLE);
  assert.equal(fallback.statusKey, "upgrade_cta");
});
