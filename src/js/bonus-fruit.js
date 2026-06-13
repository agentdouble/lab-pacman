import {
  BONUS_FRUIT_DURATION,
  BONUS_FRUIT_INTERVAL,
  BONUS_FRUIT_POINTS,
  BONUS_FRUIT_SPAWN,
  BONUS_FRUIT_START_DELAY,
} from "./constants.js";

export class BonusFruit {
  constructor(spawnTile = BONUS_FRUIT_SPAWN) {
    this.spawnTile = { ...spawnTile };
    this.points = BONUS_FRUIT_POINTS;
    this.reset(0);
  }

  reset(time = 0) {
    this.active = false;
    this.tile = null;
    this.spawnedAt = 0;
    this.expiresAt = 0;
    this.nextSpawnAt = time + BONUS_FRUIT_START_DELAY;
  }

  update(time, maze) {
    if (this.active) {
      if (time >= this.expiresAt) {
        this.dismiss(time);
      }

      return;
    }

    if (time >= this.nextSpawnAt) {
      this.spawn(time, maze);
    }
  }

  collectAt(tile, maze, time) {
    if (!this.active || !this.tile || tile.y !== this.tile.y) {
      return 0;
    }

    if (maze.normalizeColumn(tile.x) !== maze.normalizeColumn(this.tile.x)) {
      return 0;
    }

    this.dismiss(time);
    return this.points;
  }

  spawn(time, maze) {
    this.tile = this.getSpawnTile(maze);
    this.active = true;
    this.spawnedAt = time;
    this.expiresAt = time + BONUS_FRUIT_DURATION;
  }

  dismiss(time) {
    this.active = false;
    this.tile = null;
    this.spawnedAt = 0;
    this.expiresAt = 0;
    this.nextSpawnAt = time + BONUS_FRUIT_INTERVAL;
  }

  getSpawnTile(maze) {
    if (maze.isWalkable(this.spawnTile.x, this.spawnTile.y)) {
      return { ...this.spawnTile };
    }

    return { ...maze.pacmanSpawn };
  }
}
