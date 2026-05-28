export const HEART_REWARD_MODES = Object.freeze({
  FULL_REWARD: "full_reward",
  NO_FULL_REWARD: "no_full_reward"
});

export const HEARTS_MAX = 4;
export const HEART_REFILL_SECONDS = 30 * 60;

export function createHeartState(overrides = {}) {
  return {
    hearts: HEARTS_MAX,
    maxHearts: HEARTS_MAX,
    refillRemainingSeconds: 0,
    unlimitedFullReward: false,
    ...overrides
  };
}

export function tickHearts(state, deltaSeconds) {
  if (state.unlimitedFullReward || state.hearts > 0) {
    return state.refillRemainingSeconds === 0
      ? state
      : {
          ...state,
          refillRemainingSeconds: 0
        };
  }

  const safeDelta = Math.max(0, Number(deltaSeconds) || 0);
  if (safeDelta === 0 || state.refillRemainingSeconds <= 0) {
    return state;
  }

  const refillRemainingSeconds = Math.max(0, state.refillRemainingSeconds - safeDelta);
  if (refillRemainingSeconds > 0) {
    return {
      ...state,
      refillRemainingSeconds
    };
  }

  return {
    ...state,
    hearts: state.maxHearts,
    refillRemainingSeconds: 0
  };
}

export function consumeHeartForQuickRound(state) {
  if (state.unlimitedFullReward) {
    return {
      hearts: state,
      rewardMode: HEART_REWARD_MODES.FULL_REWARD,
      consumed: false
    };
  }

  if (state.hearts <= 0) {
    return {
      hearts: ensureRefillTimer(state),
      rewardMode: HEART_REWARD_MODES.NO_FULL_REWARD,
      consumed: false
    };
  }

  const hearts = Math.max(0, state.hearts - 1);
  return {
    hearts: {
      ...state,
      hearts,
      refillRemainingSeconds:
        hearts === 0 ? HEART_REFILL_SECONDS : state.refillRemainingSeconds
    },
    rewardMode: HEART_REWARD_MODES.FULL_REWARD,
    consumed: true
  };
}

function ensureRefillTimer(state) {
  if (state.refillRemainingSeconds > 0) {
    return state;
  }

  return {
    ...state,
    refillRemainingSeconds: HEART_REFILL_SECONDS
  };
}
