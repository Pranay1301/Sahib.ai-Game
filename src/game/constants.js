export const MATCH_DURATION_SECONDS = 8 * 60;
export const CORE_MAX_HP = 1000;

export const CORE_IDS = Object.freeze({
  PLAYER: "player",
  ENEMY: "enemy"
});

export const MATCH_STATUS = Object.freeze({
  READY: "ready",
  RUNNING: "running",
  PAUSED: "paused",
  ENDED: "ended"
});

export const MATCH_OUTCOMES = Object.freeze({
  WIN: "win",
  LOSS: "loss",
  DRAW: "draw"
});
