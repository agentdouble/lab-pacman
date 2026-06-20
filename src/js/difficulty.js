export const DEFAULT_DIFFICULTY_ID = "normal";

export const DIFFICULTIES = Object.freeze({
  easy: Object.freeze({
    id: "easy",
    label: "Easy",
    pacmanSpeedMultiplier: 0.96,
    ghostSpeedMultiplier: 0.86,
    frightenedGhostSpeedMultiplier: 0.82,
    powerDuration: 9,
    ghostReleaseDelayMultiplier: 1.45,
  }),
  normal: Object.freeze({
    id: "normal",
    label: "Normal",
    pacmanSpeedMultiplier: 1,
    ghostSpeedMultiplier: 1,
    frightenedGhostSpeedMultiplier: 1,
    powerDuration: 7.5,
    ghostReleaseDelayMultiplier: 1,
  }),
  hard: Object.freeze({
    id: "hard",
    label: "Hard",
    pacmanSpeedMultiplier: 1.03,
    ghostSpeedMultiplier: 1.16,
    frightenedGhostSpeedMultiplier: 1.08,
    powerDuration: 5.4,
    ghostReleaseDelayMultiplier: 0.62,
  }),
});

export const DIFFICULTY_LIST = Object.freeze([
  DIFFICULTIES.easy,
  DIFFICULTIES.normal,
  DIFFICULTIES.hard,
]);

export function getDifficulty(difficultyId = DEFAULT_DIFFICULTY_ID) {
  return DIFFICULTIES[difficultyId] ?? DIFFICULTIES[DEFAULT_DIFFICULTY_ID];
}
