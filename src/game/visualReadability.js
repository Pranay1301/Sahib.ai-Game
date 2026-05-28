import { ENEMY_TYPES } from "./enemyBehavior.js";

export const HERO_READABILITY_ACCENT = "#f4d36f";
export const SPECIAL_PICKUP_READABILITY_ACCENT = "#7cd4ff";

export const ENEMY_READABILITY_ACCENTS = Object.freeze({
  [ENEMY_TYPES.ALIEN_HUNTER]: "#6af2a2",
  [ENEMY_TYPES.HUNTER_EXOSUIT]: "#b889ff",
  [ENEMY_TYPES.HEAVY_BRUTE]: "#ff8b4a",
  [ENEMY_TYPES.BREAKER_BOT]: "#f05a60"
});

export function getEnemyReadabilityAccent(enemyType) {
  return ENEMY_READABILITY_ACCENTS[enemyType] ?? "#f6ead8";
}
