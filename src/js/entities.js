import { DEFAULT_PACMAN_COLOR, DIRECTIONS } from "./constants.js";

export class Pacman {
  constructor(spawn, character) {
    this.spawn = { ...spawn };
    this.character = character;
    this.setColor(DEFAULT_PACMAN_COLOR);
    this.reset();
  }

  setCharacter(character) {
    this.character = character;
  }

  setColor(color) {
    this.color = color.value;
    this.shadowColor = color.shadow;
    this.colorName = color.name;
  }

  reset() {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.direction = DIRECTIONS.none;
    this.nextDirection = DIRECTIONS.left;
    this.facing = DIRECTIONS.left;
    this.mouthTime = 0;
  }
}

export class Ghost {
  constructor(spawn, index) {
    this.id = spawn.id;
    this.color = spawn.color;
    this.scatterTarget = spawn.scatterTarget;
    this.spawn = { x: spawn.x, y: spawn.y };
    this.index = index;
    this.reset();
  }

  reset(ghostReleaseDelayMultiplier = 1) {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.direction = this.index % 2 === 0 ? DIRECTIONS.left : DIRECTIONS.right;
    this.releaseDelay = this.index * 1.2 * ghostReleaseDelayMultiplier;
  }
}
