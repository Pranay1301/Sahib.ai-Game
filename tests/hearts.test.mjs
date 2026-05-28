import assert from "node:assert/strict";
import test from "node:test";

import {
  HEART_REFILL_SECONDS,
  HEART_REWARD_MODES,
  createHeartState,
  consumeHeartForQuickRound,
  tickHearts
} from "../src/game/hearts.js";

test("quick-round hearts consume one full-reward match heart", () => {
  const consumed = consumeHeartForQuickRound(createHeartState());

  assert.equal(consumed.consumed, true);
  assert.equal(consumed.rewardMode, HEART_REWARD_MODES.FULL_REWARD);
  assert.equal(consumed.hearts.hearts, 3);
  assert.equal(consumed.hearts.refillRemainingSeconds, 0);
});

test("heart refill timer starts when the fourth free heart is consumed", () => {
  const consumed = consumeHeartForQuickRound(createHeartState({ hearts: 1 }));

  assert.equal(consumed.hearts.hearts, 0);
  assert.equal(consumed.hearts.refillRemainingSeconds, HEART_REFILL_SECONDS);
});

test("all hearts refill together after 30 minutes", () => {
  const empty = createHeartState({
    hearts: 0,
    refillRemainingSeconds: HEART_REFILL_SECONDS
  });
  const refilled = tickHearts(empty, HEART_REFILL_SECONDS);

  assert.equal(refilled.hearts, refilled.maxHearts);
  assert.equal(refilled.refillRemainingSeconds, 0);
});

test("starting without hearts marks the match as no-full-reward", () => {
  const empty = createHeartState({
    hearts: 0,
    refillRemainingSeconds: HEART_REFILL_SECONDS
  });
  const result = consumeHeartForQuickRound(empty);

  assert.equal(result.consumed, false);
  assert.equal(result.rewardMode, HEART_REWARD_MODES.NO_FULL_REWARD);
  assert.equal(result.hearts.hearts, 0);
});

test("unlimited full reward mode does not consume hearts", () => {
  const state = createHeartState({
    hearts: 0,
    unlimitedFullReward: true
  });
  const result = consumeHeartForQuickRound(state);

  assert.equal(result.consumed, false);
  assert.equal(result.rewardMode, HEART_REWARD_MODES.FULL_REWARD);
  assert.equal(result.hearts, state);
});
