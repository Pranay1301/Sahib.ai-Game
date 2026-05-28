import assert from "node:assert/strict";
import test from "node:test";

import {
  createDefaultGameState,
  createDefaultProfile,
  createInitialUserBuildings
} from "../src/base/baseBackend.js";
import {
  BASE_BUILDING_IDS,
  BUILDING_STATES
} from "../src/base/baseConfig.js";
import {
  claimBattleResultReward
} from "../src/base/baseRewardBridge.js";
import {
  createSkillChallengeUpgradeGate
} from "../src/base/baseSkillChallenges.js";
import {
  createBaseHomeSlots
} from "../src/base/baseHomeModel.js";
import {
  BASE_UPGRADE_TIMER_REASONS,
  completeUpgradeTimer,
  createUpgradeTimerStatus,
  startBuildingUpgradeChallenge,
  startUpgradeTimerAfterSkillChallenge
} from "../src/base/baseUpgradeTimers.js";
import {
  BASE_BUILDING_TAP_ACTIONS
} from "../src/base/baseUnlocks.js";
import {
  HEART_REFILL_SECONDS,
  HEART_REWARD_MODES,
  createHeartState,
  consumeHeartForQuickRound,
  tickHearts
} from "../src/game/hearts.js";

const USER_ID = "user_phase15";
const CLAIMED_AT = "2026-05-28T09:30:00.000Z";
const SERVER_STARTED_AT = "2026-05-28T10:00:00.000Z";

test("Phase 15 QA verifies free and Pro coin outcomes plus duplicate claim block", () => {
  assert.equal(claimCoins("win", false), 100);
  assert.equal(claimCoins("win", true), 300);
  assert.equal(claimCoins("draw", false), 50);
  assert.equal(claimCoins("draw", true), 150);
  assert.equal(claimCoins("loss", false), 25);
  assert.equal(claimCoins("loss", true), 75);

  const battleResult = createBattleResult("win");
  const firstClaim = claimBattleResultReward({
    gameState: createDefaultGameState(USER_ID),
    existingClaims: [],
    battleResult,
    userId: USER_ID,
    isPro: false,
    claimedAt: CLAIMED_AT
  });
  const duplicate = claimBattleResultReward({
    gameState: firstClaim.gameState,
    existingClaims: [firstClaim.claim],
    battleResult,
    userId: USER_ID,
    isPro: false,
    claimedAt: CLAIMED_AT
  });

  assert.equal(firstClaim.accepted, true);
  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.reason, "duplicate_battle_reward_claim");
});

test("Phase 15 QA verifies free-heart wait and Pro unlimited quick battle access", () => {
  let freeState = createHeartState();
  for (let i = 0; i < 4; i += 1) {
    freeState = consumeHeartForQuickRound(freeState).hearts;
  }

  assert.equal(freeState.hearts, 0);
  assert.equal(freeState.refillRemainingSeconds, HEART_REFILL_SECONDS);
  assert.equal(tickHearts(freeState, HEART_REFILL_SECONDS - 1).hearts, 0);
  assert.equal(tickHearts(freeState, HEART_REFILL_SECONDS).hearts, 4);

  const proState = createHeartState({
    hearts: 0,
    unlimitedFullReward: true
  });
  const firstProRound = consumeHeartForQuickRound(proState);
  const secondProRound = consumeHeartForQuickRound(firstProRound.hearts);

  assert.equal(firstProRound.rewardMode, HEART_REWARD_MODES.FULL_REWARD);
  assert.equal(secondProRound.rewardMode, HEART_REWARD_MODES.FULL_REWARD);
  assert.equal(secondProRound.hearts.hearts, 0);
  assert.equal(secondProRound.hearts.refillRemainingSeconds, 0);
});

test("Phase 15 QA verifies locked taps and Palace Level 2 unlocks", () => {
  const levelOneSlots = createBaseHomeSlots({
    buildings: createInitialUserBuildings(USER_ID, { palaceLevel: 1 }),
    palaceLevel: 1,
    profile: createDefaultProfile(USER_ID)
  });
  const lockedWall = levelOneSlots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.WALL_GATE);

  assert.equal(lockedWall.tapResult.action, BASE_BUILDING_TAP_ACTIONS.LOCKED_REQUIREMENT);
  assert.equal(lockedWall.tapResult.requirement.palaceLevel, 3);
  assert.equal(Object.prototype.hasOwnProperty.call(lockedWall.tapResult, "upgradePreview"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(lockedWall.tapResult, "timerPreview"), false);

  const levelTwoSlots = createBaseHomeSlots({
    buildings: createInitialUserBuildings(USER_ID, { palaceLevel: 2 }),
    palaceLevel: 2
  });

  assert.equal(
    levelTwoSlots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.ATTACK_TOWER).state,
    BUILDING_STATES.AVAILABLE
  );
  assert.equal(
    levelTwoSlots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.TREASURY).state,
    BUILDING_STATES.AVAILABLE
  );
});

test("Phase 15 QA verifies upgrade cost, challenge failure, pass, and timers", () => {
  const challengeStart = startBuildingUpgradeChallenge({
    gameState: createDefaultGameState(USER_ID, { coins: 3000 }),
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.AVAILABLE
    })
  });
  const failedGate = createSkillChallengeUpgradeGate({
    buildingRow: challengeStart.buildingRow,
    result: {
      passed: false,
      buildingId: BASE_BUILDING_IDS.ATTACK_TOWER
    }
  });
  const failedTimerStart = startUpgradeTimerAfterSkillChallenge({
    buildingRow: challengeStart.buildingRow,
    skillResult: { passed: false },
    serverStartedAt: SERVER_STARTED_AT
  });
  const freeTimerStart = startUpgradeTimerAfterSkillChallenge({
    buildingRow: challengeStart.buildingRow,
    skillResult: { passed: true },
    serverStartedAt: SERVER_STARTED_AT,
    isPro: false
  });
  const proTimerStart = startUpgradeTimerAfterSkillChallenge({
    buildingRow: createBuildingRow({
      building_id: BASE_BUILDING_IDS.TREASURY,
      level: 1,
      state: BUILDING_STATES.QUIZ_REQUIRED
    }),
    skillResult: { passed: true },
    serverStartedAt: SERVER_STARTED_AT,
    isPro: true
  });

  assert.equal(challengeStart.accepted, true);
  assert.equal(challengeStart.gameState.coins, 0);
  assert.equal(failedGate.canStartTimer, false);
  assert.equal(failedGate.canRetry, true);
  assert.equal(failedTimerStart.accepted, false);
  assert.equal(failedTimerStart.reason, BASE_UPGRADE_TIMER_REASONS.SKILL_CHALLENGE_NOT_PASSED);
  assert.equal(freeTimerStart.accepted, true);
  assert.equal(freeTimerStart.activeUpgrade.timer_duration_minutes, 60);
  assert.equal(proTimerStart.activeUpgrade.timer_duration_minutes, 12);
});

test("Phase 15 QA verifies Pro changes affect future timers only", () => {
  const freeTimerStart = startUpgradeTimerAfterSkillChallenge({
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.QUIZ_REQUIRED
    }),
    skillResult: { passed: true },
    serverStartedAt: SERVER_STARTED_AT,
    isPro: false
  });
  const activeAfterProPurchase = createUpgradeTimerStatus({
    activeUpgrade: freeTimerStart.activeUpgrade,
    serverNow: "2026-05-28T10:12:00.000Z"
  });
  const nextTimerAfterPro = startUpgradeTimerAfterSkillChallenge({
    buildingRow: createBuildingRow({
      building_id: BASE_BUILDING_IDS.TREASURY,
      level: 1,
      state: BUILDING_STATES.QUIZ_REQUIRED
    }),
    skillResult: { passed: true },
    serverStartedAt: SERVER_STARTED_AT,
    isPro: true
  });

  assert.equal(activeAfterProPurchase.durationMinutes, 60);
  assert.equal(activeAfterProPurchase.remainingMinutes, 48);
  assert.equal(nextTimerAfterPro.activeUpgrade.timer_duration_minutes, 12);
});

test("Phase 15 QA verifies timer completion visually upgrades and Level 6 is max", () => {
  const completeLevelTwo = completeUpgradeTimer({
    activeUpgrade: createActiveUpgrade({
      fromLevel: 1,
      toLevel: 2,
      finishesAt: "2026-05-28T11:00:00.000Z"
    }),
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.UPGRADING
    }),
    serverNow: "2026-05-28T11:00:00.000Z"
  });
  const upgradedSlots = createBaseHomeSlots({
    buildings: [
      {
        user_id: USER_ID,
        building_id: BASE_BUILDING_IDS.ATTACK_TOWER,
        level: completeLevelTwo.buildingRow.level,
        state: completeLevelTwo.buildingRow.state
      }
    ],
    palaceLevel: 2
  });
  const upgradedAttackTower = upgradedSlots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.ATTACK_TOWER);
  const completeLevelSix = completeUpgradeTimer({
    activeUpgrade: createActiveUpgrade({
      fromLevel: 5,
      toLevel: 6,
      finishesAt: "2026-05-29T10:00:00.000Z",
      timerDurationMinutes: 1440
    }),
    buildingRow: createBuildingRow({
      level: 5,
      state: BUILDING_STATES.UPGRADING
    }),
    serverNow: "2026-05-29T10:00:00.000Z"
  });
  const maxSlots = createBaseHomeSlots({
    buildings: [
      {
        user_id: USER_ID,
        building_id: BASE_BUILDING_IDS.ATTACK_TOWER,
        level: completeLevelSix.buildingRow.level,
        state: completeLevelSix.buildingRow.state
      }
    ],
    palaceLevel: 6
  });
  const maxAttackTower = maxSlots.find((slot) => slot.buildingId === BASE_BUILDING_IDS.ATTACK_TOWER);

  assert.equal(completeLevelTwo.accepted, true);
  assert.equal(upgradedAttackTower.level, 2);
  assert.equal(upgradedAttackTower.assetKey, "/images/buildings/attack_tower_level_2.png");
  assert.equal(upgradedAttackTower.visualState.levelKey, "cleaner");
  assert.equal(completeLevelSix.buildingRow.state, BUILDING_STATES.MAX_LEVEL);
  assert.equal(maxAttackTower.state, BUILDING_STATES.MAX_LEVEL);
  assert.equal(maxAttackTower.tapResult.action, BASE_BUILDING_TAP_ACTIONS.MAX_LEVEL);
  assert.equal(maxAttackTower.isMaxLevel, true);
});

function claimCoins(outcome, isPro) {
  const claim = claimBattleResultReward({
    gameState: createDefaultGameState(USER_ID),
    existingClaims: [],
    battleResult: createBattleResult(outcome),
    userId: USER_ID,
    isPro,
    claimedAt: CLAIMED_AT
  });

  return claim.finalCoins;
}

function createBattleResult(outcome) {
  return {
    battleResultId: `phase15_${outcome}`,
    userId: USER_ID,
    outcome,
    reason: outcome === "win" ? "enemy_core_destroyed" : "timer_end",
    completedAt: "2026-05-28T09:25:00.000Z",
    elapsedSeconds: 120,
    durationSeconds: 480,
    coreMaxHp: 1000,
    playerCoreHp: outcome === "loss" ? 0 : 1000,
    enemyCoreHp: outcome === "win" ? 0 : 600,
    playerCoreDamageDealt: outcome === "win" ? 1000 : 400,
    enemyCoreDamageDealt: outcome === "loss" ? 1000 : 200
  };
}

function createBuildingRow(overrides = {}) {
  return {
    user_id: USER_ID,
    building_id: BASE_BUILDING_IDS.ATTACK_TOWER,
    level: 1,
    state: BUILDING_STATES.AVAILABLE,
    ...overrides
  };
}

function createActiveUpgrade(overrides = {}) {
  return {
    user_id: USER_ID,
    building_id: BASE_BUILDING_IDS.ATTACK_TOWER,
    from_level: overrides.fromLevel ?? 1,
    to_level: overrides.toLevel ?? 2,
    started_at: overrides.startedAt ?? SERVER_STARTED_AT,
    finishes_at: overrides.finishesAt ?? "2026-05-28T11:00:00.000Z",
    timer_duration_minutes: overrides.timerDurationMinutes ?? 60
  };
}
