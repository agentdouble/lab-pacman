import assert from "node:assert/strict";
import test from "node:test";

import { DIRECTIONS } from "../src/js/constants.js";
import { PacmanGame } from "../src/js/game.js";

test("Space toggles pause and stops the scheduled game loop", () => {
  const harness = createHarness();

  try {
    harness.game.start();
    harness.game.queueDirection(DIRECTIONS.left);

    assert.equal(harness.game.state, "playing");
    assert.equal(harness.pendingFrames(), 1);

    harness.pressSpace();

    assert.equal(harness.game.state, "paused");
    assert.equal(harness.pauseButton.textContent, "Resume");
    assert.equal(harness.messageElement.textContent, "PAUSED");
    assert.equal(harness.pendingFrames(), 0);

    harness.pressSpace();

    assert.equal(harness.game.state, "playing");
    assert.equal(harness.pauseButton.textContent, "Pause");
    assert.equal(harness.pendingFrames(), 1);
  } finally {
    harness.cleanup();
  }
});

test("pause freezes game time, movement, score and lives", () => {
  const harness = createHarness();

  try {
    harness.game.queueDirection(DIRECTIONS.left);
    harness.game.update(0.25);
    harness.game.togglePause();

    const snapshot = takeSnapshot(harness.game);

    harness.game.update(5);

    assert.deepEqual(takeSnapshot(harness.game), snapshot);
  } finally {
    harness.cleanup();
  }
});

test("resuming after pause does not apply elapsed pause time as movement", () => {
  const harness = createHarness();

  try {
    harness.game.start();
    harness.game.queueDirection(DIRECTIONS.left);
    harness.runNextFrame(1_000);
    harness.game.togglePause();

    const pausedSnapshot = takeSnapshot(harness.game);

    harness.game.togglePause();
    harness.runNextFrame(30_000);

    assert.deepEqual(takeSnapshot(harness.game), pausedSnapshot);
  } finally {
    harness.cleanup();
  }
});

function createHarness() {
  const keydownHandlers = [];
  const frameCallbacks = new Map();
  let nextFrameId = 1;

  globalThis.window = {
    devicePixelRatio: 1,
    addEventListener(type, handler) {
      if (type === "keydown") {
        keydownHandlers.push(handler);
      }
    },
  };

  globalThis.document = {
    querySelectorAll() {
      return [];
    },
  };

  globalThis.ResizeObserver = class {
    observe() {}
  };

  globalThis.requestAnimationFrame = (callback) => {
    const id = nextFrameId;
    nextFrameId += 1;
    frameCallbacks.set(id, callback);
    return id;
  };

  globalThis.cancelAnimationFrame = (id) => {
    frameCallbacks.delete(id);
  };

  const canvas = createCanvas();
  const scoreElement = createElement("0");
  const levelElement = createElement("1");
  const livesElement = createElement("3");
  const messageElement = createElement("READY");
  const pauseButton = createElement("Pause");
  const restartButton = createElement("Restart");
  const game = new PacmanGame({
    canvas,
    scoreElement,
    levelElement,
    livesElement,
    messageElement,
    pauseButton,
    restartButton,
  });

  return {
    game,
    pauseButton,
    messageElement,
    cleanup() {
      delete globalThis.window;
      delete globalThis.document;
      delete globalThis.ResizeObserver;
      delete globalThis.requestAnimationFrame;
      delete globalThis.cancelAnimationFrame;
    },
    pendingFrames() {
      return frameCallbacks.size;
    },
    pressSpace() {
      assert.equal(keydownHandlers.length, 1);
      keydownHandlers[0]({
        code: "Space",
        preventDefault() {},
      });
    },
    runNextFrame(timestamp) {
      const next = frameCallbacks.entries().next();
      assert.equal(next.done, false);
      const [id, callback] = next.value;
      frameCallbacks.delete(id);
      callback(timestamp);
    },
  };
}

function createElement(textContent = "") {
  const listeners = new Map();

  return {
    textContent,
    classList: createClassList(),
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
  };
}

function createClassList() {
  const classes = new Set();

  return {
    add(className) {
      classes.add(className);
    },
    remove(className) {
      classes.delete(className);
    },
    contains(className) {
      return classes.has(className);
    },
  };
}

function createCanvas() {
  return {
    width: 672,
    height: 704,
    getBoundingClientRect() {
      return { width: 672, height: 704 };
    },
    getContext() {
      return createCanvasContext();
    },
    addEventListener() {},
  };
}

function createCanvasContext() {
  return new Proxy(
    {},
    {
      get(target, property) {
        if (!(property in target)) {
          target[property] = () => {};
        }

        return target[property];
      },
    },
  );
}

function takeSnapshot(game) {
  return {
    time: game.time,
    score: game.score,
    lives: game.lives,
    pacman: {
      x: game.pacman.x,
      y: game.pacman.y,
    },
    ghosts: game.ghosts.map((ghost) => ({
      id: ghost.id,
      x: ghost.x,
      y: ghost.y,
    })),
  };
}
