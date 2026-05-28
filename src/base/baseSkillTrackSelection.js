import {
  BASE_LEARNING_TRACK_DEFINITIONS,
  assertSupportedLearningTrack,
  normalizeLearningTrack
} from "./baseConfig.js";
import {
  BASE_COPY_KEYS,
  BASE_LANGUAGES,
  BASE_LEARNING_TRACK_COPY_KEYS,
  getBaseCopy,
  normalizeBaseLanguage
} from "./baseLocalization.js";

export const BASE_SKILL_TRACK_FIELD = "learning_track";

export function createSkillTrackSelectionViewModel({
  profile = {},
  learningTrack = null,
  language = BASE_LANGUAGES.EN
} = {}) {
  const normalizedLanguage = normalizeBaseLanguage(language ?? profile.language);
  const selectedTrack = normalizeLearningTrack(learningTrack ?? profile.learning_track);

  return {
    field: BASE_SKILL_TRACK_FIELD,
    selectedTrack,
    titleKey: BASE_COPY_KEYS.TRACK_SELECTOR_TITLE,
    title: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.TRACK_SELECTOR_TITLE),
    options: BASE_LEARNING_TRACK_DEFINITIONS.map((definition) => {
      const copyKeys = BASE_LEARNING_TRACK_COPY_KEYS[definition.id];
      return {
        id: definition.id,
        value: definition.backendValue,
        labelKey: copyKeys.label,
        label: getBaseCopy(normalizedLanguage, copyKeys.label),
        purposeKey: copyKeys.purpose,
        purpose: getBaseCopy(normalizedLanguage, copyKeys.purpose),
        challengeCountLabelKey: copyKeys.challengeCountLabel,
        challengeCountLabel: getBaseCopy(normalizedLanguage, copyKeys.challengeCountLabel),
        selected: definition.id === selectedTrack
      };
    })
  };
}

export function selectSkillTrackForProfile(profile = {}, learningTrack) {
  return {
    ...profile,
    [BASE_SKILL_TRACK_FIELD]: assertSupportedLearningTrack(learningTrack)
  };
}

export function createSkillTrackProfilePatch(learningTrack) {
  return {
    [BASE_SKILL_TRACK_FIELD]: assertSupportedLearningTrack(learningTrack)
  };
}
