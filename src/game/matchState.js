import {
  CORE_IDS,
  CORE_MAX_HP,
  MATCH_DURATION_SECONDS,
  MATCH_OUTCOMES,
  MATCH_STATUS
} from "./constants.js";

let nextMatchNumber = 1;

export function createMatchState(overrides = {}) {
  return {
    matchId: createLocalMatchId(),
    status: MATCH_STATUS.READY,
    result: null,
    durationSeconds: MATCH_DURATION_SECONDS,
    elapsedSeconds: 0,
    coreMaxHp: CORE_MAX_HP,
    playerCoreHp: CORE_MAX_HP,
    enemyCoreHp: CORE_MAX_HP,
    playerCoreDamageDealt: 0,
    enemyCoreDamageDealt: 0,
    enemiesKilled: 0,
    ...overrides
  };
}

export function startMatch(match) {
  if (match.status === MATCH_STATUS.RUNNING) {
    return match;
  }

  if (match.status === MATCH_STATUS.PAUSED) {
    return {
      ...match,
      status: MATCH_STATUS.RUNNING
    };
  }

  return {
    ...createMatchState(),
    status: MATCH_STATUS.RUNNING
  };
}

export function togglePause(match) {
  if (match.status === MATCH_STATUS.RUNNING) {
    return {
      ...match,
      status: MATCH_STATUS.PAUSED
    };
  }

  if (match.status === MATCH_STATUS.PAUSED) {
    return {
      ...match,
      status: MATCH_STATUS.RUNNING
    };
  }

  return match;
}

export function pauseForAppInterruption(match) {
  if (match.status !== MATCH_STATUS.RUNNING) {
    return match;
  }

  return {
    ...match,
    status: MATCH_STATUS.PAUSED
  };
}

export function tickMatch(match, deltaSeconds) {
  if (match.status !== MATCH_STATUS.RUNNING) {
    return match;
  }

  const elapsedSeconds = Math.min(
    match.durationSeconds,
    match.elapsedSeconds + Math.max(0, deltaSeconds)
  );
  const nextMatch = {
    ...match,
    elapsedSeconds
  };

  if (elapsedSeconds >= match.durationSeconds) {
    return finishByTimer(nextMatch);
  }

  return nextMatch;
}

export function damageCore(match, coreId, rawAmount) {
  if (match.status !== MATCH_STATUS.RUNNING) {
    return match;
  }

  const amount = Math.max(0, rawAmount);
  if (amount === 0) {
    return match;
  }

  if (coreId === CORE_IDS.ENEMY) {
    const actualDamage = Math.min(amount, match.enemyCoreHp);
    const enemyCoreHp = match.enemyCoreHp - actualDamage;
    const nextMatch = {
      ...match,
      enemyCoreHp,
      playerCoreDamageDealt: match.playerCoreDamageDealt + actualDamage
    };

    return enemyCoreHp <= 0
      ? endMatch(nextMatch, MATCH_OUTCOMES.WIN, "enemy_core_destroyed")
      : nextMatch;
  }

  if (coreId === CORE_IDS.PLAYER) {
    const actualDamage = Math.min(amount, match.playerCoreHp);
    const playerCoreHp = match.playerCoreHp - actualDamage;
    const nextMatch = {
      ...match,
      playerCoreHp,
      enemyCoreDamageDealt: match.enemyCoreDamageDealt + actualDamage
    };

    return playerCoreHp <= 0
      ? endMatch(nextMatch, MATCH_OUTCOMES.LOSS, "player_core_destroyed")
      : nextMatch;
  }

  throw new Error(`Unknown core id: ${coreId}`);
}

export function recordEnemyKills(match, rawCount) {
  if (match.status !== MATCH_STATUS.RUNNING) {
    return match;
  }

  const count = Math.max(0, Math.floor(Number(rawCount) || 0));
  if (count === 0) {
    return match;
  }

  return {
    ...match,
    enemiesKilled: (match.enemiesKilled ?? 0) + count
  };
}

export function finishByTimer(match) {
  const playerCorePercent = getCorePercent(match.playerCoreHp, match.coreMaxHp);
  const enemyCorePercent = getCorePercent(match.enemyCoreHp, match.coreMaxHp);

  if (playerCorePercent > enemyCorePercent) {
    return endMatch(match, MATCH_OUTCOMES.WIN, "timer_core_hp_percent");
  }

  if (enemyCorePercent > playerCorePercent) {
    return endMatch(match, MATCH_OUTCOMES.LOSS, "timer_core_hp_percent");
  }

  if (match.playerCoreDamageDealt > match.enemyCoreDamageDealt) {
    return endMatch(match, MATCH_OUTCOMES.WIN, "timer_core_damage_dealt");
  }

  if (match.enemyCoreDamageDealt > match.playerCoreDamageDealt) {
    return endMatch(match, MATCH_OUTCOMES.LOSS, "timer_core_damage_dealt");
  }

  return endMatch(match, MATCH_OUTCOMES.DRAW, "timer_full_tie");
}

export function endMatch(match, outcome, reason) {
  return {
    ...match,
    status: MATCH_STATUS.ENDED,
    result: {
      outcome,
      reason
    }
  };
}

export function getRemainingSeconds(match) {
  return Math.max(0, match.durationSeconds - match.elapsedSeconds);
}

export function getCorePercent(hp, maxHp = CORE_MAX_HP) {
  if (maxHp <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(1, hp / maxHp));
}

export function formatTime(totalSeconds) {
  const roundedSeconds = Math.max(0, Math.ceil(totalSeconds));
  const minutes = Math.floor(roundedSeconds / 60);
  const seconds = roundedSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function getResultLabel(match) {
  if (match.result) {
    return match.result.outcome.toUpperCase();
  }

  if (match.status === MATCH_STATUS.RUNNING) {
    return "RUNNING";
  }

  if (match.status === MATCH_STATUS.PAUSED) {
    return "PAUSED";
  }

  return "READY";
}

function createLocalMatchId() {
  const id = `local_match_${nextMatchNumber}`;
  nextMatchNumber += 1;
  return id;
}
