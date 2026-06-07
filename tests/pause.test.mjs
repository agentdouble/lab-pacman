import assert from "node:assert/strict";
import test from "node:test";

function installBrowserStubs() {
  const windowListeners = new Map();

  globalThis.window = {
    devicePixelRatio: 1,
    addEventListener(type, handler) {
      windowListeners.set(type, handler);
    },
  };

  globalThis.document = {
    querySelectorAll() {
      return [];
    },
  };

  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
  };

  return { windowListeners };
}

function createElement() {
  const listeners = new Map();

  return {
    textContent: "",
    listeners,
    classList: {
      add() {},
      remove() {},
    },
    addEventListener(type, handler) {
      listeners.set(type, handler);
    },
  };
}

function createCanvas() {
  return {
    getContext() {
      return {
        setTransform() {},
      };
    },
    getBoundingClientRect() {
      return { width: 672, height: 704 };
    },
    addEventListener() {},
  };
}

function snapshotGame(game) {
  return {
    time: game.time,
    score: game.score,
    lives: game.lives,
    pacman: {
      x: game.pacman.x,
      y: game.pacman.y,
    },
    ghosts: game.ghosts.map((ghost) => ({
      x: ghost.x,
      y: ghost.y,
    })),
  };
}

test("Space pauses and resumes without changing gameplay state while paused", async () => {
  const { windowListeners } = installBrowserStubs();
  const { PacmanGame } = await import("../src/js/game.js");

  const game = new PacmanGame({
    canvas: createCanvas(),
    scoreElement: createElement(),
    levelElement: createElement(),
    livesElement: createElement(),
    messageElement: createElement(),
    pauseButton: createElement(),
    restartButton: createElement(),
  });

  const keydown = windowListeners.get("keydown");
  assert.equal(typeof keydown, "function");

  const press = (code) => {
    let defaultPrevented = false;

    keydown({
      code,
      preventDefault() {
        defaultPrevented = true;
      },
    });

    assert.equal(defaultPrevented, true);
  };

  press("ArrowLeft");
  assert.equal(game.state, "playing");

  game.update(0.1);
  assert.ok(game.pacman.x < game.pacman.spawn.x);

  press("Space");
  assert.equal(game.state, "paused");

  const pausedSnapshot = snapshotGame(game);
  game.update(1);
  game.update(1);

  assert.deepEqual(snapshotGame(game), pausedSnapshot);

  press("Space");
  assert.equal(game.state, "playing");

  game.update(0.1);
  assert.ok(game.time > pausedSnapshot.time);
  assert.notDeepEqual(
    { x: game.pacman.x, y: game.pacman.y },
    pausedSnapshot.pacman,
  );
});
