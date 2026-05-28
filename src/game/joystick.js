export const JOYSTICK_DEAD_ZONE = 0.1;
export const JOYSTICK_SMOOTHING = 0.45;

export function getJoystickRadius(layout, knobSize) {
  if (!layout || knobSize <= 0) {
    return 0;
  }

  const size = Math.min(layout.width, layout.height);
  return Math.max(0, (size - knobSize) / 2);
}

export function calculateJoystickInput(point, layout, options = {}) {
  const knobSize = options.knobSize ?? 54;
  const deadZone = clamp(options.deadZone ?? JOYSTICK_DEAD_ZONE, 0, 0.95);
  const radius = getJoystickRadius(layout, knobSize);

  if (!point || !layout || radius === 0) {
    return createNeutralInput(radius);
  }

  const centerX = layout.x + layout.width / 2;
  const centerY = layout.y + layout.height / 2;
  const rawX = point.pageX - centerX;
  const rawY = point.pageY - centerY;
  const distance = Math.sqrt(rawX * rawX + rawY * rawY);

  if (distance === 0 || distance / radius < deadZone) {
    return createNeutralInput(radius);
  }

  const clampedDistance = Math.min(distance, radius);
  const normalX = rawX / distance;
  const normalY = rawY / distance;
  const adjustedMagnitude = (Math.min(1, distance / radius) - deadZone) / (1 - deadZone);

  return {
    vector: {
      x: normalX * adjustedMagnitude,
      y: normalY * adjustedMagnitude
    },
    knobOffset: {
      x: normalX * clampedDistance,
      y: normalY * clampedDistance
    },
    radius
  };
}

export function isPointInsideJoystickControl(point, layout, options = {}) {
  if (!point || !layout) {
    return false;
  }

  const controlRadiusMultiplier = clamp(options.controlRadiusMultiplier ?? 1.65, 1, 4);
  const controlRadius = Math.min(layout.width, layout.height) * 0.5 * controlRadiusMultiplier;
  const centerX = layout.x + layout.width / 2;
  const centerY = layout.y + layout.height / 2;
  const deltaX = point.pageX - centerX;
  const deltaY = point.pageY - centerY;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= controlRadius;
}

export function isPointInsideCircleControl(point, layout, options = {}) {
  if (!point || !layout) {
    return false;
  }

  const radiusMultiplier = clamp(options.radiusMultiplier ?? 1, 0.25, 4);
  const radius = Math.min(layout.width, layout.height) * 0.5 * radiusMultiplier;
  const centerX = layout.x + layout.width / 2;
  const centerY = layout.y + layout.height / 2;
  const deltaX = point.pageX - centerX;
  const deltaY = point.pageY - centerY;

  return Math.sqrt(deltaX * deltaX + deltaY * deltaY) <= radius;
}

export function smoothJoystickVector(previous, next, amount = JOYSTICK_SMOOTHING) {
  const alpha = clamp(amount, 0, 1);
  const x = previous.x + (next.x - previous.x) * alpha;
  const y = previous.y + (next.y - previous.y) * alpha;

  if (Math.abs(x) < 0.001 && Math.abs(y) < 0.001) {
    return { x: 0, y: 0 };
  }

  return { x, y };
}

function createNeutralInput(radius) {
  return {
    vector: { x: 0, y: 0 },
    knobOffset: { x: 0, y: 0 },
    radius
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
