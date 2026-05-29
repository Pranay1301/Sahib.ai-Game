import assert from "node:assert/strict";
import test from "node:test";

import {
  createDefaultGameState
} from "../src/base/baseBackend.js";
import {
  BASE_ECONOMY_CONFIG
} from "../src/base/baseConfig.js";
import {
  BASE_COPY_KEYS
} from "../src/base/baseLocalization.js";
import {
  BASE_REWARD_BRIDGE_REASONS,
  claimBattleResultReward,
  createBattleRewardPreview,
  formatBaseRewardNumber,
  normalizeBattleResultForBase
} from "../src/base/baseRewardBridge.js";
import {
  BASE_PRO_TOUCHPOINTS
} from "../src/base/baseSubscriptionConversion.js";

const USER_ID = "user_phase7";
const CLAIMED_AT = "2026-05-28T09:30:00.000Z";

test("Phase 7 reward preview uses documented non-Pro win, draw, and loss copy", () => {
  const winPreview = createBattleRewardPreview({
    battleResult: createBattleResult({ outcome: "win", baseCoins: 100 }),
    isPro: false,
    language: "en"
  });
  const drawPreview = createBattleRewardPreview({
    battleResult: createBattleResult({ outcome: "draw", baseCoins: 50 }),
    isPro: false,
    language: "en"
  });
  const lossPreview = createBattleRewardPreview({
    battleResult: createBattleResult({ outcome: "loss", baseCoins: 25 }),
    isPro: false,
    language: "en"
  });

  assert.equal(winPreview.finalCoins, 100);
  assert.equal(winPreview.proCoins, 300);
  assert.equal(winPreview.bodyKey, BASE_COPY_KEYS.REWARD_PREVIEW_FREE_WIN_BODY);
  assert.equal(winPreview.body, "You earned 100 coins. Sahib Pro would give you 300 coins for this win.");
  assert.equal(winPreview.proUpsell.touchpoint, BASE_PRO_TOUCHPOINTS.COIN_REWARD);
  assert.equal(winPreview.proUpsell.entitlementField, "is_pro");
  assert.equal(winPreview.proUpsell.cta, "Triple Your Battle Rewards");
  assert.equal(winPreview.proUpsell.wouldHaveEarnedCoins, 300);

  assert.equal(drawPreview.body, "You earned 50 coins. Sahib Pro would give you 150 coins for this draw.");
  assert.equal(drawPreview.proUpsell.wouldHaveEarnedCoins, 150);
  assert.equal(lossPreview.body, "You earned 25 coins. Sahib Pro would give you 75 coins for this match.");
  assert.equal(lossPreview.proUpsell.wouldHaveEarnedCoins, 75);
});

test("Pro reward preview applies 3x without showing the non-Pro upsell", () => {
  const preview = createBattleRewardPreview({
    battleResult: createBattleResult({ outcome: "win", baseCoins: 100 }),
    isPro: true,
    language: "en"
  });

  assert.equal(preview.baseCoins, 100);
  assert.equal(preview.finalCoins, 300);
  assert.equal(preview.multiplier, BASE_ECONOMY_CONFIG.proCoinMultiplier);
  assert.equal(preview.bodyKey, BASE_COPY_KEYS.REWARD_PREVIEW_PRO_BODY);
  assert.equal(preview.body, "You earned 300 coins with Sahib Pro.");
  assert.equal(preview.proUpsell, null);
});

test("Arabic reward preview uses Arabic copy and localized coin numbers", () => {
  const preview = createBattleRewardPreview({
    battleResult: createBattleResult({ outcome: "win", baseCoins: 100 }),
    isPro: false,
    language: "ar"
  });

  assert.equal(formatBaseRewardNumber(300, "ar"), "٣٠٠");
  assert.equal(preview.language, "ar");
  assert.equal(preview.body, "ربحت ١٠٠ عملة. مع Sahib Pro كنت ستحصل على ٣٠٠ عملة في هذا الفوز.");
  assert.equal(preview.proUpsell.cta, "ضاعف مكافآتك 3 مرات");
});

test("reward bridge falls back to outcome coin mapping for documented mock BattleResults", () => {
  const normalized = normalizeBattleResultForBase(
    createBattleResult({
      outcome: "draw",
      baseCoins: undefined
    })
  );

  assert.equal(normalized.baseCoins, 50);
  assert.throws(
    () => normalizeBattleResultForBase(createBattleResult({ outcome: "timeout", baseCoins: 10 })),
    /battleResult.outcome must be win, draw, or loss/
  );
});

test("zero base-coin BattleResults do not show a Pro upsell", () => {
  const preview = createBattleRewardPreview({
    battleResult: createBattleResult({ outcome: "win", baseCoins: 0 }),
    isPro: false,
    language: "en"
  });

  assert.equal(preview.hasReward, false);
  assert.equal(preview.finalCoins, 0);
  assert.equal(preview.bodyKey, BASE_COPY_KEYS.REWARD_PREVIEW_ZERO_BODY);
  assert.equal(preview.body, "This match did not award coins.");
  assert.equal(preview.proUpsell, null);
});

test("claimBattleResultReward adds coins once and blocks duplicate BattleResult claims", () => {
  const gameState = createDefaultGameState(USER_ID, { coins: 75 });
  const battleResult = createBattleResult({ outcome: "draw", baseCoins: 50 });
  const firstClaim = claimBattleResultReward({
    gameState,
    existingClaims: [],
    battleResult,
    userId: USER_ID,
    isPro: false,
    claimedAt: CLAIMED_AT,
    language: "en"
  });

  assert.equal(firstClaim.accepted, true);
  assert.equal(firstClaim.reason, BASE_REWARD_BRIDGE_REASONS.CLAIMED);
  assert.equal(firstClaim.finalCoins, 50);
  assert.equal(firstClaim.gameState.coins, 125);
  assert.equal(firstClaim.claim.base_coins, 50);
  assert.equal(firstClaim.claim.final_coins_awarded, 50);
  assert.equal(firstClaim.rewardPreview.body, "You earned 50 coins. Sahib Pro would give you 150 coins for this draw.");

  const duplicate = claimBattleResultReward({
    gameState: firstClaim.gameState,
    existingClaims: [firstClaim.claim],
    battleResult,
    userId: USER_ID,
    isPro: false,
    claimedAt: CLAIMED_AT,
    language: "en"
  });

  assert.equal(duplicate.accepted, false);
  assert.equal(duplicate.reason, BASE_REWARD_BRIDGE_REASONS.DUPLICATE_CLAIM);
  assert.equal(duplicate.finalCoins, 0);
  assert.equal(duplicate.gameState.coins, 125);
  assert.equal(duplicate.claim, null);
  assert.equal(duplicate.rewardPreview, null);
});

test("claimBattleResultReward applies Pro 3x in the base layer", () => {
  const claim = claimBattleResultReward({
    gameState: createDefaultGameState(USER_ID, { coins: 10 }),
    existingClaims: [],
    battleResult: createBattleResult({ outcome: "loss", baseCoins: 25 }),
    userId: USER_ID,
    isPro: true,
    claimedAt: CLAIMED_AT,
    language: "en"
  });

  assert.equal(claim.accepted, true);
  assert.equal(claim.finalCoins, 75);
  assert.equal(claim.gameState.coins, 85);
  assert.equal(claim.claim.final_coins_awarded, 75);
  assert.equal(claim.rewardPreview.body, "You earned 75 coins with Sahib Pro.");
  assert.equal(claim.rewardPreview.proUpsell, null);
});

test("mock BattleResult reward flow awards outcome coins and applies is_pro multiplier", () => {
  const expectedRewards = [
    { outcome: "win", baseCoins: 100, freeCoins: 100, proCoins: 300 },
    { outcome: "draw", baseCoins: 50, freeCoins: 50, proCoins: 150 },
    { outcome: "loss", baseCoins: 25, freeCoins: 25, proCoins: 75 }
  ];

  for (const reward of expectedRewards) {
    const freeClaim = claimBattleResultReward({
      gameState: createDefaultGameState(USER_ID),
      existingClaims: [],
      battleResult: createBattleResult({
        battleResultId: `mock_free_${reward.outcome}`,
        outcome: reward.outcome,
        baseCoins: reward.baseCoins
      }),
      userId: USER_ID,
      isPro: false,
      claimedAt: CLAIMED_AT
    });
    const proProfile = { is_pro: true };
    const proClaim = claimBattleResultReward({
      gameState: createDefaultGameState(USER_ID),
      existingClaims: [],
      battleResult: createBattleResult({
        battleResultId: `mock_pro_${reward.outcome}`,
        outcome: reward.outcome,
        baseCoins: reward.baseCoins
      }),
      userId: USER_ID,
      isPro: proProfile.is_pro,
      claimedAt: CLAIMED_AT
    });

    assert.equal(freeClaim.accepted, true);
    assert.equal(freeClaim.battleResult.baseCoins, reward.baseCoins);
    assert.equal(freeClaim.finalCoins, reward.freeCoins);
    assert.equal(freeClaim.gameState.coins, reward.freeCoins);
    assert.equal(freeClaim.claim.base_coins, reward.baseCoins);
    assert.equal(freeClaim.claim.final_coins_awarded, reward.freeCoins);

    assert.equal(proClaim.accepted, true);
    assert.equal(proClaim.battleResult.baseCoins, reward.baseCoins);
    assert.equal(proClaim.finalCoins, reward.proCoins);
    assert.equal(proClaim.gameState.coins, reward.proCoins);
    assert.equal(proClaim.claim.base_coins, reward.baseCoins);
    assert.equal(proClaim.claim.final_coins_awarded, reward.proCoins);
  }
});

function createBattleResult(overrides = {}) {
  const outcome = overrides.outcome ?? "win";
  const result = {
    battleResultId: overrides.battleResultId ?? `battle_result_${outcome}`,
    userId: USER_ID,
    outcome,
    reason: overrides.reason ?? "enemy_core_destroyed",
    completedAt: "2026-05-28T09:00:00.000Z",
    elapsedSeconds: 120,
    durationSeconds: 480,
    coreMaxHp: 1000,
    playerCoreHp: 1000,
    enemyCoreHp: 0,
    playerCoreDamageDealt: 1000,
    enemyCoreDamageDealt: 0
  };

  if (Object.prototype.hasOwnProperty.call(overrides, "baseCoins")) {
    result.baseCoins = overrides.baseCoins;
  } else {
    result.baseCoins = 100;
  }

  return result;
}
