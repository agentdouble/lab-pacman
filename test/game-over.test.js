import assert from "node:assert/strict";
import { test } from "node:test";

import { GAME_STATES, STARTING_LIVES } from "../src/js/constants.js";
import { PacmanGame } from "../src/js/game.js";

function createLogicHarness(overrides = {}) {
  const messageClassList = {
    values: new Set(),
    add(className) {
      this.values.add(className);
    },
    remove(className) {
      this.values.delete(className);
    },
  };

  return Object.assign(Object.create(PacmanGame.prototype), {
    scoreElement: { textContent: "" },
    levelElement: { textContent: "" },
    livesElement: { textContent: "" },
    messageElement: { textContent: "", classList: messageClassList },
    pauseButton: { textContent: "Pause" },
    score: 0,
    level: 1,
    lives: 1,
    state: GAME_STATES.playing,
    finalScore: null,
    onGameOver: () => {},
    ...overrides,
  });
}

test("losing the final life triggers game over and exposes the final score", () => {
  const gameOverSummaries = [];
  const game = createLogicHarness({
    score: 860,
    onGameOver: (summary) => gameOverSummaries.push(summary),
  });

  game.loseLife();

  assert.equal(game.state, GAME_STATES.gameOver);
  assert.equal(game.lives, 0);
  assert.equal(game.finalScore, 860);
  assert.equal(game.getFinalScore(), 860);
  assert.equal(game.messageElement.textContent, "GAME OVER");
  assert.equal(game.pauseButton.textContent, "Pause");
  assert.deepEqual(gameOverSummaries, [
    {
      state: GAME_STATES.gameOver,
      finalScore: 860,
      level: 1,
      lives: 0,
    },
  ]);
});

test("restart clears the exposed final score", () => {
  let pelletsReset = false;
  let actorsReset = false;
  const game = createLogicHarness({
    maze: {
      resetPellets() {
        pelletsReset = true;
      },
    },
    resetActors() {
      actorsReset = true;
    },
    score: 860,
    level: 3,
    lives: 0,
    state: GAME_STATES.gameOver,
    finalScore: 860,
  });

  game.restart();

  assert.equal(pelletsReset, true);
  assert.equal(actorsReset, true);
  assert.equal(game.score, 0);
  assert.equal(game.level, 1);
  assert.equal(game.lives, STARTING_LIVES);
  assert.equal(game.state, GAME_STATES.ready);
  assert.equal(game.finalScore, null);
  assert.equal(game.getFinalScore(), null);
  assert.equal(game.messageElement.textContent, "READY");
});

test("game over is not overwritten by level advancement in the same frame", () => {
  let advancedLevel = false;
  const game = createLogicHarness({
    maze: { pelletsRemaining: 0 },
    score: 1200,
    time: 0,
    updatePacman() {},
    updateGhosts() {},
    resolveCollisions() {
      this.loseLife();
    },
    advanceLevel() {
      advancedLevel = true;
    },
  });

  game.update(0.016);

  assert.equal(advancedLevel, false);
  assert.equal(game.state, GAME_STATES.gameOver);
  assert.equal(game.finalScore, 1200);
});
