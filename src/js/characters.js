export const DEFAULT_CHARACTER_ID = "classic";

export const CHARACTERS = Object.freeze([
  Object.freeze({
    id: "classic",
    name: "Classic Pac-Man",
    shortName: "Classic",
    description: "Balanced speed, lives, and score.",
    color: "#ffd84d",
    accentColor: "#fff8d8",
    stats: Object.freeze({
      speedMultiplier: 1,
      lives: 3,
      scoreMultiplier: 1,
      powerDurationMultiplier: 1,
    }),
  }),
  Object.freeze({
    id: "turbo",
    name: "Turbo Pac-Man",
    shortName: "Turbo",
    description: "Fast maze clears with fewer mistakes allowed.",
    color: "#38d7ff",
    accentColor: "#fff8d8",
    stats: Object.freeze({
      speedMultiplier: 1.18,
      lives: 2,
      scoreMultiplier: 1,
      powerDurationMultiplier: 0.9,
    }),
  }),
  Object.freeze({
    id: "guardian",
    name: "Guardian Pac-Man",
    shortName: "Guardian",
    description: "Extra life, steadier pace, lower score yield.",
    color: "#6fe36a",
    accentColor: "#fff8d8",
    stats: Object.freeze({
      speedMultiplier: 0.92,
      lives: 4,
      scoreMultiplier: 0.9,
      powerDurationMultiplier: 1,
    }),
  }),
  Object.freeze({
    id: "comet",
    name: "Comet Pac-Man",
    shortName: "Comet",
    description: "Risky scoring build with longer power pellets.",
    color: "#ff83c7",
    accentColor: "#ffd84d",
    stats: Object.freeze({
      speedMultiplier: 0.96,
      lives: 3,
      scoreMultiplier: 1.35,
      powerDurationMultiplier: 1.18,
    }),
  }),
]);

export function getDefaultCharacter() {
  return CHARACTERS.find((character) => character.id === DEFAULT_CHARACTER_ID);
}

export function getCharacterById(characterId) {
  return CHARACTERS.find((character) => character.id === characterId) ?? getDefaultCharacter();
}

export function scoreForCharacter(points, character) {
  return Math.max(0, Math.round(points * character.stats.scoreMultiplier));
}
