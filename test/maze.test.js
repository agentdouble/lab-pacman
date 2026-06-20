import assert from "node:assert/strict";
import test from "node:test";

import { GHOSTS, MAZE_DEFINITIONS } from "../src/js/constants.js";
import { Maze } from "../src/js/maze.js";
import { legalDirections } from "../src/js/movement.js";

const PELLET_CELLS = new Set([".", "o"]);
const REQUIRED_GHOST_COUNT = Object.keys(GHOSTS).length;

test("all configured maze types are distinct playable layouts", () => {
  const layouts = new Set();

  for (const definition of Object.values(MAZE_DEFINITIONS)) {
    const maze = new Maze(definition.id);
    const serializedLayout = definition.layout.join("\n");

    assert.equal(definition.layout.length, 22, `${definition.id} should use the canvas-friendly maze height`);
    assert.ok(!layouts.has(serializedLayout), `${definition.id} should not duplicate another maze layout`);
    assert.ok(serializedLayout.includes("#"), `${definition.id} should include walls`);
    assert.ok(serializedLayout.includes("."), `${definition.id} should include pellets`);
    assert.ok(serializedLayout.includes("o"), `${definition.id} should include power pellets`);
    assert.equal(maze.ghostSpawns.length, REQUIRED_GHOST_COUNT, `${definition.id} should spawn all ghosts`);
    assert.ok(maze.pelletsRemaining > 0, `${definition.id} should have a win target`);

    layouts.add(serializedLayout);
  }
});

test("pellets, bonuses, and start positions are reachable on every maze", () => {
  for (const definition of Object.values(MAZE_DEFINITIONS)) {
    const maze = new Maze(definition.id);
    const reachable = collectReachableTiles(maze);

    assert.ok(reachable.has(key(maze.pacmanSpawn)), `${definition.id} Pac-Man spawn should be reachable`);

    for (const ghost of maze.ghostSpawns) {
      assert.ok(reachable.has(key(ghost)), `${definition.id} ${ghost.id} spawn should be reachable`);
    }

    for (let y = 0; y < maze.height; y += 1) {
      for (let x = 0; x < maze.width; x += 1) {
        if (PELLET_CELLS.has(maze.initialGrid[y][x])) {
          assert.ok(reachable.has(key({ x, y })), `${definition.id} pellet at ${x},${y} should be reachable`);
        }
      }
    }
  }
});

test("actors can move from their spawn tiles on every maze", () => {
  for (const definition of Object.values(MAZE_DEFINITIONS)) {
    const maze = new Maze(definition.id);

    assert.ok(
      legalDirections({ ...maze.pacmanSpawn }, maze).length > 0,
      `${definition.id} should allow Pac-Man to leave spawn`,
    );

    for (const ghost of maze.ghostSpawns) {
      assert.ok(
        legalDirections({ x: ghost.x, y: ghost.y }, maze).length > 0,
        `${definition.id} should allow ${ghost.id} to leave spawn`,
      );
    }
  }
});

test("every maze can be cleared by eating each reachable pellet", () => {
  for (const definition of Object.values(MAZE_DEFINITIONS)) {
    const maze = new Maze(definition.id);
    let scoreFromPellets = 0;

    for (let y = 0; y < maze.height; y += 1) {
      for (let x = 0; x < maze.width; x += 1) {
        if (PELLET_CELLS.has(maze.getCell(x, y))) {
          scoreFromPellets += maze.eatAt(x, y).points;
        }
      }
    }

    assert.equal(maze.pelletsRemaining, 0, `${definition.id} should reach the level-complete condition`);
    assert.ok(scoreFromPellets > 0, `${definition.id} should award points while clearing the maze`);
  }
});

function collectReachableTiles(maze) {
  const reachable = new Set([key(maze.pacmanSpawn)]);
  const queue = [maze.pacmanSpawn];
  const offsets = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];

  while (queue.length > 0) {
    const tile = queue.shift();

    for (const offset of offsets) {
      const next = {
        x: maze.normalizeColumn(tile.x + offset.dx),
        y: tile.y + offset.dy,
      };

      if (!maze.isInsideRow(next.y) || !maze.isWalkable(next.x, next.y)) {
        continue;
      }

      const nextKey = key(next);

      if (!reachable.has(nextKey)) {
        reachable.add(nextKey);
        queue.push(next);
      }
    }
  }

  return reachable;
}

function key({ x, y }) {
  return `${x},${y}`;
}
