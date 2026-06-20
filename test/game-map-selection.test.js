import assert from "node:assert/strict";
import test from "node:test";

import { PacmanGame } from "../src/js/game.js";

globalThis.HTMLElement ??= class HTMLElement {};

test("changing the selected maze starts a fresh game on that maze", () => {
  installDomStubs();

  const mazeSelectElement = new StubElement("SELECT");
  const messageElement = new StubElement();
  mazeSelectElement.value = "classic";

  const game = new PacmanGame({
    canvas: new StubCanvas(),
    scoreElement: new StubElement(),
    levelElement: new StubElement(),
    livesElement: new StubElement(),
    messageElement,
    pauseButton: new StubElement("BUTTON"),
    restartButton: new StubElement("BUTTON"),
    mazeSelectElement,
  });

  assert.equal(game.maze.id, "classic");

  game.score = 120;
  game.level = 3;
  game.lives = 1;
  game.state = "playing";
  mazeSelectElement.value = "speedway";
  mazeSelectElement.dispatch("change");

  assert.equal(game.maze.id, "speedway");
  assert.equal(game.score, 0);
  assert.equal(game.level, 1);
  assert.equal(game.lives, 3);
  assert.equal(game.state, "ready");
  assert.equal(messageElement.textContent, "Speedway READY");
});

function installDomStubs() {
  globalThis.window = {
    devicePixelRatio: 1,
    addEventListener() {},
  };
  globalThis.document = {
    querySelectorAll() {
      return [];
    },
  };
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
  };
}

class StubElement extends HTMLElement {
  constructor(tagName = "DIV") {
    super();
    this.tagName = tagName;
    this.textContent = "";
    this.value = "";
    this.listeners = new Map();
    this.classList = {
      add: () => {},
      remove: () => {},
    };
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  dispatch(type) {
    this.listeners.get(type)?.({ target: this });
  }
}

class StubCanvas extends StubElement {
  constructor() {
    super("CANVAS");
    this.width = 0;
    this.height = 0;
  }

  getBoundingClientRect() {
    return { width: 672, height: 704 };
  }

  getContext() {
    return {
      setTransform: () => {},
    };
  }
}
