import assert from "node:assert/strict";
import test from "node:test";

import { CORE_IDS, MATCH_OUTCOMES, MATCH_STATUS } from "../src/game/constants.js";
import {
  createMatchState,
  damageCore,
  formatTime,
  getRemainingSeconds,
  pauseForAppInterruption,
  recordEnemyKills,
  startMatch,
  tickMatch
} from "../src/game/matchState.js";

test("match starts with 8 minutes and 1000 HP cores", () => {
  const match = startMatch(createMatchState());

  assert.equal(match.status, MATCH_STATUS.RUNNING);
  assert.equal(formatTime(getRemainingSeconds(match)), "08:00");
  assert.equal(match.playerCoreHp, 1000);
  assert.equal(match.enemyCoreHp, 1000);
});

test("destroying Enemy Core ends match as an instant win", () => {
  let match = startMatch(createMatchState());
  match = damageCore(match, CORE_IDS.ENEMY, 1000);

  assert.equal(match.status, MATCH_STATUS.ENDED);
  assert.equal(match.result.outcome, MATCH_OUTCOMES.WIN);
  assert.equal(match.result.reason, "enemy_core_destroyed");
});

test("destroying Player Core ends match as an instant loss", () => {
  let match = startMatch(createMatchState());
  match = damageCore(match, CORE_IDS.PLAYER, 1000);

  assert.equal(match.status, MATCH_STATUS.ENDED);
  assert.equal(match.result.outcome, MATCH_OUTCOMES.LOSS);
  assert.equal(match.result.reason, "player_core_destroyed");
});

test("timer end compares remaining Core HP percentage first", () => {
  let match = startMatch(createMatchState());
  match = damageCore(match, CORE_IDS.ENEMY, 300);
  match = damageCore(match, CORE_IDS.PLAYER, 100);
  match = tickMatch(match, 480);

  assert.equal(match.status, MATCH_STATUS.ENDED);
  assert.equal(match.result.outcome, MATCH_OUTCOMES.WIN);
  assert.equal(match.result.reason, "timer_core_hp_percent");
});

test("timer end uses total Core damage dealt when Core HP percentages match", () => {
  const match = createMatchState({
    status: MATCH_STATUS.RUNNING,
    elapsedSeconds: 479,
    playerCoreHp: 800,
    enemyCoreHp: 800,
    playerCoreDamageDealt: 260,
    enemyCoreDamageDealt: 200
  });

  const ended = tickMatch(match, 1);

  assert.equal(ended.status, MATCH_STATUS.ENDED);
  assert.equal(ended.result.outcome, MATCH_OUTCOMES.WIN);
  assert.equal(ended.result.reason, "timer_core_damage_dealt");
});

test("timer end can draw without sudden death", () => {
  const match = createMatchState({
    status: MATCH_STATUS.RUNNING,
    elapsedSeconds: 479,
    playerCoreHp: 750,
    enemyCoreHp: 750,
    playerCoreDamageDealt: 250,
    enemyCoreDamageDealt: 250
  });

  const ended = tickMatch(match, 1);

  assert.equal(ended.status, MATCH_STATUS.ENDED);
  assert.equal(ended.result.outcome, MATCH_OUTCOMES.DRAW);
  assert.equal(ended.result.reason, "timer_full_tie");
});

test("app interruption auto-pauses a running match", () => {
  const running = startMatch(createMatchState());
  const paused = pauseForAppInterruption(running);

  assert.equal(paused.status, MATCH_STATUS.PAUSED);
  assert.equal(paused.elapsedSeconds, running.elapsedSeconds);
  assert.equal(paused.playerCoreHp, running.playerCoreHp);
  assert.equal(paused.enemyCoreHp, running.enemyCoreHp);
});

test("app interruption does not change non-running matches", () => {
  const ready = createMatchState();

  assert.equal(pauseForAppInterruption(ready), ready);
});

test("match state records defeated enemies for analytics", () => {
  const running = startMatch(createMatchState());
  const scored = recordEnemyKills(running, 3);

  assert.equal(scored.enemiesKilled, 3);
  assert.equal(recordEnemyKills(scored, 0), scored);
});
