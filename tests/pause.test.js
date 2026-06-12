import assert from "node:assert/strict";
import test from "node:test";

const keyboard = installDomMocks();
const { PacmanGame } = await import("../src/js/game.js");

test("Space pauses and resumes without changing gameplay state while paused", () => {
  const elements = {
    canvas: createMockCanvas(),
    score: createMockElement("0"),
    level: createMockElement("1"),
    lives: createMockElement("3"),
    message: createMockElement("READY"),
    pauseButton: createMockElement("Pause"),
    restartButton: createMockElement("Restart"),
  };

  const game = new PacmanGame({
    canvas: elements.canvas,
    scoreElement: elements.score,
    levelElement: elements.level,
    livesElement: elements.lives,
    messageElement: elements.message,
    pauseButton: elements.pauseButton,
    restartButton: elements.restartButton,
  });

  game.state = "playing";
  game.score = 1230;
  game.lives = 2;
  game.time = 14.25;
  game.powerUntil = 18;
  game.pacman.x = 9.5;
  game.pacman.y = 17;
  game.ghosts[0].x = 8.25;
  game.ghosts[0].y = 13.5;
  game.updateHud();

  const beforePause = snapshotGameplay(game);
  const pauseEvent = keyboard.dispatchKey("Space");

  assert.equal(pauseEvent.defaultPrevented, true);
  assert.equal(game.state, "paused");
  assert.equal(elements.pauseButton.textContent, "Resume");
  assert.equal(elements.message.textContent, "PAUSED");

  game.update(5);
  assert.deepEqual(snapshotGameplay(game), beforePause);

  const resumeEvent = keyboard.dispatchKey("Space");

  assert.equal(resumeEvent.defaultPrevented, true);
  assert.equal(game.state, "playing");
  assert.equal(elements.pauseButton.textContent, "Pause");
  assert.equal(elements.message.classList.contains("is-visible"), false);
  assert.deepEqual(snapshotGameplay(game), beforePause);
});

function installDomMocks() {
  const listeners = new Map();

  globalThis.window = {
    devicePixelRatio: 1,
    addEventListener(type, listener) {
      const typeListeners = listeners.get(type) ?? [];
      typeListeners.push(listener);
      listeners.set(type, typeListeners);
    },
  };

  globalThis.document = {
    querySelectorAll() {
      return [];
    },
  };

  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    disconnect() {}
  };

  return {
    dispatchKey(code) {
      const event = {
        code,
        defaultPrevented: false,
        preventDefault() {
          this.defaultPrevented = true;
        },
      };

      for (const listener of listeners.get("keydown") ?? []) {
        listener(event);
      }

      return event;
    },
  };
}

function createMockCanvas() {
  return {
    width: 0,
    height: 0,
    getBoundingClientRect() {
      return { width: 672, height: 704 };
    },
    getContext() {
      return {
        setTransform() {},
      };
    },
    addEventListener() {},
  };
}

function createMockElement(textContent = "") {
  const classes = new Set();

  return {
    textContent,
    classList: {
      add(name) {
        classes.add(name);
      },
      remove(name) {
        classes.delete(name);
      },
      contains(name) {
        return classes.has(name);
      },
    },
    addEventListener() {},
  };
}

function snapshotGameplay(game) {
  return {
    score: game.score,
    lives: game.lives,
    time: game.time,
    powerUntil: game.powerUntil,
    pacman: {
      x: game.pacman.x,
      y: game.pacman.y,
      direction: game.pacman.direction.name,
      nextDirection: game.pacman.nextDirection.name,
      facing: game.pacman.facing.name,
      mouthTime: game.pacman.mouthTime,
    },
    ghosts: game.ghosts.map((ghost) => ({
      x: ghost.x,
      y: ghost.y,
      direction: ghost.direction.name,
      releaseDelay: ghost.releaseDelay,
    })),
  };
}
