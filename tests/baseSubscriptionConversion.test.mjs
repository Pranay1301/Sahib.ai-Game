import assert from "node:assert/strict";
import test from "node:test";

import {
  BASE_COPY_KEYS
} from "../src/base/baseLocalization.js";
import {
  BASE_PRO_ENTITLEMENT_FIELD,
  BASE_PRO_ENTITLEMENT_ID,
  BASE_PRO_TIMER_SPEEDUP_PERCENT,
  BASE_PRO_TOUCHPOINTS,
  BASE_PRO_TOUCHPOINT_CONFIG,
  createFirstUpgradeProConversion,
  createMainProScreenViewModel,
  createProBenefitSummary,
  createProConversionViewModel
} from "../src/base/baseSubscriptionConversion.js";

test("Phase 13 subscription constants keep RevenueCat as entitlement-only", () => {
  const benefits = createProBenefitSummary();

  assert.equal(BASE_PRO_ENTITLEMENT_FIELD, "is_pro");
  assert.equal(BASE_PRO_ENTITLEMENT_ID, "sahib_pro");
  assert.equal(BASE_PRO_TIMER_SPEEDUP_PERCENT, 80);
  assert.deepEqual(benefits, {
    unlimitedQuickBattles: true,
    coinMultiplier: 3,
    timerSpeedupPercent: 80,
    futureTimersOnly: true,
    skillChallengesRequired: true,
    noPayToWin: true,
    noInstantBuildCompletion: true
  });
  assert.equal(Object.keys(BASE_PRO_TOUCHPOINT_CONFIG).includes("login_popup"), false);
});

test("launch offer framing is limited to hearts finished and main Pro screen", () => {
  assert.equal(BASE_PRO_TOUCHPOINT_CONFIG[BASE_PRO_TOUCHPOINTS.HEARTS_FINISHED].launchOffer, true);
  assert.equal(BASE_PRO_TOUCHPOINT_CONFIG[BASE_PRO_TOUCHPOINTS.MAIN_PRO_SCREEN].launchOffer, true);
  assert.equal(BASE_PRO_TOUCHPOINT_CONFIG[BASE_PRO_TOUCHPOINTS.COIN_REWARD].launchOffer, false);
  assert.equal(BASE_PRO_TOUCHPOINT_CONFIG[BASE_PRO_TOUCHPOINTS.LOCKED_BUILDING].launchOffer, false);
  assert.equal(BASE_PRO_TOUCHPOINT_CONFIG[BASE_PRO_TOUCHPOINTS.UPGRADE_MODAL].launchOffer, false);
  assert.equal(BASE_PRO_TOUCHPOINT_CONFIG[BASE_PRO_TOUCHPOINTS.TIMER_STARTED].launchOffer, false);
  assert.equal(BASE_PRO_TOUCHPOINT_CONFIG[BASE_PRO_TOUCHPOINTS.FIRST_UPGRADE_COMPLETE].launchOffer, false);
});

test("hearts-finished conversion uses documented harder paywall copy", () => {
  const conversion = createProConversionViewModel({
    touchpoint: BASE_PRO_TOUCHPOINTS.HEARTS_FINISHED
  });

  assert.equal(conversion.entitlementField, "is_pro");
  assert.equal(conversion.entitlementId, "sahib_pro");
  assert.equal(conversion.type, "harder_paywall");
  assert.equal(conversion.title, "Launch Offer");
  assert.equal(conversion.body, "You used your free full-reward battles. Go Pro to continue playing without the 30-minute wait.");
  assert.equal(conversion.cta, "Play Unlimited");
  assert.equal(conversion.benefits.noPayToWin, true);
});

test("locked, timer-started, and first-upgrade touchpoints use localized Pro copy", () => {
  const locked = createProConversionViewModel({
    touchpoint: BASE_PRO_TOUCHPOINTS.LOCKED_BUILDING
  });
  const timerStarted = createProConversionViewModel({
    touchpoint: BASE_PRO_TOUCHPOINTS.TIMER_STARTED
  });
  const firstUpgrade = createProConversionViewModel({
    touchpoint: BASE_PRO_TOUCHPOINTS.FIRST_UPGRADE_COMPLETE
  });

  assert.equal(locked.bodyKey, BASE_COPY_KEYS.PRO_CONVERSION_LOCKED_BODY);
  assert.equal(locked.cta, "Unlock Faster");
  assert.equal(timerStarted.body, "Your upgrade has started. Sahib Pro reduces future build timers by 80%.");
  assert.equal(timerStarted.cta, "Speed Up with Pro");
  assert.equal(firstUpgrade.body, "Your kingdom is growing. Sahib Pro helps you keep upgrading faster.");
  assert.equal(firstUpgrade.cta, "Upgrade Faster");
  assert.equal(createProConversionViewModel({
    touchpoint: BASE_PRO_TOUCHPOINTS.LOCKED_BUILDING,
    isPro: true
  }), null);
});

test("main Pro screen model includes benefits, comparison, launch badge, and trust note", () => {
  const screen = createMainProScreenViewModel({
    profile: { is_pro: false, language: "en" }
  });

  assert.equal(screen.touchpoint, BASE_PRO_TOUCHPOINTS.MAIN_PRO_SCREEN);
  assert.equal(screen.launchOffer, true);
  assert.equal(screen.launchBadge, "Founding Member");
  assert.equal(screen.title, "Become a Founding Sahib Pro Member. Play more battles, earn more coins, build faster, and join players worldwide in the skill-economy movement.");
  assert.equal(screen.cta, "Start Sahib Pro");
  assert.equal(screen.benefitCards.length, 4);
  assert.equal(screen.comparisonRows.length, 5);
  assert.equal(screen.comparisonRows.find((row) => row.id === "pay_to_win").pro, "No");
  assert.equal(screen.trustNote, "No pay-to-win. Skill challenges still matter.");
});

test("first successful upgrade conversion is one-time and free-user only", () => {
  const gameState = {
    coins: 10,
    has_seen_first_upgrade_pro_message: false
  };
  const first = createFirstUpgradeProConversion({
    gameState,
    isPro: false
  });
  const second = createFirstUpgradeProConversion({
    gameState: first.gameState,
    isPro: false
  });
  const pro = createFirstUpgradeProConversion({
    gameState,
    isPro: true
  });

  assert.equal(first.shouldShow, true);
  assert.equal(first.gameState.has_seen_first_upgrade_pro_message, true);
  assert.equal(first.proConversion.touchpoint, BASE_PRO_TOUCHPOINTS.FIRST_UPGRADE_COMPLETE);
  assert.equal(second.shouldShow, false);
  assert.equal(second.proConversion, null);
  assert.equal(pro.shouldShow, false);
  assert.equal(pro.gameState, gameState);
});
