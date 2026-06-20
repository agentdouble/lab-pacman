import assert from "node:assert/strict";
import test from "node:test";

import { PacmanGame } from "../src/js/game.js";

function createClassList() {
  const values = new Set();
  return {
    add: (value) => values.add(value),
    remove: (value) => values.delete(value),
    contains: (value) => values.has(value),
  };
}

function createElement() {
  return {
    textContent: "",
    classList: createClassList(),
    addEventListener: () => {},
  };
}

function createCanvas() {
  const context = {
    setTransform: () => {},
  };

  return {
    width: 672,
    height: 704,
    getContext: () => context,
    getBoundingClientRect: () => ({ width: 672, height: 704 }),
    addEventListener: () => {},
  };
}

function createGame() {
  globalThis.window = {
    addEventListener: () => {},
    devicePixelRatio: 1,
  };
  globalThis.document = {
    querySelectorAll: () => [],
  };
  globalThis.ResizeObserver = class {
    observe() {}
  };

  return new PacmanGame({
    canvas: createCanvas(),
    scoreElement: createElement(),
    levelElement: createElement(),
    livesElement: createElement(),
    messageElement: createElement(),
    pauseButton: createElement(),
    restartButton: createElement(),
    characterOptionsElement: null,
    characterRuleElement: createElement(),
  });
}

test("changing character starts a fresh run with selected stats", () => {
  const game = createGame();

  assert.equal(game.selectedCharacter.id, "classic");
  assert.equal(game.livesElement.textContent, "3");
  assert.equal(game.messageElement.textContent, "Classic READY");

  game.score = 400;
  game.level = 3;
  game.state = "playing";
  game.selectCharacter("turbo");

  assert.equal(game.selectedCharacter.id, "turbo");
  assert.equal(game.pacman.character.id, "turbo");
  assert.equal(game.scoreElement.textContent, "0");
  assert.equal(game.levelElement.textContent, "1");
  assert.equal(game.livesElement.textContent, "2");
  assert.equal(game.state, "ready");
  assert.equal(game.messageElement.textContent, "Turbo READY");
  assert.match(game.characterRuleElement.textContent, /New games use Turbo/);
});

test("selected lives still drive defeat and level advancement remains intact", () => {
  const game = createGame();

  game.selectCharacter("guardian");
  assert.equal(game.livesElement.textContent, "4");

  game.loseLife();
  assert.equal(game.livesElement.textContent, "3");
  assert.equal(game.state, "ready");

  game.loseLife();
  game.loseLife();
  game.loseLife();
  assert.equal(game.livesElement.textContent, "0");
  assert.equal(game.state, "gameOver");
  assert.equal(game.messageElement.textContent, "GAME OVER");

  game.restart();
  game.advanceLevel();
  assert.equal(game.levelElement.textContent, "2");
  assert.equal(game.livesElement.textContent, "4");
  assert.equal(game.state, "ready");
});
