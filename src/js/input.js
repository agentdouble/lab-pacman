import { DIRECTIONS } from "./constants.js";

const KEY_TO_DIRECTION = Object.freeze({
  ArrowUp: "up",
  KeyW: "up",
  ArrowRight: "right",
  KeyD: "right",
  ArrowDown: "down",
  KeyS: "down",
  ArrowLeft: "left",
  KeyA: "left",
});

export class InputController {
  constructor({
    canvas,
    pauseButton,
    restartButton,
    colorButtons = [],
    onDirection,
    onPause,
    onRestart,
    onColorChange = () => {},
  }) {
    this.onDirection = onDirection;
    this.touchStart = null;

    window.addEventListener("keydown", (event) => {
      const directionName = KEY_TO_DIRECTION[event.code];

      if (directionName) {
        event.preventDefault();
        this.emitDirection(directionName);
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        onPause();
      }
    });

    for (const button of document.querySelectorAll("[data-dir]")) {
      button.addEventListener("click", () => this.emitDirection(button.dataset.dir));
      button.addEventListener("touchstart", (event) => {
        event.preventDefault();
        this.emitDirection(button.dataset.dir);
      });
    }

    canvas.addEventListener("pointerdown", (event) => {
      this.touchStart = { x: event.clientX, y: event.clientY };
    });

    canvas.addEventListener("pointerup", (event) => {
      if (!this.touchStart) {
        return;
      }

      const deltaX = event.clientX - this.touchStart.x;
      const deltaY = event.clientY - this.touchStart.y;
      this.touchStart = null;

      if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < 18) {
        return;
      }

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        this.emitDirection(deltaX > 0 ? "right" : "left");
      } else {
        this.emitDirection(deltaY > 0 ? "down" : "up");
      }
    });

    pauseButton.addEventListener("click", onPause);
    restartButton.addEventListener("click", onRestart);

    for (const button of colorButtons) {
      button.addEventListener("click", () => onColorChange(button.dataset.pacmanColor));
    }
  }

  emitDirection(directionName) {
    const direction = DIRECTIONS[directionName];

    if (direction) {
      this.onDirection(direction);
    }
  }
}
