import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_DIFFICULTY_ID,
  DIFFICULTIES,
  DIFFICULTY_LIST,
  getDifficulty,
} from "../src/js/difficulty.js";
import { Ghost } from "../src/js/entities.js";

test("difficulty fallback is the explicit default", () => {
  assert.equal(DEFAULT_DIFFICULTY_ID, "normal");
  assert.equal(getDifficulty().id, DEFAULT_DIFFICULTY_ID);
  assert.equal(getDifficulty("missing").id, DEFAULT_DIFFICULTY_ID);
});

test("each difficulty changes at least one observable gameplay parameter", () => {
  const normal = DIFFICULTIES.normal;

  for (const difficulty of DIFFICULTY_LIST) {
    assert.ok(difficulty.label);

    if (difficulty.id === normal.id) {
      continue;
    }

    const hasGameplayChange =
      difficulty.pacmanSpeedMultiplier !== normal.pacmanSpeedMultiplier ||
      difficulty.ghostSpeedMultiplier !== normal.ghostSpeedMultiplier ||
      difficulty.frightenedGhostSpeedMultiplier !== normal.frightenedGhostSpeedMultiplier ||
      difficulty.powerDuration !== normal.powerDuration ||
      difficulty.ghostReleaseDelayMultiplier !== normal.ghostReleaseDelayMultiplier;

    assert.equal(hasGameplayChange, true, `${difficulty.id} should alter gameplay`);
  }
});

test("easy is more forgiving and hard is more aggressive than normal", () => {
  assert.ok(DIFFICULTIES.easy.powerDuration > DIFFICULTIES.normal.powerDuration);
  assert.ok(DIFFICULTIES.easy.ghostSpeedMultiplier < DIFFICULTIES.normal.ghostSpeedMultiplier);
  assert.ok(DIFFICULTIES.hard.powerDuration < DIFFICULTIES.normal.powerDuration);
  assert.ok(DIFFICULTIES.hard.ghostSpeedMultiplier > DIFFICULTIES.normal.ghostSpeedMultiplier);
});

test("ghost reset applies the selected release delay multiplier", () => {
  const ghost = new Ghost(
    {
      id: "test",
      color: "#fff",
      scatterTarget: { x: 0, y: 0 },
      x: 10,
      y: 10,
    },
    2,
  );

  ghost.reset(0.5);
  assert.equal(ghost.releaseDelay, 1.2);

  ghost.reset(1.5);
  assert.equal(ghost.releaseDelay, 3.5999999999999996);
});
