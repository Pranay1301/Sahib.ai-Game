import assert from "node:assert/strict";
import test from "node:test";

import { CORE_IDS, MATCH_OUTCOMES, MATCH_STATUS } from "../src/game/constants.js";
import {
  HEART_REWARD_MODES,
  createHeartState,
  consumeHeartForQuickRound,
  tickHearts
} from "../src/game/hearts.js";
import {
  createMatchState,
  damageCore,
  recordEnemyKills,
  startMatch,
  tickMatch
} from "../src/game/matchState.js";
import { createBattleResult } from "../src/game/quickRoundResult.js";

test("Phase 14 V1 loop can consume a heart, win, and create a flat BattleResult", () => {
  const heartUse = consumeHeartForQuickRound(createHeartState());
  let match = startMatch(createMatchState({ matchId: "phase14_win_match" }));
  match = recordEnemyKills(match, 4);
  match = damageCore(match, CORE_IDS.ENEMY, 1000);

  const result = createBattleResult(match, {
    battleResultId: "phase14_win_result",
    rewardMode: heartUse.rewardMode,
    completedAt: "2026-05-26T00:00:00.000Z"
  });

  assert.equal(heartUse.hearts.hearts, 3);
  assert.equal(match.status, MATCH_STATUS.ENDED);
  assert.equal(result.outcome, MATCH_OUTCOMES.WIN);
  assert.equal(result.baseCoins, 100);
  assert.equal(result.completedAt, "2026-05-26T00:00:00.000Z");
});

test("Phase 14 V1 loop can end by timer and produce a draw result", () => {
  const match = tickMatch(
    createMatchState({
      matchId: "phase14_draw_match",
      status: MATCH_STATUS.RUNNING,
      elapsedSeconds: 479,
      playerCoreHp: 900,
      enemyCoreHp: 900,
      playerCoreDamageDealt: 100,
      enemyCoreDamageDealt: 100
    }),
    1
  );
  const result = createBattleResult(match, {
    battleResultId: "phase14_draw_result",
    completedAt: "2026-05-26T00:00:00.000Z"
  });

  assert.equal(match.result.outcome, MATCH_OUTCOMES.DRAW);
  assert.equal(result.baseCoins, 50);
});

test("Phase 14 hearts refill together and no-heart matches generate zero base coins", () => {
  let hearts = createHeartState();
  let rewardMode = HEART_REWARD_MODES.FULL_REWARD;

  for (let index = 0; index < 4; index += 1) {
    const consumed = consumeHeartForQuickRound(hearts);
    hearts = consumed.hearts;
    rewardMode = consumed.rewardMode;
  }

  const noHeartStart = consumeHeartForQuickRound(hearts);
  const ended = damageCore(
    startMatch(createMatchState({ matchId: "phase14_no_heart_match" })),
    CORE_IDS.ENEMY,
    1000
  );
  const result = createBattleResult(ended, {
    battleResultId: "phase14_no_heart_result",
    rewardMode: noHeartStart.rewardMode,
    completedAt: "2026-05-26T00:00:00.000Z"
  });
  const refilled = tickHearts(noHeartStart.hearts, noHeartStart.hearts.refillRemainingSeconds);

  assert.equal(rewardMode, HEART_REWARD_MODES.FULL_REWARD);
  assert.equal(noHeartStart.rewardMode, HEART_REWARD_MODES.NO_FULL_REWARD);
  assert.equal(result.baseCoins, 0);
  assert.equal(refilled.hearts, refilled.maxHearts);
});
