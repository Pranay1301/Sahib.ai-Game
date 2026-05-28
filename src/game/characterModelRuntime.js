import { HERO_STATUS } from "./heroCombat.js";
import {
  CHARACTER_MODEL_ACTIONS,
  CHARACTER_MODEL_IDS,
  getCharacterModelSpec
} from "./characterModels.js";
import { getEnemyStats } from "./enemyBehavior.js";

export const HERO_MODEL_TARGET_HEIGHT = 46;
export const ENEMY_MODEL_MIN_TARGET_HEIGHT = 34;
export const ENEMY_MODEL_HEIGHT_MULTIPLIER = 0.98;

export function getHeroModelDescriptor(hero) {
  const spec = getCharacterModelSpec(CHARACTER_MODEL_IDS.HERO);
  return {
    id: CHARACTER_MODEL_IDS.HERO,
    assetId: spec.assetId,
    label: spec.label,
    position: hero.position,
    facingVector: hero.facingVector,
    action: getHeroModelAction(hero),
    targetHeight: HERO_MODEL_TARGET_HEIGHT
  };
}

export function getEnemyModelDescriptor(enemy) {
  if (!enemy || (enemy.hp <= 0 && (enemy.deathAnimationRemainingSeconds ?? 0) <= 0)) {
    return null;
  }

  const spec = getCharacterModelSpec(enemy.type);
  const stats = getEnemyStats(enemy.type);
  return {
    id: enemy.id,
    assetId: spec.assetId,
    label: spec.label,
    position: enemy.position,
    facingVector: enemy.facingVector,
    action: getEnemyModelAction(enemy),
    targetHeight: Math.max(ENEMY_MODEL_MIN_TARGET_HEIGHT, stats.renderSize * ENEMY_MODEL_HEIGHT_MULTIPLIER)
  };
}

export function getCharacterModelDescriptors(hero, enemies = []) {
  return [
    getHeroModelDescriptor(hero),
    ...enemies.map(getEnemyModelDescriptor).filter(Boolean)
  ];
}

export function getHeroModelAction(hero) {
  if (hero.status === HERO_STATUS.DOWNED) {
    return CHARACTER_MODEL_ACTIONS.DEATH;
  }

  if ((hero.attackAnimationRemainingSeconds ?? 0) > 0) {
    return CHARACTER_MODEL_ACTIONS.ATTACK;
  }

  return hero.isMoving ? CHARACTER_MODEL_ACTIONS.RUN : CHARACTER_MODEL_ACTIONS.IDLE;
}

export function getEnemyModelAction(enemy) {
  if (Number.isFinite(enemy?.hp) && enemy.hp <= 0) {
    return CHARACTER_MODEL_ACTIONS.DEATH;
  }

  if ((enemy.attackAnimationRemainingSeconds ?? 0) > 0) {
    return CHARACTER_MODEL_ACTIONS.ATTACK;
  }

  return CHARACTER_MODEL_ACTIONS.RUN;
}

export function worldToViewportModelPoint(position, camera) {
  return {
    x: position.x * camera.scale - camera.offsetX,
    y: position.y * camera.scale - camera.offsetY
  };
}

export function getCharacterModelYawRadians(facingVector) {
  const x = facingVector?.x ?? 0;
  const y = facingVector?.y ?? 0;
  const length = Math.sqrt(x * x + y * y);
  if (length === 0) {
    return 0;
  }

  return Math.atan2(x / length, y / length);
}
