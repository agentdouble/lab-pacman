import {
  DIRECTIONS,
  FRIGHTENED_GHOST_SPEED,
  GHOST_SPEED,
  PACMAN_SPEED,
  POWER_DURATION,
  STARTING_LIVES,
} from "./constants.js";
import { PacmanColorSettings } from "./color-settings.js";
import { Ghost, Pacman } from "./entities.js";
import { InputController } from "./input.js";
import { Maze } from "./maze.js";
import {
  canMoveFrom,
  isCentered,
  legalDirections,
  moveEntity,
  snapToCenter,
  tileFromPosition,
  withoutReverse,
} from "./movement.js";
import { Renderer } from "./renderer.js";

const COLLISION_DISTANCE = 0.58;
const ROUND_READY_TIME = 1.2;
const LEVEL_READY_TIME = 1.5;

export class PacmanGame {
  constructor({
    canvas,
    scoreElement,
    levelElement,
    livesElement,
    messageElement,
    pauseButton,
    restartButton,
    colorOptionsElement,
    colorStatusElement,
  }) {
    this.canvas = canvas;
    this.scoreElement = scoreElement;
    this.levelElement = levelElement;
    this.livesElement = livesElement;
    this.messageElement = messageElement;
    this.pauseButton = pauseButton;
    this.renderer = new Renderer(canvas);
    this.maze = new Maze();
    this.pacman = new Pacman(this.maze.pacmanSpawn);
    this.ghosts = this.maze.ghostSpawns.map((spawn, index) => new Ghost(spawn, index));
    this.lastFrame = 0;
    this.time = 0;
    this.score = 0;
    this.level = 1;
    this.lives = STARTING_LIVES;
    this.state = "ready";
    this.readyUntil = ROUND_READY_TIME;
    this.powerUntil = 0;
    this.ghostCombo = 0;
    this.colorSettings = new PacmanColorSettings({
      container: colorOptionsElement,
      statusElement: colorStatusElement,
      onColorChange: (color) => this.setPacmanColor(color),
    });
    this.setPacmanColor(this.colorSettings.getColor());

    new InputController({
      canvas,
      pauseButton,
      restartButton,
      onDirection: (direction) => this.queueDirection(direction),
      onPause: () => this.togglePause(),
      onRestart: () => this.restart(),
    });

    this.updateHud();
    this.showMessage("READY");
  }

  start() {
    requestAnimationFrame((timestamp) => this.frame(timestamp));
  }

  frame(timestamp) {
    const seconds = timestamp / 1000;
    const dt = Math.min(0.05, seconds - (this.lastFrame || seconds));
    this.lastFrame = seconds;

    this.update(dt);
    this.renderer.render({
      maze: this.maze,
      pacman: this.pacman,
      ghosts: this.ghosts,
      time: this.time,
      isFrightened: this.isFrightened(),
      frightenedTimeLeft: Math.max(0, this.powerUntil - this.time),
    });

    requestAnimationFrame((nextTimestamp) => this.frame(nextTimestamp));
  }

  update(dt) {
    this.time += dt;

    if (this.state === "ready" && this.time >= this.readyUntil) {
      this.showMessage("READY");
    }

    if (this.state !== "playing") {
      return;
    }

    this.updatePacman(dt);
    this.updateGhosts(dt);
    this.resolveCollisions();

    if (this.maze.pelletsRemaining === 0) {
      this.advanceLevel();
    }
  }

  queueDirection(direction) {
    this.pacman.nextDirection = direction;

    if (this.state === "ready") {
      this.state = "playing";
      this.hideMessage();
    }
  }

  updatePacman(dt) {
    this.pacman.mouthTime += dt;

    if (isCentered(this.pacman)) {
      snapToCenter(this.pacman, this.maze);

      if (canMoveFrom(this.pacman, this.maze, this.pacman.nextDirection)) {
        this.pacman.direction = this.pacman.nextDirection;
      }

      if (!canMoveFrom(this.pacman, this.maze, this.pacman.direction)) {
        this.pacman.direction = DIRECTIONS.none;
      }

      const tile = tileFromPosition(this.pacman, this.maze);
      const pellet = this.maze.eatAt(tile.x, tile.y);

      if (pellet.points > 0) {
        this.score += pellet.points;
        this.updateHud();
      }

      if (pellet.powered) {
        this.powerUntil = this.time + POWER_DURATION;
        this.ghostCombo = 0;
      }
    }

    if (this.pacman.direction.name !== "none") {
      this.pacman.facing = this.pacman.direction;
    }

    moveEntity(this.pacman, this.maze, dt, PACMAN_SPEED + Math.min(1.1, (this.level - 1) * 0.16));
  }

  updateGhosts(dt) {
    const frightened = this.isFrightened();
    const speed = frightened
      ? FRIGHTENED_GHOST_SPEED
      : GHOST_SPEED + Math.min(0.85, (this.level - 1) * 0.11);

    for (const ghost of this.ghosts) {
      if (this.time < ghost.releaseDelay && this.level === 1) {
        continue;
      }

      if (isCentered(ghost)) {
        snapToCenter(ghost, this.maze);
        const options = withoutReverse(legalDirections(ghost, this.maze), ghost.direction);
        ghost.direction = this.chooseGhostDirection(ghost, options, frightened);
      }

      moveEntity(ghost, this.maze, dt, speed);
    }
  }

  chooseGhostDirection(ghost, options, frightened) {
    if (options.length === 0) {
      return DIRECTIONS.none;
    }

    if (frightened) {
      return options[Math.floor(Math.random() * options.length)];
    }

    const target = this.getGhostTarget(ghost);
    return options.reduce((best, direction) => {
      const nextX = ghost.x + direction.dx;
      const nextY = ghost.y + direction.dy;
      const score = Math.abs(nextX - target.x) + Math.abs(nextY - target.y);

      if (!best || score < best.score) {
        return { direction, score };
      }

      return best;
    }, null).direction;
  }

  getGhostTarget(ghost) {
    const scatterMode = Math.floor(this.time / 8) % 4 === 0;
    const pacmanTile = tileFromPosition(this.pacman, this.maze);

    if (scatterMode) {
      return ghost.scatterTarget;
    }

    if (ghost.id === "pinky") {
      return {
        x: pacmanTile.x + this.pacman.facing.dx * 4,
        y: pacmanTile.y + this.pacman.facing.dy * 4,
      };
    }

    if (ghost.id === "inky") {
      const blinky = this.ghosts.find((candidate) => candidate.id === "blinky");
      return {
        x: pacmanTile.x * 2 - (blinky?.x ?? pacmanTile.x),
        y: pacmanTile.y * 2 - (blinky?.y ?? pacmanTile.y),
      };
    }

    if (ghost.id === "clyde") {
      const distance = Math.abs(ghost.x - pacmanTile.x) + Math.abs(ghost.y - pacmanTile.y);
      return distance > 7 ? pacmanTile : ghost.scatterTarget;
    }

    return pacmanTile;
  }

  resolveCollisions() {
    for (const ghost of this.ghosts) {
      const deltaX = Math.abs(this.pacman.x - ghost.x);
      const wrappedDeltaX = Math.min(deltaX, this.maze.width - deltaX);
      const distance = Math.hypot(wrappedDeltaX, this.pacman.y - ghost.y);

      if (distance > COLLISION_DISTANCE) {
        continue;
      }

      if (this.isFrightened()) {
        this.ghostCombo += 1;
        this.score += 200 * this.ghostCombo;
        ghost.reset();
        this.updateHud();
        continue;
      }

      this.loseLife();
      return;
    }
  }

  loseLife() {
    this.lives -= 1;
    this.updateHud();

    if (this.lives <= 0) {
      this.state = "gameOver";
      this.pauseButton.textContent = "Pause";
      this.showMessage("GAME OVER");
      return;
    }

    this.resetActors();
    this.powerUntil = 0;
    this.state = "ready";
    this.readyUntil = this.time + ROUND_READY_TIME;
    this.showMessage("READY");
  }

  advanceLevel() {
    this.level += 1;
    this.maze.resetPellets();
    this.resetActors();
    this.powerUntil = 0;
    this.ghostCombo = 0;
    this.state = "ready";
    this.readyUntil = this.time + LEVEL_READY_TIME;
    this.showMessage(`LEVEL ${this.level}`);
    this.updateHud();
  }

  resetActors() {
    this.pacman.reset();
    for (const ghost of this.ghosts) {
      ghost.reset();
    }
  }

  setPacmanColor(color) {
    this.pacman.setColor(color);
  }

  restart() {
    this.maze.resetPellets();
    this.score = 0;
    this.level = 1;
    this.lives = STARTING_LIVES;
    this.powerUntil = 0;
    this.ghostCombo = 0;
    this.resetActors();
    this.time = 0;
    this.readyUntil = ROUND_READY_TIME;
    this.state = "ready";
    this.pauseButton.textContent = "Pause";
    this.showMessage("READY");
    this.updateHud();
  }

  togglePause() {
    if (this.state === "playing") {
      this.state = "paused";
      this.pauseButton.textContent = "Resume";
      this.showMessage("PAUSED");
      return;
    }

    if (this.state === "paused") {
      this.state = "playing";
      this.pauseButton.textContent = "Pause";
      this.hideMessage();
    }
  }

  isFrightened() {
    return this.powerUntil > this.time;
  }

  showMessage(message) {
    this.messageElement.textContent = message;
    this.messageElement.classList.add("is-visible");
  }

  hideMessage() {
    this.pauseButton.textContent = "Pause";
    this.messageElement.classList.remove("is-visible");
  }

  updateHud() {
    this.scoreElement.textContent = String(this.score);
    this.levelElement.textContent = String(this.level);
    this.livesElement.textContent = String(this.lives);
  }
}
