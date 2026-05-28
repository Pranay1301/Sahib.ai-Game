import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  MAP_ART_WALLS,
  MAP_CHARACTER_STAGING,
  MAP_PROP_PLACEMENTS,
  MAP_TREE_CLUSTERS,
  findAssetReference,
  getReferencedAssetPaths
} from "../src/game/mapArt.js";

const cwd = process.cwd();

test("map art references only existing selected asset files", () => {
  for (const assetPath of getReferencedAssetPaths()) {
    assert.equal(
      fs.existsSync(path.join(cwd, assetPath)),
      true,
      `${assetPath} should exist`
    );
  }
});

test("map art uses base walls, red tree clusters, sci-fi props, and enemy staging", () => {
  assert.ok(MAP_ART_WALLS.length >= 12);
  assert.ok(MAP_TREE_CLUSTERS.length >= 8);
  assert.ok(MAP_PROP_PLACEMENTS.length >= 8);
  assert.equal(MAP_CHARACTER_STAGING.length, 3);

  assert.ok(MAP_ART_WALLS.every((wall) => findAssetReference(wall.assetKey)));
  assert.ok(MAP_TREE_CLUSTERS.every((cluster) => findAssetReference(cluster.assetKey)));
  assert.ok(MAP_PROP_PLACEMENTS.every((prop) => findAssetReference(prop.assetKey)));
  assert.ok(MAP_CHARACTER_STAGING.every((stage) => findAssetReference(stage.assetKey)));
});

test("legacy 3D dressing remains available as inactive fallback metadata", () => {
  assert.ok(MAP_ART_WALLS.every((wall) => typeof wall.center.x === "number"));
  assert.ok(MAP_TREE_CLUSTERS.every((cluster) => typeof cluster.center.y === "number"));
  assert.ok(MAP_PROP_PLACEMENTS.every((prop) => typeof prop.rotation === "number"));
});
