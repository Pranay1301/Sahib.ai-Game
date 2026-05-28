import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_COPY_KEYS,
  BASE_COPY_KEYS,
  BASE_LANGUAGES,
  BASE_LEARNING_TRACK_COPY_KEYS,
  BASE_SKILL_TIER_KEYS,
  getBaseCopy,
  getSupportedBaseLanguages,
  hasBaseCopyKey,
  normalizeBaseLanguage
} from "../src/base/baseLocalization.js";

test("base localization supports separate English and Arabic language modes", () => {
  assert.equal(normalizeBaseLanguage("en"), BASE_LANGUAGES.EN);
  assert.equal(normalizeBaseLanguage("ar"), BASE_LANGUAGES.AR);
  assert.equal(normalizeBaseLanguage("fr"), BASE_LANGUAGES.EN);
  assert.deepEqual(getSupportedBaseLanguages().map((language) => language.code), ["en", "ar"]);
  assert.equal(getBaseCopy("en", BASE_COPY_KEYS.SCREEN_TITLE), "Sahib Kingdom");
  assert.notEqual(getBaseCopy("ar", BASE_COPY_KEYS.SCREEN_TITLE), "Sahib Kingdom");
});

test("all Phase 4 home copy keys exist for both supported languages", () => {
  for (const language of Object.values(BASE_LANGUAGES)) {
    for (const key of Object.values(BASE_COPY_KEYS)) {
      assert.equal(hasBaseCopyKey(language, key), true, `${language} missing ${key}`);
    }
  }
});

test("all fixed building label and purpose keys exist for both supported languages", () => {
  for (const language of Object.values(BASE_LANGUAGES)) {
    for (const copyKeys of Object.values(BASE_BUILDING_COPY_KEYS)) {
      assert.equal(hasBaseCopyKey(language, copyKeys.label), true, `${language} missing ${copyKeys.label}`);
      assert.equal(hasBaseCopyKey(language, copyKeys.purpose), true, `${language} missing ${copyKeys.purpose}`);
    }
  }
});

test("all Phase 8 learning track copy keys exist for both supported languages", () => {
  for (const language of Object.values(BASE_LANGUAGES)) {
    for (const copyKeys of Object.values(BASE_LEARNING_TRACK_COPY_KEYS)) {
      assert.equal(hasBaseCopyKey(language, copyKeys.label), true, `${language} missing ${copyKeys.label}`);
      assert.equal(hasBaseCopyKey(language, copyKeys.purpose), true, `${language} missing ${copyKeys.purpose}`);
      assert.equal(hasBaseCopyKey(language, copyKeys.challengeCountLabel), true, `${language} missing ${copyKeys.challengeCountLabel}`);
    }
  }
});

test("all skill tier keys exist for English and AI Agent Builder tracks", () => {
  for (const language of Object.values(BASE_LANGUAGES)) {
    for (const trackKeys of Object.values(BASE_SKILL_TIER_KEYS)) {
      for (const tierKey of Object.values(trackKeys)) {
        assert.equal(hasBaseCopyKey(language, tierKey), true, `${language} missing ${tierKey}`);
      }
    }
  }
});

test("base copy interpolation keeps UI text localization-ready", () => {
  assert.equal(
    getBaseCopy("en", BASE_COPY_KEYS.LOCKED_REQUIREMENT, { palaceLevel: 3 }),
    "Unlocks at Palace Level 3"
  );
  assert.equal(
    getBaseCopy("en", "unknown.copy.key"),
    "unknown.copy.key"
  );
});
