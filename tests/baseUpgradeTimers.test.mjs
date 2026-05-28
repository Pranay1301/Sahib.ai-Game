import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_BUILDING_IDS,
  BUILDING_STATES
} from "../src/base/baseConfig.js";
import {
  createDefaultGameState
} from "../src/base/baseBackend.js";
import {
  BASE_UPGRADE_TIMER_REASONS,
  completeUpgradeTimer,
  createUpgradeTimerStatus,
  createUpgradeTimerViewModel,
  getActiveUpgrade,
  hasActiveUpgrade,
  startBuildingUpgradeChallenge,
  startUpgradeTimerAfterSkillChallenge
} from "../src/base/baseUpgradeTimers.js";
import {
  BASE_PRO_TOUCHPOINTS
} from "../src/base/baseSubscriptionConversion.js";

const USER_ID = "user_phase10";
const SERVER_STARTED_AT = "2026-05-28T10:00:00.000Z";

test("Phase 10 upgrade challenge start deducts coins and enters quiz_required", () => {
  const gameState = createDefaultGameState(USER_ID, { coins: 3000 });
  const result = startBuildingUpgradeChallenge({
    gameState,
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.AVAILABLE
    })
  });

  assert.equal(result.accepted, true);
  assert.equal(result.reason, BASE_UPGRADE_TIMER_REASONS.CHALLENGE_STARTED);
  assert.equal(result.coinCost, 3000);
  assert.equal(result.targetLevel, 2);
  assert.equal(result.gameState.coins, 0);
  assert.equal(result.buildingRow.level, 1);
  assert.equal(result.buildingRow.state, BUILDING_STATES.QUIZ_REQUIRED);
});

test("upgrade challenge start rejects insufficient coins and active upgrade conflicts", () => {
  const buildingRow = createBuildingRow({
    level: 2,
    state: BUILDING_STATES.AVAILABLE
  });
  const insufficient = startBuildingUpgradeChallenge({
    gameState: createDefaultGameState(USER_ID, { coins: 7999 }),
    buildingRow
  });
  const activeConflict = startBuildingUpgradeChallenge({
    gameState: createDefaultGameState(USER_ID, { coins: 8000 }),
    buildingRow,
    existingActiveUpgrades: [
      createActiveUpgrade({
        buildingId: BASE_BUILDING_IDS.PALACE
      })
    ]
  });

  assert.equal(insufficient.accepted, false);
  assert.equal(insufficient.reason, BASE_UPGRADE_TIMER_REASONS.INSUFFICIENT_COINS);
  assert.equal(insufficient.gameState.coins, 7999);
  assert.equal(insufficient.buildingRow.state, BUILDING_STATES.AVAILABLE);
  assert.equal(activeConflict.accepted, false);
  assert.equal(activeConflict.reason, BASE_UPGRADE_TIMER_REASONS.ACTIVE_UPGRADE_EXISTS);
});

test("timer starts only after a passed skill challenge and uses server timestamps", () => {
  const failed = startUpgradeTimerAfterSkillChallenge({
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.QUIZ_REQUIRED
    }),
    skillResult: { passed: false },
    serverStartedAt: SERVER_STARTED_AT
  });
  const started = startUpgradeTimerAfterSkillChallenge({
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.QUIZ_REQUIRED
    }),
    skillResult: { passed: true },
    serverStartedAt: SERVER_STARTED_AT,
    isPro: false
  });

  assert.equal(failed.accepted, false);
  assert.equal(failed.reason, BASE_UPGRADE_TIMER_REASONS.SKILL_CHALLENGE_NOT_PASSED);
  assert.equal(failed.buildingRow.state, BUILDING_STATES.QUIZ_REQUIRED);
  assert.equal(started.accepted, true);
  assert.equal(started.reason, BASE_UPGRADE_TIMER_REASONS.TIMER_STARTED);
  assert.equal(started.activeUpgrade.started_at, SERVER_STARTED_AT);
  assert.equal(started.activeUpgrade.finishes_at, "2026-05-28T11:00:00.000Z");
  assert.equal(started.activeUpgrade.timer_duration_minutes, 60);
  assert.equal(started.buildingRow.state, BUILDING_STATES.UPGRADING);
  assert.equal(started.proConversion.touchpoint, BASE_PRO_TOUCHPOINTS.TIMER_STARTED);
  assert.equal(started.proConversion.cta, "Speed Up with Pro");
  assert.equal(started.timerStatus.remainingMinutes, 60);
  assert.throws(
    () => startUpgradeTimerAfterSkillChallenge({
      buildingRow: createBuildingRow({ state: BUILDING_STATES.QUIZ_REQUIRED }),
      skillResult: { passed: true }
    }),
    /serverStartedAt must be a non-empty string/
  );
});

test("one active upgrade blocks another timer from starting", () => {
  const result = startUpgradeTimerAfterSkillChallenge({
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.QUIZ_REQUIRED
    }),
    skillResult: { passed: true },
    existingActiveUpgrades: [
      createActiveUpgrade({
        buildingId: BASE_BUILDING_IDS.PALACE
      })
    ],
    serverStartedAt: SERVER_STARTED_AT
  });

  assert.equal(result.accepted, false);
  assert.equal(result.reason, BASE_UPGRADE_TIMER_REASONS.ACTIVE_UPGRADE_EXISTS);
  assert.equal(result.activeUpgrade, null);
});

test("active timer duration stays locked if Pro status changes after start", () => {
  const freeStart = startUpgradeTimerAfterSkillChallenge({
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.QUIZ_REQUIRED
    }),
    skillResult: { passed: true },
    serverStartedAt: SERVER_STARTED_AT,
    isPro: false
  });
  const freeTimerAfterProPurchase = createUpgradeTimerStatus({
    activeUpgrade: freeStart.activeUpgrade,
    serverNow: "2026-05-28T10:12:00.000Z"
  });
  const proStart = startUpgradeTimerAfterSkillChallenge({
    buildingRow: createBuildingRow({
      level: 1,
      state: BUILDING_STATES.QUIZ_REQUIRED,
      building_id: BASE_BUILDING_IDS.TREASURY
    }),
    skillResult: { passed: true },
    serverStartedAt: SERVER_STARTED_AT,
    isPro: true
  });

  assert.equal(freeStart.activeUpgrade.timer_duration_minutes, 60);
  assert.equal(freeTimerAfterProPurchase.durationMinutes, 60);
  assert.equal(freeTimerAfterProPurchase.remainingMinutes, 48);
  assert.equal(freeTimerAfterProPurchase.progress, 0.2);
  assert.equal(proStart.activeUpgrade.timer_duration_minutes, 12);
  assert.equal(proStart.activeUpgrade.finishes_at, "2026-05-28T10:12:00.000Z");
  assert.equal(proStart.proConversion, null);
});

test("timer view model reports progress and completion from serverNow only", () => {
  const activeUpgrade = createActiveUpgrade({
    fromLevel: 1,
    toLevel: 2,
    startedAt: SERVER_STARTED_AT,
    finishesAt: "2026-05-28T11:00:00.000Z",
    timerDurationMinutes: 60
  });
  const midway = createUpgradeTimerViewModel({
    activeUpgrade,
    serverNow: "2026-05-28T10:30:00.000Z"
  });
  const complete = createUpgradeTimerViewModel({
    activeUpgrade,
    serverNow: "2026-05-28T11:05:00.000Z"
  });

  assert.equal(midway.remainingMinutes, 30);
  assert.equal(midway.elapsedMinutes, 30);
  assert.equal(midway.progressPercent, 50);
  assert.equal(midway.isComplete, false);
  assert.equal(complete.remainingMinutes, 0);
  assert.equal(complete.progressPercent, 100);
  assert.equal(complete.isComplete, true);
});

test("completing timer upgrades building level and clears active upgrade", () => {
  const buildingRow = createBuildingRow({
    level: 1,
    state: BUILDING_STATES.UPGRADING
  });
  const activeUpgrade = createActiveUpgrade({
    fromLevel: 1,
    toLevel: 2
  });
  const tooEarly = completeUpgradeTimer({
    activeUpgrade,
    buildingRow,
    serverNow: "2026-05-28T10:59:00.000Z"
  });
  const complete = completeUpgradeTimer({
    activeUpgrade,
    buildingRow,
    serverNow: "2026-05-28T11:00:00.000Z"
  });

  assert.equal(tooEarly.accepted, false);
  assert.equal(tooEarly.reason, BASE_UPGRADE_TIMER_REASONS.TIMER_NOT_COMPLETE);
  assert.equal(tooEarly.buildingRow.state, BUILDING_STATES.UPGRADING);
  assert.equal(complete.accepted, true);
  assert.equal(complete.reason, BASE_UPGRADE_TIMER_REASONS.UPGRADE_COMPLETED);
  assert.equal(complete.activeUpgrade, null);
  assert.equal(complete.clearedActiveUpgrade, true);
  assert.equal(complete.buildingRow.level, 2);
  assert.equal(complete.buildingRow.state, BUILDING_STATES.AVAILABLE);
});

test("completed Level 6 upgrades enter max_level", () => {
  const complete = completeUpgradeTimer({
    activeUpgrade: createActiveUpgrade({
      fromLevel: 5,
      toLevel: 6,
      timerDurationMinutes: 1440,
      finishesAt: "2026-05-29T10:00:00.000Z"
    }),
    buildingRow: createBuildingRow({
      level: 5,
      state: BUILDING_STATES.UPGRADING
    }),
    serverNow: "2026-05-29T10:00:00.000Z"
  });

  assert.equal(complete.accepted, true);
  assert.equal(complete.buildingRow.level, 6);
  assert.equal(complete.buildingRow.state, BUILDING_STATES.MAX_LEVEL);
});

test("active upgrade helpers are user scoped", () => {
  const activeUpgrade = createActiveUpgrade();
  const otherUpgrade = createActiveUpgrade({
    userId: "other_user"
  });

  assert.equal(getActiveUpgrade([otherUpgrade], USER_ID), null);
  assert.equal(getActiveUpgrade([otherUpgrade, activeUpgrade], USER_ID), activeUpgrade);
  assert.equal(hasActiveUpgrade([otherUpgrade], USER_ID), false);
  assert.equal(hasActiveUpgrade([otherUpgrade, activeUpgrade], USER_ID), true);
});

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
    user_id: overrides.userId ?? USER_ID,
    building_id: overrides.buildingId ?? BASE_BUILDING_IDS.ATTACK_TOWER,
    from_level: overrides.fromLevel ?? 1,
    to_level: overrides.toLevel ?? 2,
    started_at: overrides.startedAt ?? SERVER_STARTED_AT,
    finishes_at: overrides.finishesAt ?? "2026-05-28T11:00:00.000Z",
    timer_duration_minutes: overrides.timerDurationMinutes ?? 60
  };
}
