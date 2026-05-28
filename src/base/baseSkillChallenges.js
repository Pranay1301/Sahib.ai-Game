import {
  BASE_SKILL_CHALLENGE_RULES,
  BUILDING_STATES,
  LEARNING_TRACKS,
  getNextBuildingLevel,
  normalizeLearningTrack
} from "./baseConfig.js";
import {
  BASE_COPY_KEYS,
  BASE_LANGUAGES,
  getBaseCopy,
  normalizeBaseLanguage
} from "./baseLocalization.js";

export const BASE_SKILL_CHALLENGE_PHASES = Object.freeze({
  CONCEPT: "concept",
  QUESTIONS: "questions",
  RESULT: "result"
});

export const BASE_SKILL_CHALLENGE_OUTCOMES = Object.freeze({
  PASSED: "passed",
  FAILED: "failed"
});

export const BASE_SKILL_QUESTION_TYPES = Object.freeze({
  MULTIPLE_CHOICE: "multiple_choice",
  FILL_BLANK: "fill_blank",
  ARRANGE_ORDER: "arrange_order",
  MATCH_PAIRS: "match_pairs"
});

const TRACK_CHALLENGE_SEEDS = Object.freeze({
  [LEARNING_TRACKS.ENGLISH]: Object.freeze([
    Object.freeze({
      challengeId: "english_careers_001",
      learningTrack: LEARNING_TRACKS.ENGLISH,
      title: "Professional Introductions",
      conceptCard: Object.freeze({
        title: "Introduce Yourself Clearly",
        explanation: "A strong introduction says who you are, what you do, and why you are speaking.",
        example: "Example: I am Pranay. I build mobile apps and I am excited to discuss this role.",
        icon: "briefcase",
        diagram: "Name -> Role -> Purpose"
      }),
      questions: Object.freeze([
        createQuestion({
          id: "english_careers_001_q1",
          type: BASE_SKILL_QUESTION_TYPES.FILL_BLANK,
          prompt: "Choose the best word: I am applying ___ the product designer role.",
          choices: [
            ["for", "for"],
            ["at", "at"],
            ["on", "on"],
            ["from", "from"]
          ],
          correctAnswerId: "for"
        }),
        createQuestion({
          id: "english_careers_001_q2",
          type: BASE_SKILL_QUESTION_TYPES.MULTIPLE_CHOICE,
          prompt: "Which opening sounds most professional in a job email?",
          choices: [
            ["hello", "Hello, I am writing about the open role."],
            ["yo", "Yo, give me the job."],
            ["urgent", "URGENT!!! Read this now."],
            ["blank", "No greeting"]
          ],
          correctAnswerId: "hello"
        }),
        createQuestion({
          id: "english_careers_001_q3",
          type: BASE_SKILL_QUESTION_TYPES.ARRANGE_ORDER,
          prompt: "Arrange the words into a clear sentence.",
          choices: [
            ["i", "I"],
            ["am", "am"],
            ["excited", "excited"],
            ["to", "to"],
            ["join", "join"]
          ],
          correctAnswerIds: ["i", "am", "excited", "to", "join"]
        }),
        createQuestion({
          id: "english_careers_001_q4",
          type: BASE_SKILL_QUESTION_TYPES.MULTIPLE_CHOICE,
          prompt: "What should a short self-introduction include?",
          choices: [
            ["name_role_goal", "Name, role, and purpose"],
            ["only_name", "Only your name"],
            ["salary_first", "Salary request first"],
            ["too_many_details", "Every personal detail"]
          ],
          correctAnswerId: "name_role_goal"
        }),
        createQuestion({
          id: "english_careers_001_q5",
          type: BASE_SKILL_QUESTION_TYPES.FILL_BLANK,
          prompt: "Choose the best phrase: Thank you ___ your time.",
          choices: [
            ["for", "for"],
            ["by", "by"],
            ["to", "to"],
            ["with", "with"]
          ],
          correctAnswerId: "for"
        })
      ])
    })
  ]),
  [LEARNING_TRACKS.AI_AGENTS]: Object.freeze([
    Object.freeze({
      challengeId: "ai_agents_001",
      learningTrack: LEARNING_TRACKS.AI_AGENTS,
      title: "What Is an AI Agent?",
      conceptCard: Object.freeze({
        title: "What is an AI Agent?",
        explanation: "An AI agent follows a goal, makes a plan, uses tools, and completes a task.",
        example: "Example: A sales agent can find leads, write outreach emails, and save them in a sheet.",
        icon: "bot",
        diagram: "Goal -> Plan -> Tool -> Result"
      }),
      questions: Object.freeze([
        createQuestion({
          id: "ai_agents_001_q1",
          type: BASE_SKILL_QUESTION_TYPES.MULTIPLE_CHOICE,
          prompt: "What best describes an AI agent?",
          choices: [
            ["goal_task", "A system that follows a goal and completes tasks"],
            ["image_only", "Only an image generator"],
            ["random_bot", "A bot that acts randomly"],
            ["database", "A database table"]
          ],
          correctAnswerId: "goal_task"
        }),
        createQuestion({
          id: "ai_agents_001_q2",
          type: BASE_SKILL_QUESTION_TYPES.ARRANGE_ORDER,
          prompt: "Order the basic agent workflow.",
          choices: [
            ["goal", "Goal"],
            ["plan", "Plan"],
            ["tool", "Tool"],
            ["result", "Result"]
          ],
          correctAnswerIds: ["goal", "plan", "tool", "result"]
        }),
        createQuestion({
          id: "ai_agents_001_q3",
          type: BASE_SKILL_QUESTION_TYPES.MULTIPLE_CHOICE,
          prompt: "Why do agents use tools?",
          choices: [
            ["act", "To take actions like search, write, or save"],
            ["decorate", "To decorate the screen"],
            ["skip", "To skip human review forever"],
            ["coins", "To create infinite coins"]
          ],
          correctAnswerId: "act"
        }),
        createQuestion({
          id: "ai_agents_001_q4",
          type: BASE_SKILL_QUESTION_TYPES.MATCH_PAIRS,
          prompt: "Match the concept to its meaning: Goal.",
          choices: [
            ["target", "The result the agent should achieve"],
            ["memory", "Saved past context"],
            ["tool", "An action the agent can use"],
            ["style", "Visual decoration"]
          ],
          correctAnswerId: "target"
        }),
        createQuestion({
          id: "ai_agents_001_q5",
          type: BASE_SKILL_QUESTION_TYPES.MULTIPLE_CHOICE,
          prompt: "What should a user do before trusting an agent output?",
          choices: [
            ["review", "Review and check the result"],
            ["ignore", "Ignore all errors"],
            ["publish", "Publish without reading"],
            ["delete_goal", "Remove the goal"]
          ],
          correctAnswerId: "review"
        })
      ])
    })
  ])
});

export function getSkillChallengeContent({
  learningTrack = LEARNING_TRACKS.ENGLISH,
  challengeNumber = 1,
  challengeId = null
} = {}) {
  const normalizedTrack = normalizeLearningTrack(learningTrack);
  const challenges = TRACK_CHALLENGE_SEEDS[normalizedTrack];
  const selectedChallenge = challengeId
    ? challenges.find((challenge) => challenge.challengeId === challengeId)
    : challenges[(normalizePositiveIndex(challengeNumber) - 1) % challenges.length];

  if (!selectedChallenge) {
    throw new RangeError(`Unsupported skill challenge: ${challengeId}`);
  }

  return cloneChallenge(selectedChallenge);
}

export function createSkillChallengeViewModel({
  profile = {},
  learningTrack = null,
  buildingId = null,
  currentLevel = 1,
  challengeNumber = 1,
  language = BASE_LANGUAGES.EN
} = {}) {
  const normalizedLanguage = normalizeBaseLanguage(language ?? profile.language);
  const normalizedTrack = normalizeLearningTrack(learningTrack ?? profile.learning_track);
  const targetLevel = getNextBuildingLevel(currentLevel);
  const challenge = getSkillChallengeContent({
    learningTrack: normalizedTrack,
    challengeNumber
  });

  return {
    learningTrack: normalizedTrack,
    buildingId,
    currentLevel,
    targetLevel,
    challengeId: challenge.challengeId,
    title: challenge.title,
    phase: BASE_SKILL_CHALLENGE_PHASES.CONCEPT,
    conceptCard: challenge.conceptCard,
    rules: { ...BASE_SKILL_CHALLENGE_RULES },
    questionCount: challenge.questions.length,
    questions: challenge.questions.map(toPublicQuestion),
    startAction: {
      labelKey: BASE_COPY_KEYS.SKILL_CHALLENGE_START_CTA,
      label: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.SKILL_CHALLENGE_START_CTA)
    },
    retryAction: {
      labelKey: BASE_COPY_KEYS.SKILL_CHALLENGE_RETRY_CTA,
      label: getBaseCopy(normalizedLanguage, BASE_COPY_KEYS.SKILL_CHALLENGE_RETRY_CTA)
    }
  };
}

export function createSkillChallengeSession({
  profile = {},
  learningTrack = null,
  buildingId = null,
  currentLevel = 1,
  challengeNumber = 1,
  challengeId = null,
  sessionId = null
} = {}) {
  const normalizedTrack = normalizeLearningTrack(learningTrack ?? profile.learning_track);
  const challenge = getSkillChallengeContent({
    learningTrack: normalizedTrack,
    challengeNumber,
    challengeId
  });

  assertValidChallenge(challenge);

  const targetLevel = getNextBuildingLevel(currentLevel);
  return {
    sessionId: sessionId ?? `${buildingId ?? "building"}_${challenge.challengeId}_${currentLevel}_${targetLevel ?? "max"}`,
    learningTrack: normalizedTrack,
    buildingId,
    currentLevel,
    targetLevel,
    challengeId: challenge.challengeId,
    phase: BASE_SKILL_CHALLENGE_PHASES.CONCEPT,
    conceptCard: { ...challenge.conceptCard },
    questions: challenge.questions.map(cloneQuestion),
    answers: [],
    retryCount: 0,
    result: null,
    canRetry: false,
    canStartTimer: false
  };
}

export function startSkillChallengeQuestions(session) {
  assertSkillChallengeSession(session);
  return {
    ...session,
    phase: BASE_SKILL_CHALLENGE_PHASES.QUESTIONS
  };
}

export function answerSkillChallengeQuestion(session, questionId, answer) {
  assertSkillChallengeSession(session);
  if (session.phase !== BASE_SKILL_CHALLENGE_PHASES.QUESTIONS) {
    throw new Error("Skill challenge questions have not started");
  }

  const question = session.questions.find((candidate) => candidate.id === questionId);
  if (!question) {
    throw new RangeError(`Unknown skill challenge question: ${questionId}`);
  }

  const normalizedAnswer = normalizeAnswer(answer);
  const answerRecord = Object.freeze({
    questionId,
    answer: normalizedAnswer,
    correct: isQuestionAnswerCorrect(question, normalizedAnswer)
  });
  const answers = [
    ...session.answers.filter((candidate) => candidate.questionId !== questionId),
    answerRecord
  ];

  if (answers.length < BASE_SKILL_CHALLENGE_RULES.questionsRequired) {
    return {
      ...session,
      answers,
      canRetry: false,
      canStartTimer: false
    };
  }

  const result = gradeSkillChallengeAnswers(session, answers);
  return {
    ...session,
    answers,
    phase: BASE_SKILL_CHALLENGE_PHASES.RESULT,
    result,
    canRetry: !result.passed,
    canStartTimer: result.passed
  };
}

export function gradeSkillChallengeAnswers(sessionOrChallenge, answers = []) {
  const questions = Array.isArray(sessionOrChallenge?.questions)
    ? sessionOrChallenge.questions
    : [];
  if (questions.length !== BASE_SKILL_CHALLENGE_RULES.questionsRequired) {
    throw new Error("Skill challenge must contain exactly 5 questions");
  }

  const answerRecords = Array.isArray(answers) ? answers : [];
  const correctCount = questions.reduce((total, question) => {
    const record = answerRecords.find((candidate) => candidate?.questionId === question.id);
    if (!record) {
      return total;
    }

    return total + (isQuestionAnswerCorrect(question, normalizeAnswer(record.answer)) ? 1 : 0);
  }, 0);
  const passed = correctCount >= BASE_SKILL_CHALLENGE_RULES.passCount;

  return {
    challengeId: sessionOrChallenge.challengeId,
    learningTrack: sessionOrChallenge.learningTrack,
    buildingId: sessionOrChallenge.buildingId ?? null,
    currentLevel: sessionOrChallenge.currentLevel ?? null,
    targetLevel: sessionOrChallenge.targetLevel ?? null,
    answeredCount: answerRecords.length,
    correctCount,
    questionsRequired: BASE_SKILL_CHALLENGE_RULES.questionsRequired,
    passCount: BASE_SKILL_CHALLENGE_RULES.passCount,
    passed,
    outcome: passed
      ? BASE_SKILL_CHALLENGE_OUTCOMES.PASSED
      : BASE_SKILL_CHALLENGE_OUTCOMES.FAILED,
    canRetry: !passed,
    canStartTimer: passed
  };
}

export function createSkillChallengeRetrySession(session) {
  assertSkillChallengeSession(session);
  if (session.result?.passed !== false) {
    throw new Error("Only failed skill challenges can be retried");
  }

  return {
    ...session,
    phase: BASE_SKILL_CHALLENGE_PHASES.CONCEPT,
    answers: [],
    retryCount: normalizeWholeNumber(session.retryCount) + 1,
    result: null,
    canRetry: false,
    canStartTimer: false
  };
}

export function applySkillChallengeResultToGameState({
  gameState = {},
  result,
  completedAt = null
} = {}) {
  assertSkillChallengeResult(result);
  const completedCount = normalizeWholeNumber(gameState.skill_challenges_completed);
  const lastSkillResult = {
    challenge_id: result.challengeId,
    learning_track: result.learningTrack,
    building_id: result.buildingId,
    score: result.correctCount,
    questions_required: result.questionsRequired,
    pass_count: result.passCount,
    passed: result.passed,
    completed_at: completedAt
  };

  return {
    ...gameState,
    skill_challenges_completed: result.passed ? completedCount + 1 : completedCount,
    last_skill_result: lastSkillResult
  };
}

export function createSkillChallengeUpgradeGate({
  buildingRow = null,
  result = null
} = {}) {
  const passed = Boolean(result?.passed);
  return {
    buildingId: buildingRow?.building_id ?? result?.buildingId ?? null,
    canStartTimer: passed,
    canRetry: !passed,
    nextBuildingState: passed
      ? BUILDING_STATES.UPGRADING
      : BUILDING_STATES.QUIZ_REQUIRED,
    timerStartBlockedReason: passed ? null : "skill_challenge_not_passed"
  };
}

function createQuestion({
  id,
  type,
  prompt,
  choices,
  correctAnswerId = null,
  correctAnswerIds = null
}) {
  return Object.freeze({
    id,
    type,
    prompt,
    choices: Object.freeze(choices.map(([choiceId, label]) => Object.freeze({
      id: choiceId,
      label
    }))),
    correctAnswerId,
    correctAnswerIds: correctAnswerIds ? Object.freeze([...correctAnswerIds]) : null
  });
}

function assertValidChallenge(challenge) {
  if (challenge.questions.length !== BASE_SKILL_CHALLENGE_RULES.questionsRequired) {
    throw new Error("Skill challenge must contain exactly 5 questions");
  }
}

function assertSkillChallengeSession(session) {
  if (!session || typeof session !== "object") {
    throw new TypeError("skill challenge session is required");
  }

  assertValidChallenge(session);
}

function assertSkillChallengeResult(result) {
  if (!result || typeof result !== "object") {
    throw new TypeError("skill challenge result is required");
  }
  if (typeof result.passed !== "boolean") {
    throw new TypeError("skill challenge result must include passed");
  }
}

function isQuestionAnswerCorrect(question, answer) {
  if (question.correctAnswerIds) {
    return arraysEqual(question.correctAnswerIds, Array.isArray(answer) ? answer : [answer]);
  }

  return question.correctAnswerId === answer;
}

function normalizeAnswer(answer) {
  if (Array.isArray(answer)) {
    return answer.map((value) => String(value));
  }

  return String(answer);
}

function arraysEqual(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right) || left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

function toPublicQuestion(question) {
  return {
    id: question.id,
    type: question.type,
    prompt: question.prompt,
    choices: question.choices.map((choice) => ({ ...choice }))
  };
}

function cloneChallenge(challenge) {
  return {
    ...challenge,
    conceptCard: { ...challenge.conceptCard },
    questions: challenge.questions.map(cloneQuestion)
  };
}

function cloneQuestion(question) {
  return {
    ...question,
    choices: question.choices.map((choice) => ({ ...choice })),
    correctAnswerIds: question.correctAnswerIds ? [...question.correctAnswerIds] : null
  };
}

function normalizePositiveIndex(value) {
  return Math.max(1, Math.floor(Number(value) || 1));
}

function normalizeWholeNumber(value) {
  return Math.max(0, Math.floor(Number(value) || 0));
}
