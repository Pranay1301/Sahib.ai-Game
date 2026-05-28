import { ENEMY_TYPES } from "./enemyBehavior.js";

export const CHARACTER_MODEL_IDS = Object.freeze({
  HERO: "hero",
  ALIEN_HUNTER: ENEMY_TYPES.ALIEN_HUNTER,
  HUNTER_EXOSUIT: ENEMY_TYPES.HUNTER_EXOSUIT,
  HEAVY_BRUTE: ENEMY_TYPES.HEAVY_BRUTE,
  BREAKER_BOT: ENEMY_TYPES.BREAKER_BOT
});

export const CHARACTER_MODEL_ACTIONS = Object.freeze({
  IDLE: "idle",
  WALK: "walk",
  RUN: "run",
  ATTACK: "attack",
  DEATH: "death"
});

export const CHARACTER_MODEL_CLIPS = Object.freeze({
  [CHARACTER_MODEL_ACTIONS.IDLE]: "Idle_02",
  [CHARACTER_MODEL_ACTIONS.WALK]: "Walking",
  [CHARACTER_MODEL_ACTIONS.RUN]: "Running",
  [CHARACTER_MODEL_ACTIONS.ATTACK]: "Walk_Forward_While_Shooting",
  [CHARACTER_MODEL_ACTIONS.DEATH]: "Dead"
});

export const CHARACTER_MODEL_SPECS = Object.freeze({
  [CHARACTER_MODEL_IDS.HERO]: createCharacterModelSpec("hero", "Sahib Commander"),
  [CHARACTER_MODEL_IDS.ALIEN_HUNTER]: createCharacterModelSpec("alien_hunter", "Alien Hunter"),
  [CHARACTER_MODEL_IDS.HUNTER_EXOSUIT]: createCharacterModelSpec(
    "hunter_exosuit",
    "Hunter Exosuit Trooper"
  ),
  [CHARACTER_MODEL_IDS.HEAVY_BRUTE]: createCharacterModelSpec("heavy_brute", "Heavy Alien Brute"),
  [CHARACTER_MODEL_IDS.BREAKER_BOT]: createCharacterModelSpec("breaker_bot", "Breaker Bot")
});

export const CHARACTER_MODEL_ASSET_IDS = Object.freeze(Object.keys(CHARACTER_MODEL_SPECS));

export function getCharacterModelSpec(characterId) {
  const spec = CHARACTER_MODEL_SPECS[characterId];
  if (!spec) {
    throw new Error(`Unknown character model id: ${characterId}`);
  }

  return spec;
}

export function getCharacterModelClip(action) {
  const clipName = CHARACTER_MODEL_CLIPS[action];
  if (!clipName) {
    throw new Error(`Unknown character model action: ${action}`);
  }

  return clipName;
}

function createCharacterModelSpec(assetId, label) {
  return Object.freeze({
    id: assetId,
    assetId,
    label,
    clips: CHARACTER_MODEL_CLIPS
  });
}
