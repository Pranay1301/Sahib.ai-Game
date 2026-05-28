import assert from "node:assert/strict";
import test from "node:test";

import { ENEMY_TYPES } from "../src/game/enemyBehavior.js";
import {
  ENEMY_READABILITY_ACCENTS,
  HERO_READABILITY_ACCENT,
  SPECIAL_PICKUP_READABILITY_ACCENT,
  getEnemyReadabilityAccent
} from "../src/game/visualReadability.js";

test("Phase 13 readability accents cover every locked V1 enemy type", () => {
  const accents = Object.values(ENEMY_READABILITY_ACCENTS);

  assert.equal(Object.keys(ENEMY_READABILITY_ACCENTS).length, Object.keys(ENEMY_TYPES).length);
  assert.equal(new Set(accents).size, accents.length);
  for (const enemyType of Object.values(ENEMY_TYPES)) {
    assert.match(getEnemyReadabilityAccent(enemyType), /^#[0-9a-f]{6}$/i);
  }
});

test("Phase 13 hero and pickup accents are high-contrast hex colors", () => {
  assert.match(HERO_READABILITY_ACCENT, /^#[0-9a-f]{6}$/i);
  assert.match(SPECIAL_PICKUP_READABILITY_ACCENT, /^#[0-9a-f]{6}$/i);
  assert.notEqual(HERO_READABILITY_ACCENT, SPECIAL_PICKUP_READABILITY_ACCENT);
});
