export const MATCH_PRESSURE_PHASES = Object.freeze({
  OPENING_CONTACT: "opening_contact",
  EARLY_FIGHT: "early_fight",
  MID_FIGHT: "mid_fight",
  FINAL_CHAOS: "final_chaos"
});

export const MATCH_PRESSURE_PHASE_SEQUENCE = Object.freeze([
  Object.freeze({
    id: MATCH_PRESSURE_PHASES.OPENING_CONTACT,
    label: "Opening/contact",
    startSeconds: 0,
    endSeconds: 45
  }),
  Object.freeze({
    id: MATCH_PRESSURE_PHASES.EARLY_FIGHT,
    label: "Early fight",
    startSeconds: 45,
    endSeconds: 120
  }),
  Object.freeze({
    id: MATCH_PRESSURE_PHASES.MID_FIGHT,
    label: "Mid fight",
    startSeconds: 120,
    endSeconds: 330
  }),
  Object.freeze({
    id: MATCH_PRESSURE_PHASES.FINAL_CHAOS,
    label: "Final chaos",
    startSeconds: 330,
    endSeconds: 480
  })
]);

export const BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE = Object.freeze({
  [MATCH_PRESSURE_PHASES.OPENING_CONTACT]: Object.freeze([1, 1, 2]),
  [MATCH_PRESSURE_PHASES.EARLY_FIGHT]: Object.freeze([2, 2, 2]),
  [MATCH_PRESSURE_PHASES.MID_FIGHT]: Object.freeze([3, 3, 3]),
  [MATCH_PRESSURE_PHASES.FINAL_CHAOS]: Object.freeze([4, 4, 4])
});

export const INTENSE_DOOR_ENEMY_COUNTS_BY_PHASE = Object.freeze({
  [MATCH_PRESSURE_PHASES.OPENING_CONTACT]: Object.freeze([1, 2, 2]),
  [MATCH_PRESSURE_PHASES.EARLY_FIGHT]: Object.freeze([2, 2, 3]),
  [MATCH_PRESSURE_PHASES.MID_FIGHT]: Object.freeze([3, 4, 4]),
  [MATCH_PRESSURE_PHASES.FINAL_CHAOS]: Object.freeze([4, 5, 5])
});

export function getMatchPressurePhase(elapsedSeconds) {
  const safeElapsedSeconds = Math.max(0, Number(elapsedSeconds) || 0);

  return (
    MATCH_PRESSURE_PHASE_SEQUENCE.find(
      (phase) =>
        safeElapsedSeconds >= phase.startSeconds &&
        safeElapsedSeconds < phase.endSeconds
    ) ?? MATCH_PRESSURE_PHASE_SEQUENCE[MATCH_PRESSURE_PHASE_SEQUENCE.length - 1]
  );
}

export function getDoorEnemyCountsForPhase(phaseId, options = {}) {
  const table = options.useIntenseTable
    ? INTENSE_DOOR_ENEMY_COUNTS_BY_PHASE
    : BASELINE_DOOR_ENEMY_COUNTS_BY_PHASE;

  return table[phaseId] ?? table[MATCH_PRESSURE_PHASES.OPENING_CONTACT];
}

export function getDoorEnemySpawnCount(elapsedSeconds, doorSequenceIndex, options = {}) {
  const phase = getMatchPressurePhase(elapsedSeconds);
  const counts = getDoorEnemyCountsForPhase(phase.id, options);
  const index = Math.max(0, Math.min(counts.length - 1, Math.floor(doorSequenceIndex)));

  return counts[index];
}
