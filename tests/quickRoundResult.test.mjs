import assert from "node:assert/strict";
import test from "node:test";

import { MATCH_OUTCOMES, MATCH_STATUS } from "../src/game/constants.js";
import { HEART_REWARD_MODES } from "../src/game/hearts.js";
import { createMatchState } from "../src/game/matchState.js";
import {
  BASE_COIN_REWARDS,
  createBattleResult,
  createBattleResultFromEndedMatch
} from "../src/game/quickRoundResult.js";

const BATTLE_RESULT_FIELDS = [
  "battleResultId",
  "userId",
  "outcome",
  "reason",
  "baseCoins",
  "completedAt",
  "elapsedSeconds",
  "durationSeconds",
  "coreMaxHp",
  "playerCoreHp",
  "enemyCoreHp",
  "playerCoreDamageDealt",
  "enemyCoreDamageDealt"
].sort();

test("BattleResult uses the current coins-only integration contract", () => {
  const match = createEndedMatch({
    outcome: MATCH_OUTCOMES.WIN,
    reason: "enemy_core_destroyed",
    playerCoreDamageDealt: 700,
    enemyCoreDamageDealt: 120,
    enemiesKilled: 3,
    elapsedSeconds: 420
  });
  const result = createBattleResult(match, {
    battleResultId: "battle_result_test",
    userId: "user_test",
    completedAt: "2026-05-26T00:00:00.000Z"
  });

  assert.deepEqual(Object.keys(result).sort(), BATTLE_RESULT_FIELDS);
  assert.equal(result.battleResultId, "battle_result_test");
  assert.equal(result.userId, "user_test");
  assert.equal(result.outcome, MATCH_OUTCOMES.WIN);
  assert.equal(result.reason, "enemy_core_destroyed");
  assert.equal(result.baseCoins, BASE_COIN_REWARDS[MATCH_OUTCOMES.WIN]);
  assert.equal(result.completedAt, "2026-05-26T00:00:00.000Z");
  assert.equal(result.elapsedSeconds, 420);
  assert.equal(result.durationSeconds, 480);
  assert.equal(result.coreMaxHp, 1000);
  assert.equal(result.playerCoreHp, 1000);
  assert.equal(result.enemyCoreHp, 1000);
  assert.equal(result.playerCoreDamageDealt, 700);
  assert.equal(result.enemyCoreDamageDealt, 120);
});

test("BattleResult uses fixed base coin rewards for loss and draw", () => {
  const loss = createBattleResult(
    createEndedMatch({ outcome: MATCH_OUTCOMES.LOSS, reason: "player_core_destroyed" })
  );
  const draw = createBattleResult(
    createEndedMatch({ outcome: MATCH_OUTCOMES.DRAW, reason: "timer_full_tie" })
  );

  assert.equal(loss.baseCoins, BASE_COIN_REWARDS[MATCH_OUTCOMES.LOSS]);
  assert.equal(draw.baseCoins, BASE_COIN_REWARDS[MATCH_OUTCOMES.DRAW]);
});

test("createBattleResultFromEndedMatch exposes the documented integration adapter", () => {
  const result = createBattleResultFromEndedMatch(
    createEndedMatch({
      outcome: MATCH_OUTCOMES.WIN,
      reason: "timer_core_damage_dealt",
      playerCoreDamageDealt: 520
    }),
    "user_test",
    {
      battleResultId: "battle_result_adapter",
      completedAt: "2026-05-28T00:00:00.000Z"
    }
  );

  assert.equal(result.battleResultId, "battle_result_adapter");
  assert.equal(result.userId, "user_test");
  assert.equal(result.outcome, MATCH_OUTCOMES.WIN);
  assert.equal(result.reason, "timer_core_damage_dealt");
  assert.equal(result.baseCoins, BASE_COIN_REWARDS[MATCH_OUTCOMES.WIN]);
  assert.equal(result.completedAt, "2026-05-28T00:00:00.000Z");
  assert.equal(result.playerCoreDamageDealt, 520);
});

test("createBattleResultFromEndedMatch rejects non-ended matches", () => {
  assert.throws(
    () => createBattleResultFromEndedMatch(createMatchState({ status: MATCH_STATUS.RUNNING }), "user_test"),
    /Cannot create BattleResult before match ends/
  );
  assert.throws(
    () => createBattleResultFromEndedMatch(createEndedMatch(), ""),
    /userId must be a non-empty string/
  );
});

test("BattleResult returns zero base coins for no-full-reward matches", () => {
  const result = createBattleResult(
    createEndedMatch({ outcome: MATCH_OUTCOMES.WIN, reason: "enemy_core_destroyed" }),
    { rewardMode: HEART_REWARD_MODES.NO_FULL_REWARD }
  );

  assert.equal(result.baseCoins, 0);
});

test("BattleResult is null until the match has a result", () => {
  const result = createBattleResult(
    createMatchState({ status: MATCH_STATUS.RUNNING })
  );

  assert.equal(result, null);
});

function createEndedMatch(overrides = {}) {
  const outcome = overrides.outcome ?? MATCH_OUTCOMES.WIN;
  const reason = overrides.reason ?? "enemy_core_destroyed";

  return createMatchState({
    matchId: "match_test",
    status: MATCH_STATUS.ENDED,
    result: {
      outcome,
      reason
    },
    elapsedSeconds: 420,
    ...overrides
  });
}
