import { MATCH_OUTCOMES, MATCH_STATUS } from "./constants.js";
import { HEART_REWARD_MODES } from "./hearts.js";

export const BASE_COIN_REWARDS = Object.freeze({
  [MATCH_OUTCOMES.WIN]: 100,
  [MATCH_OUTCOMES.DRAW]: 50,
  [MATCH_OUTCOMES.LOSS]: 25
});

let nextBattleResultNumber = 1;

export function createBattleResult(match, options = {}) {
  if (!match?.result) {
    return null;
  }

  const outcome = match.result.outcome;
  const rewardMode = options.rewardMode ?? HEART_REWARD_MODES.FULL_REWARD;
  const hasFullReward = rewardMode === HEART_REWARD_MODES.FULL_REWARD;
  const completedAt = options.completedAt ?? new Date().toISOString();

  return {
    battleResultId: options.battleResultId ?? createLocalBattleResultId(),
    userId: options.userId ?? null,
    outcome,
    reason: match.result.reason,
    baseCoins: hasFullReward ? BASE_COIN_REWARDS[outcome] ?? 0 : 0,
    completedAt,
    elapsedSeconds: Math.round(match.elapsedSeconds ?? 0),
    durationSeconds: Math.round(match.durationSeconds ?? 0),
    coreMaxHp: Math.round(match.coreMaxHp ?? 0),
    playerCoreHp: Math.round(match.playerCoreHp ?? 0),
    enemyCoreHp: Math.round(match.enemyCoreHp ?? 0),
    playerCoreDamageDealt: Math.round(match.playerCoreDamageDealt ?? 0),
    enemyCoreDamageDealt: Math.round(match.enemyCoreDamageDealt ?? 0)
  };
}

export function createBattleResultFromEndedMatch(match, userId, options = {}) {
  if (match?.status !== MATCH_STATUS.ENDED) {
    throw new Error("Cannot create BattleResult before match ends");
  }

  if (typeof userId !== "string" || userId.length === 0) {
    throw new TypeError("userId must be a non-empty string");
  }

  return createBattleResult(match, {
    ...options,
    userId
  });
}

function createLocalBattleResultId() {
  const id = `local_battle_result_${nextBattleResultNumber}`;
  nextBattleResultNumber += 1;
  return id;
}
