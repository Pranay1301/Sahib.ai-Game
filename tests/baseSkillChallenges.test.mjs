import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_IDS,
  BASE_SKILL_CHALLENGE_RULES,
  BUILDING_STATES,
  LEARNING_TRACKS
} from "../src/base/baseConfig.js";
import {
  createDefaultGameState,
  createDefaultProfile
} from "../src/base/baseBackend.js";
import {
  BASE_SKILL_CHALLENGE_OUTCOMES,
  BASE_SKILL_CHALLENGE_PHASES,
  BASE_SKILL_QUESTION_TYPES,
  answerSkillChallengeQuestion,
  applySkillChallengeResultToGameState,
  createSkillChallengeRetrySession,
  createSkillChallengeSession,
  createSkillChallengeUpgradeGate,
  createSkillChallengeViewModel,
  getSkillChallengeContent,
  gradeSkillChallengeAnswers,
  startSkillChallengeQuestions
} from "../src/base/baseSkillChallenges.js";

const USER_ID = "user_phase9";

test("Phase 9 challenge content exposes a mini concept card and exactly five questions per track", () => {
  const english = getSkillChallengeContent({
    learningTrack: LEARNING_TRACKS.ENGLISH
  });
  const aiAgents = getSkillChallengeContent({
    learningTrack: LEARNING_TRACKS.AI_AGENTS
  });

  assert.equal(BASE_SKILL_CHALLENGE_RULES.questionsRequired, 5);
  assert.equal(BASE_SKILL_CHALLENGE_RULES.passCount, 4);
  assert.equal(BASE_SKILL_CHALLENGE_RULES.allowsRetry, true);
  assert.equal(BASE_SKILL_CHALLENGE_RULES.timerStartsOnlyAfterPass, true);
  assert.equal(english.conceptCard.title, "Introduce Yourself Clearly");
  assert.equal(aiAgents.conceptCard.title, "What is an AI Agent?");
  assert.equal(english.questions.length, 5);
  assert.equal(aiAgents.questions.length, 5);
  assert.deepEqual(
    [...new Set(aiAgents.questions.map((question) => question.type))].sort(),
    [
      BASE_SKILL_QUESTION_TYPES.ARRANGE_ORDER,
      BASE_SKILL_QUESTION_TYPES.MATCH_PAIRS,
      BASE_SKILL_QUESTION_TYPES.MULTIPLE_CHOICE
    ].sort()
  );
});

test("skill challenge view model shows public question data and localized actions", () => {
  const viewModel = createSkillChallengeViewModel({
    profile: createDefaultProfile(USER_ID, {
      learning_track: LEARNING_TRACKS.AI_AGENTS
    }),
    buildingId: BASE_BUILDING_IDS.LEARNING_HALL,
    currentLevel: 1,
    language: "ar"
  });

  assert.equal(viewModel.phase, BASE_SKILL_CHALLENGE_PHASES.CONCEPT);
  assert.equal(viewModel.buildingId, BASE_BUILDING_IDS.LEARNING_HALL);
  assert.equal(viewModel.targetLevel, 2);
  assert.equal(viewModel.questionCount, 5);
  assert.equal(viewModel.startAction.label, "ابدأ تحدي المهارة");
  assert.equal(viewModel.retryAction.label, "أعد المحاولة");
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel.questions[0], "correctAnswerId"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(viewModel.questions[0], "correctAnswerIds"), false);
});

test("skill challenge session cannot start a timer before a 4 of 5 pass", () => {
  const conceptSession = createSkillChallengeSession({
    profile: createDefaultProfile(USER_ID, {
      learning_track: LEARNING_TRACKS.AI_AGENTS
    }),
    buildingId: BASE_BUILDING_IDS.LEARNING_HALL,
    currentLevel: 1
  });
  const questionSession = startSkillChallengeQuestions(conceptSession);
  const partialSession = answerSkillChallengeQuestion(
    questionSession,
    "ai_agents_001_q1",
    "goal_task"
  );

  assert.equal(conceptSession.phase, BASE_SKILL_CHALLENGE_PHASES.CONCEPT);
  assert.equal(conceptSession.canStartTimer, false);
  assert.equal(questionSession.phase, BASE_SKILL_CHALLENGE_PHASES.QUESTIONS);
  assert.equal(questionSession.canStartTimer, false);
  assert.equal(partialSession.phase, BASE_SKILL_CHALLENGE_PHASES.QUESTIONS);
  assert.equal(partialSession.canStartTimer, false);
  assert.equal(partialSession.result, null);
});

test("answering four of five questions passes and allows timer start", () => {
  const session = startSkillChallengeQuestions(createSkillChallengeSession({
    learningTrack: LEARNING_TRACKS.AI_AGENTS,
    buildingId: BASE_BUILDING_IDS.DRONE_STATION,
    currentLevel: 2
  }));
  const completed = answerAll(session, [
    ["ai_agents_001_q1", "goal_task"],
    ["ai_agents_001_q2", ["goal", "plan", "tool", "result"]],
    ["ai_agents_001_q3", "act"],
    ["ai_agents_001_q4", "target"],
    ["ai_agents_001_q5", "ignore"]
  ]);
  const gate = createSkillChallengeUpgradeGate({
    buildingRow: {
      building_id: BASE_BUILDING_IDS.DRONE_STATION,
      state: BUILDING_STATES.QUIZ_REQUIRED
    },
    result: completed.result
  });

  assert.equal(completed.phase, BASE_SKILL_CHALLENGE_PHASES.RESULT);
  assert.equal(completed.result.correctCount, 4);
  assert.equal(completed.result.passed, true);
  assert.equal(completed.result.outcome, BASE_SKILL_CHALLENGE_OUTCOMES.PASSED);
  assert.equal(completed.canStartTimer, true);
  assert.equal(completed.canRetry, false);
  assert.equal(gate.canStartTimer, true);
  assert.equal(gate.nextBuildingState, BUILDING_STATES.UPGRADING);
});

test("failing the challenge keeps the building in quiz_required and allows immediate retry", () => {
  const session = startSkillChallengeQuestions(createSkillChallengeSession({
    learningTrack: LEARNING_TRACKS.ENGLISH,
    buildingId: BASE_BUILDING_IDS.ATTACK_TOWER,
    currentLevel: 1
  }));
  const completed = answerAll(session, [
    ["english_careers_001_q1", "for"],
    ["english_careers_001_q2", "hello"],
    ["english_careers_001_q3", ["i", "am", "excited", "to", "join"]],
    ["english_careers_001_q4", "only_name"],
    ["english_careers_001_q5", "with"]
  ]);
  const gate = createSkillChallengeUpgradeGate({
    buildingRow: {
      building_id: BASE_BUILDING_IDS.ATTACK_TOWER,
      state: BUILDING_STATES.QUIZ_REQUIRED
    },
    result: completed.result
  });
  const retry = createSkillChallengeRetrySession(completed);

  assert.equal(completed.result.correctCount, 3);
  assert.equal(completed.result.passed, false);
  assert.equal(completed.result.outcome, BASE_SKILL_CHALLENGE_OUTCOMES.FAILED);
  assert.equal(completed.canStartTimer, false);
  assert.equal(completed.canRetry, true);
  assert.equal(gate.canStartTimer, false);
  assert.equal(gate.nextBuildingState, BUILDING_STATES.QUIZ_REQUIRED);
  assert.equal(gate.timerStartBlockedReason, "skill_challenge_not_passed");
  assert.equal(retry.phase, BASE_SKILL_CHALLENGE_PHASES.CONCEPT);
  assert.equal(retry.retryCount, 1);
  assert.equal(retry.answers.length, 0);
  assert.equal(retry.canStartTimer, false);
});

test("skill challenge result updates only skill progress and last result state", () => {
  const session = createSkillChallengeSession({
    learningTrack: LEARNING_TRACKS.ENGLISH,
    buildingId: BASE_BUILDING_IDS.PALACE,
    currentLevel: 1
  });
  const passedResult = gradeSkillChallengeAnswers(session, [
    { questionId: "english_careers_001_q1", answer: "for" },
    { questionId: "english_careers_001_q2", answer: "hello" },
    { questionId: "english_careers_001_q3", answer: ["i", "am", "excited", "to", "join"] },
    { questionId: "english_careers_001_q4", answer: "name_role_goal" },
    { questionId: "english_careers_001_q5", answer: "for" }
  ]);
  const gameState = applySkillChallengeResultToGameState({
    gameState: createDefaultGameState(USER_ID, {
      skill_challenges_completed: 8
    }),
    result: passedResult,
    completedAt: "2026-05-28T10:00:00.000Z"
  });

  assert.equal(gameState.skill_challenges_completed, 9);
  assert.equal(gameState.last_skill_result.challenge_id, "english_careers_001");
  assert.equal(gameState.last_skill_result.score, 5);
  assert.equal(gameState.last_skill_result.passed, true);
  assert.equal(Object.prototype.hasOwnProperty.call(gameState, "xp"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(gameState, "vocab_mastered"), false);
});

function answerAll(session, answers) {
  return answers.reduce(
    (currentSession, [questionId, answer]) =>
      answerSkillChallengeQuestion(currentSession, questionId, answer),
    session
  );
}
