import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

import {
  BASE_BUILDING_SOURCE_IMAGES,
  BASE_VISUAL_REFERENCE_ASSETS,
  BASE_VISUAL_SOURCE_FOLDER,
  getBaseVisualReferenceAsset,
  getBaseVisualSourcePath
} from "../src/base/baseVisualReferences.js";

const APP_ROOT = resolve(import.meta.dirname, "..");
const WORKSPACE_ROOT = resolve(APP_ROOT, "..");

test("base visual references map the actual Images folder files to canonical app assets", () => {
  assert.equal(BASE_VISUAL_SOURCE_FOLDER, "../images");
  assert.equal(BASE_VISUAL_REFERENCE_ASSETS.baseLayoutReference.sourceFile, "Land.png");
  assert.equal(BASE_VISUAL_REFERENCE_ASSETS.buildingSlotMap.sourceFile, "Layout.png");
  assert.equal(BASE_VISUAL_REFERENCE_ASSETS.buildingLevelExamples.sourceFile, "Buildings.png");
  assert.equal(BASE_VISUAL_REFERENCE_ASSETS.emptyLandBackground.sourceFile, "Empty Land.jpg");

  for (const reference of Object.values(BASE_VISUAL_REFERENCE_ASSETS)) {
    assert.equal(existsSync(resolve(APP_ROOT, reference.assetPath)), true, `${reference.assetPath} is missing`);
    assert.equal(existsSync(resolve(WORKSPACE_ROOT, "images", reference.sourceFile)), true, `${reference.sourceFile} is missing`);
    assert.ok(reference.width > 0);
    assert.ok(reference.height > 0);
  }
});

test("base visual source image inventory includes building and environment candidates", () => {
  assert.ok(BASE_BUILDING_SOURCE_IMAGES.includes("01_Central Tower.png"));
  assert.ok(BASE_BUILDING_SOURCE_IMAGES.includes("A_Build.png"));
  assert.ok(BASE_BUILDING_SOURCE_IMAGES.includes("sport.png"));
  assert.ok(BASE_BUILDING_SOURCE_IMAGES.includes("water.png"));
  assert.equal(BASE_BUILDING_SOURCE_IMAGES.length, 31);
});

test("visual reference helpers return stable source paths without changing product logic", () => {
  assert.deepEqual(
    getBaseVisualReferenceAsset("buildingSlotMap"),
    BASE_VISUAL_REFERENCE_ASSETS.buildingSlotMap
  );
  assert.equal(getBaseVisualReferenceAsset("unknown"), null);
  assert.equal(getBaseVisualSourcePath("Layout.png"), "../images/Layout.png");
});
