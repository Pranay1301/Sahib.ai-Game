import { WORLD_BOUNDS } from "./mapLayout.js";

export const FIXED_ISOMETRIC_CAMERA = Object.freeze({
  mode: "fixed_landscape_isometric",
  manualZoomEnabled: false,
  manualRotationEnabled: false,
  viewportWorldWidth: 760,
  viewportWorldHeight: 430,
  threeUnitScale: 0.025,
  threeCameraHeight: 10.5,
  threeCameraDistance: 15.5,
  fullMapMargin: 1.1,
  fullMapYawDegrees: 40,
  fullMapElevationDegrees: 58,
  fullMapCameraDistance: 24
});

export function getFixedFollowCamera(position, viewport = FIXED_ISOMETRIC_CAMERA) {
  return {
    x: clamp(
      position.x - viewport.viewportWorldWidth / 2,
      0,
      WORLD_BOUNDS.width - viewport.viewportWorldWidth
    ),
    y: clamp(
      position.y - viewport.viewportWorldHeight / 2,
      0,
      WORLD_BOUNDS.height - viewport.viewportWorldHeight
    )
  };
}

export function worldToScreen(position, camera, scale) {
  return {
    x: (position.x - camera.x) * scale,
    y: (position.y - camera.y) * scale
  };
}

export function worldToThreePosition(position, height = 0) {
  return {
    x: (position.x - WORLD_BOUNDS.width / 2) * FIXED_ISOMETRIC_CAMERA.threeUnitScale,
    y: height,
    z: (position.y - WORLD_BOUNDS.height / 2) * FIXED_ISOMETRIC_CAMERA.threeUnitScale
  };
}

export function getThreeIsometricCameraPosition(focusPosition) {
  const focus = worldToThreePosition(focusPosition);
  return {
    x: focus.x - FIXED_ISOMETRIC_CAMERA.threeCameraDistance,
    y: FIXED_ISOMETRIC_CAMERA.threeCameraHeight,
    z: focus.z + FIXED_ISOMETRIC_CAMERA.threeCameraDistance
  };
}

export function getFullMapOrthographicBounds(aspect) {
  const safeAspect = Math.max(1, aspect || 1);
  const halfWorldWidth =
    (WORLD_BOUNDS.width * FIXED_ISOMETRIC_CAMERA.threeUnitScale) / 2 +
    FIXED_ISOMETRIC_CAMERA.fullMapMargin;
  const halfWorldDepth =
    (WORLD_BOUNDS.height * FIXED_ISOMETRIC_CAMERA.threeUnitScale) / 2 +
    FIXED_ISOMETRIC_CAMERA.fullMapMargin;
  const halfHeight = Math.max(halfWorldDepth, halfWorldWidth / safeAspect);
  const halfWidth = halfHeight * safeAspect;

  return {
    left: -halfWidth,
    right: halfWidth,
    top: halfHeight,
    bottom: -halfHeight
  };
}

export function getFullMapCameraPosition() {
  const yaw = degreesToRadians(FIXED_ISOMETRIC_CAMERA.fullMapYawDegrees);
  const elevation = degreesToRadians(FIXED_ISOMETRIC_CAMERA.fullMapElevationDegrees);
  const distance = FIXED_ISOMETRIC_CAMERA.fullMapCameraDistance;
  const horizontalDistance = Math.cos(elevation) * distance;

  return {
    x: -Math.sin(yaw) * horizontalDistance,
    y: Math.sin(elevation) * distance,
    z: Math.cos(yaw) * horizontalDistance
  };
}

export function getFullMapCameraUp() {
  const position = getFullMapCameraPosition();
  const target = getFullMapCameraTarget();
  const cameraBack = normalize3({
    x: position.x - target.x,
    y: position.y - target.y,
    z: position.z - target.z
  });
  const worldRight = { x: 1, y: 0, z: 0 };
  const rightDotBack = dot3(worldRight, cameraBack);
  const screenRight = normalize3({
    x: worldRight.x - rightDotBack * cameraBack.x,
    y: worldRight.y - rightDotBack * cameraBack.y,
    z: worldRight.z - rightDotBack * cameraBack.z
  });

  return normalize3(cross3(cameraBack, screenRight));
}

export function getFullMapCameraTarget() {
  return {
    x: 0,
    y: 0,
    z: 0
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function degreesToRadians(value) {
  return (value * Math.PI) / 180;
}

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
