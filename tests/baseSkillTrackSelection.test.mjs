import assert from "node:assert/strict";
import test from "node:test";

import {
  LEARNING_TRACKS
} from "../src/base/baseConfig.js";
import {
  createDefaultProfile
} from "../src/base/baseBackend.js";
import {
  BASE_COPY_KEYS,
  BASE_LEARNING_TRACK_COPY_KEYS
} from "../src/base/baseLocalization.js";
import {
  BASE_SKILL_TRACK_FIELD,
  createSkillTrackProfilePatch,
  createSkillTrackSelectionViewModel,
  selectSkillTrackForProfile
} from "../src/base/baseSkillTrackSelection.js";

const USER_ID = "user_phase8";

test("Phase 8 skill track selector exposes only English and AI Agent Builder", () => {
  const selector = createSkillTrackSelectionViewModel({
    profile: createDefaultProfile(USER_ID, {
      learning_track: LEARNING_TRACKS.AI_AGENTS
    }),
    language: "en"
  });

  assert.equal(selector.field, BASE_SKILL_TRACK_FIELD);
  assert.equal(selector.field, "learning_track");
  assert.equal(selector.titleKey, BASE_COPY_KEYS.TRACK_SELECTOR_TITLE);
  assert.equal(selector.title, "Skill Path");
  assert.equal(selector.selectedTrack, LEARNING_TRACKS.AI_AGENTS);
  assert.deepEqual(selector.options.map((option) => option.id), [
    LEARNING_TRACKS.ENGLISH,
    LEARNING_TRACKS.AI_AGENTS
  ]);
  assert.deepEqual(selector.options.map((option) => option.label), [
    "English for Careers",
    "AI Agent Builder"
  ]);
  assert.equal(selector.options.find((option) => option.id === LEARNING_TRACKS.AI_AGENTS).selected, true);
  assert.equal(selector.options.find((option) => option.id === LEARNING_TRACKS.ENGLISH).selected, false);
});

test("skill track selector uses localized labels and challenge count text", () => {
  const selector = createSkillTrackSelectionViewModel({
    profile: createDefaultProfile(USER_ID),
    language: "ar"
  });
  const englishOption = selector.options.find((option) => option.id === LEARNING_TRACKS.ENGLISH);
  const aiOption = selector.options.find((option) => option.id === LEARNING_TRACKS.AI_AGENTS);

  assert.equal(selector.title, "مسار المهارة");
  assert.equal(englishOption.labelKey, BASE_LEARNING_TRACK_COPY_KEYS.english.label);
  assert.equal(englishOption.label, "الإنجليزية للمهن");
  assert.equal(englishOption.challengeCountLabel, "تحديات الإنجليزية مكتملة");
  assert.equal(aiOption.label, "بناء وكلاء الذكاء الاصطناعي");
  assert.equal(aiOption.challengeCountLabel, "تحديات وكلاء الذكاء مكتملة");
});

test("skill track selection writes only the documented learning_track profile field", () => {
  const profile = createDefaultProfile(USER_ID, {
    is_pro: true,
    language: "ar",
    learning_track: LEARNING_TRACKS.ENGLISH
  });
  const updatedProfile = selectSkillTrackForProfile(profile, LEARNING_TRACKS.AI_AGENTS);
  const patch = createSkillTrackProfilePatch(LEARNING_TRACKS.AI_AGENTS);

  assert.deepEqual(patch, {
    learning_track: LEARNING_TRACKS.AI_AGENTS
  });
  assert.deepEqual(updatedProfile, {
    ...profile,
    learning_track: LEARNING_TRACKS.AI_AGENTS
  });
  assert.equal(Object.prototype.hasOwnProperty.call(patch, "xp"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(patch, "vocab_mastered"), false);
  assert.throws(
    () => selectSkillTrackForProfile(profile, "vocab_mastered"),
    /learningTrack must be english or ai_agents/
  );
});
