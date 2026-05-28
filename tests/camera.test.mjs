import assert from "node:assert/strict";
import test from "node:test";

import {
  FIXED_ISOMETRIC_CAMERA,
  getFixedFollowCamera,
  getFullMapCameraUp,
  getFullMapCameraPosition,
  getFullMapCameraTarget,
  getFullMapOrthographicBounds,
  getThreeIsometricCameraPosition,
  worldToThreePosition
} from "../src/game/camera.js";
import { IMAGE_BATTLEFIELD_CAMERA, getImageBattlefieldCamera } from "../src/game/imageCamera.js";
import { WORLD_BOUNDS } from "../src/game/mapLayout.js";

test("camera is fixed isometric without manual zoom or rotation", () => {
  assert.equal(FIXED_ISOMETRIC_CAMERA.mode, "fixed_landscape_isometric");
  assert.equal(FIXED_ISOMETRIC_CAMERA.manualZoomEnabled, false);
  assert.equal(FIXED_ISOMETRIC_CAMERA.manualRotationEnabled, false);
});

test("follow camera clamps to world bounds", () => {
  const leftTop = getFixedFollowCamera({ x: 10, y: 10 });
  const rightBottom = getFixedFollowCamera({
    x: WORLD_BOUNDS.width + 200,
    y: WORLD_BOUNDS.height + 200
  });

  assert.deepEqual(leftTop, { x: 0, y: 0 });
  assert.deepEqual(rightBottom, {
    x: WORLD_BOUNDS.width - FIXED_ISOMETRIC_CAMERA.viewportWorldWidth,
    y: WORLD_BOUNDS.height - FIXED_ISOMETRIC_CAMERA.viewportWorldHeight
  });
});

test("three camera position follows hero from a fixed isometric offset", () => {
  const focus = { x: 600, y: 310 };
  const focus3d = worldToThreePosition(focus);
  const camera = getThreeIsometricCameraPosition(focus);

  assert.equal(camera.x, focus3d.x - FIXED_ISOMETRIC_CAMERA.threeCameraDistance);
  assert.equal(camera.y, FIXED_ISOMETRIC_CAMERA.threeCameraHeight);
  assert.equal(camera.z, focus3d.z + FIXED_ISOMETRIC_CAMERA.threeCameraDistance);
});

test("full map orthographic bounds frame the whole landscape map", () => {
  const aspect = 16 / 9;
  const bounds = getFullMapOrthographicBounds(aspect);
  const halfWorldWidth =
    (WORLD_BOUNDS.width * FIXED_ISOMETRIC_CAMERA.threeUnitScale) / 2;
  const halfWorldDepth =
    (WORLD_BOUNDS.height * FIXED_ISOMETRIC_CAMERA.threeUnitScale) / 2;

  assert.ok(bounds.left < 0);
  assert.ok(bounds.right > 0);
  assert.ok(bounds.top > 0);
  assert.ok(bounds.bottom < 0);
  assert.ok(bounds.right >= halfWorldWidth);
  assert.ok(bounds.top >= halfWorldDepth);
});

test("full map camera remains fixed in a full-map isometric overview", () => {
  const camera = getFullMapCameraPosition();
  const target = getFullMapCameraTarget();
  const horizontalDistance = Math.hypot(camera.x, camera.z);
  const yawDegrees = Math.round((Math.atan2(Math.abs(camera.x), camera.z) * 180) / Math.PI);
  const elevationDegrees = Math.round((Math.atan2(camera.y, horizontalDistance) * 180) / Math.PI);

  assert.equal(yawDegrees, FIXED_ISOMETRIC_CAMERA.fullMapYawDegrees);
  assert.equal(elevationDegrees, FIXED_ISOMETRIC_CAMERA.fullMapElevationDegrees);
  assert.equal(Math.round(Math.hypot(camera.x, camera.y, camera.z)), FIXED_ISOMETRIC_CAMERA.fullMapCameraDistance);
  assert.ok(camera.x < 0);
  assert.ok(camera.z > 0);
  assert.equal(target.x, 0);
  assert.equal(target.y, 0);
  assert.equal(target.z, 0);
});

test("full map camera keeps the core-to-core axis level on screen", () => {
  const camera = getFullMapCameraPosition();
  const target = getFullMapCameraTarget();
  const up = getFullMapCameraUp();
  const cameraBack = normalize3({
    x: camera.x - target.x,
    y: camera.y - target.y,
    z: camera.z - target.z
  });
  const cameraRight = normalize3(cross3(up, cameraBack));
  const cameraScreenUp = normalize3(cross3(cameraBack, cameraRight));
  const worldCoreAxis = { x: 1, y: 0, z: 0 };

  assert.ok(Math.abs(dot3(worldCoreAxis, cameraScreenUp)) < 1e-10);
});

test("image battlefield camera zooms and follows hero inside clamped map bounds", () => {
  const viewport = { width: 1000, height: 500 };
  const camera = getImageBattlefieldCamera(
    { x: WORLD_BOUNDS.width / 2, y: WORLD_BOUNDS.height / 2 },
    viewport,
    WORLD_BOUNDS
  );
  const farCorner = getImageBattlefieldCamera(
    { x: WORLD_BOUNDS.width, y: WORLD_BOUNDS.height },
    viewport,
    WORLD_BOUNDS
  );

  assert.equal(camera.zoom, IMAGE_BATTLEFIELD_CAMERA.zoom);
  assert.equal(IMAGE_BATTLEFIELD_CAMERA.zoom, 4);
  assert.ok(camera.scale > 0);
  assert.ok(camera.layerWidth >= viewport.width);
  assert.ok(camera.layerHeight >= viewport.height);
  assert.ok(
    Math.abs(camera.layerWidth / camera.layerHeight - WORLD_BOUNDS.width / WORLD_BOUNDS.height) <
      0.000001
  );
  assert.ok(camera.offsetX > 0);
  assert.ok(camera.offsetY > 0);
  assert.equal(farCorner.offsetX, farCorner.layerWidth - viewport.width);
  assert.equal(farCorner.offsetY, farCorner.layerHeight - viewport.height);
});

function normalize3(vector) {
  const length = Math.hypot(vector.x, vector.y, vector.z) || 1;
  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

function dot3(a, b) {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function cross3(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}
