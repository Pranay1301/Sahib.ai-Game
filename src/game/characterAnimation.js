export const DIRECTION_COUNT = 8;
export const WALK_FRAME_COUNT = 6;
export const ATTACK_FRAME_COUNT = 4;
export const CHARACTER_SPRITE_CELL_SIZE = 128;
export const WALK_FRAME_SECONDS = 0.12;
export const ATTACK_FRAME_SECONDS = 0.08;
export const HERO_ATTACK_ANIMATION_SECONDS = ATTACK_FRAME_COUNT * ATTACK_FRAME_SECONDS;
export const ENEMY_ATTACK_ANIMATION_SECONDS = ATTACK_FRAME_COUNT * ATTACK_FRAME_SECONDS;
export const ENEMY_DEATH_VISUAL_SECONDS = 0.55;

export const DIRECTION_ROWS = Object.freeze([
  Object.freeze({ id: "down", x: 0, y: 1 }),
  Object.freeze({ id: "down_right", x: Math.SQRT1_2, y: Math.SQRT1_2 }),
  Object.freeze({ id: "right", x: 1, y: 0 }),
  Object.freeze({ id: "up_right", x: Math.SQRT1_2, y: -Math.SQRT1_2 }),
  Object.freeze({ id: "up", x: 0, y: -1 }),
  Object.freeze({ id: "up_left", x: -Math.SQRT1_2, y: -Math.SQRT1_2 }),
  Object.freeze({ id: "left", x: -1, y: 0 }),
  Object.freeze({ id: "down_left", x: -Math.SQRT1_2, y: Math.SQRT1_2 })
]);

export function getDirectionIndexFromVector(vector, fallbackIndex = 2) {
  const x = vector?.x ?? 0;
  const y = vector?.y ?? 0;
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) {
    return clampDirectionIndex(fallbackIndex);
  }

  const normalized = {
    x: x / length,
    y: y / length
  };
  let bestIndex = 0;
  let bestDot = -Infinity;

  for (let index = 0; index < DIRECTION_ROWS.length; index += 1) {
    const direction = DIRECTION_ROWS[index];
    const dot = normalized.x * direction.x + normalized.y * direction.y;
    if (dot > bestDot) {
      bestDot = dot;
      bestIndex = index;
    }
  }

  return bestIndex;
}

export function getLoopFrameIndex(elapsedSeconds, frameCount, frameSeconds) {
  const safeFrameCount = Math.max(1, Math.floor(frameCount));
  const safeFrameSeconds = Math.max(0.001, frameSeconds);
  return Math.max(0, Math.floor(Math.max(0, elapsedSeconds) / safeFrameSeconds) % safeFrameCount);
}

export function getOneShotFrameIndex(remainingSeconds, totalSeconds, frameCount) {
  const safeFrameCount = Math.max(1, Math.floor(frameCount));
  const elapsedSeconds = Math.max(0, totalSeconds - Math.max(0, remainingSeconds));
  const progress = Math.min(0.999, elapsedSeconds / Math.max(0.001, totalSeconds));
  return Math.min(safeFrameCount - 1, Math.floor(progress * safeFrameCount));
}

function clampDirectionIndex(index) {
  if (!Number.isFinite(index)) {
    return 2;
  }

  return Math.max(0, Math.min(DIRECTION_COUNT - 1, Math.round(index)));
}
