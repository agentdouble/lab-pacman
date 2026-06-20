import { DEFAULT_MAZE_ID, GHOSTS, MAZE_DEFINITIONS } from "./constants.js";

const WALL = "#";
const PELLET = ".";
const POWER_PELLET = "o";
const PACMAN_SPAWN = "M";

export class Maze {
  constructor(mazeDefinition = DEFAULT_MAZE_ID) {
    const definition = getMazeDefinition(mazeDefinition);
    const layout = definition.layout;

    this.id = definition.id;
    this.name = definition.name;
    this.height = layout.length;
    this.width = layout[0].length;
    this.initialGrid = [];
    this.pacmanSpawn = null;
    this.ghostSpawns = [];

    for (const [rowIndex, row] of layout.entries()) {
      if (row.length !== this.width) {
        throw new Error(`Maze row ${rowIndex} has ${row.length} cells, expected ${this.width}.`);
      }

      this.initialGrid[rowIndex] = [...row].map((cell, columnIndex) => {
        if (cell === PACMAN_SPAWN) {
          this.pacmanSpawn = { x: columnIndex, y: rowIndex };
          return " ";
        }

        if (GHOSTS[cell]) {
          this.ghostSpawns.push({
            ...GHOSTS[cell],
            x: columnIndex,
            y: rowIndex,
          });
          return " ";
        }

        return cell;
      });
    }

    if (!this.pacmanSpawn) {
      throw new Error("Maze is missing a Pac-Man spawn tile.");
    }

    if (this.ghostSpawns.length === 0) {
      throw new Error("Maze is missing ghost spawn tiles.");
    }

    this.resetPellets();
  }

  resetPellets() {
    this.grid = this.initialGrid.map((row) => [...row]);
    this.pelletsRemaining = this.grid.reduce(
      (count, row) => count + row.filter((cell) => cell === PELLET || cell === POWER_PELLET).length,
      0,
    );
  }

  normalizeColumn(column) {
    return ((column % this.width) + this.width) % this.width;
  }

  isInsideRow(row) {
    return row >= 0 && row < this.height;
  }

  getCell(column, row) {
    if (!this.isInsideRow(row)) {
      return WALL;
    }

    return this.grid[row][this.normalizeColumn(column)];
  }

  isWalkable(column, row) {
    return this.getCell(column, row) !== WALL;
  }

  eatAt(column, row) {
    if (!this.isInsideRow(row)) {
      return { points: 0, powered: false };
    }

    const normalizedColumn = this.normalizeColumn(column);
    const cell = this.grid[row][normalizedColumn];

    if (cell === PELLET) {
      this.grid[row][normalizedColumn] = " ";
      this.pelletsRemaining -= 1;
      return { points: 10, powered: false };
    }

    if (cell === POWER_PELLET) {
      this.grid[row][normalizedColumn] = " ";
      this.pelletsRemaining -= 1;
      return { points: 50, powered: true };
    }

    return { points: 0, powered: false };
  }
}

export function getMazeDefinition(mazeDefinition = DEFAULT_MAZE_ID) {
  if (typeof mazeDefinition === "string") {
    return MAZE_DEFINITIONS[mazeDefinition] ?? MAZE_DEFINITIONS[DEFAULT_MAZE_ID];
  }

  return mazeDefinition ?? MAZE_DEFINITIONS[DEFAULT_MAZE_ID];
}
