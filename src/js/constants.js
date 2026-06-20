export const DIRECTIONS = Object.freeze({
  none: Object.freeze({ name: "none", dx: 0, dy: 0 }),
  up: Object.freeze({ name: "up", dx: 0, dy: -1 }),
  right: Object.freeze({ name: "right", dx: 1, dy: 0 }),
  down: Object.freeze({ name: "down", dx: 0, dy: 1 }),
  left: Object.freeze({ name: "left", dx: -1, dy: 0 }),
});

export const DIRECTION_LIST = Object.freeze([
  DIRECTIONS.up,
  DIRECTIONS.right,
  DIRECTIONS.down,
  DIRECTIONS.left,
]);

export const OPPOSITE_DIRECTION = Object.freeze({
  up: "down",
  right: "left",
  down: "up",
  left: "right",
  none: "none",
});

export const LEVEL_LAYOUT = Object.freeze([
  "#####################",
  "#.........#.........#",
  "#.###.###.#.###.###.#",
  "#o###.###.#.###.###o#",
  "#...................#",
  "#.###.#.#####.#.###.#",
  "#.....#...#...#.....#",
  "#####.### # ###.#####",
  "     .#       #.     ",
  "#####.# ##### #.#####",
  "     . B P I C .     ",
  "#####.# ##### #.#####",
  "     .#       #.     ",
  "#####.# ##### #.#####",
  "#.........#.........#",
  "#.###.###.#.###.###.#",
  "#o..#.....M.....#..o#",
  "###.#.#.#####.#.#.###",
  "#...#.#...#...#.#...#",
  "#.#####.#.#.#.#####.#",
  "#...................#",
  "#####################",
]);

export const PACMAN_SPEED = 7.2;
export const GHOST_SPEED = 6.15;
export const FRIGHTENED_GHOST_SPEED = 4.7;
export const POWER_DURATION = 7.5;
export const STARTING_LIVES = 3;

export const PACMAN_COLORS = Object.freeze([
  Object.freeze({
    id: "classic",
    name: "Classic yellow",
    value: "#ffd84d",
    shadow: "rgba(255, 216, 77, 0.42)",
  }),
  Object.freeze({
    id: "lime",
    name: "Lime",
    value: "#6dff7a",
    shadow: "rgba(109, 255, 122, 0.4)",
  }),
  Object.freeze({
    id: "cyan",
    name: "Cyan",
    value: "#38d7ff",
    shadow: "rgba(56, 215, 255, 0.4)",
  }),
  Object.freeze({
    id: "pink",
    name: "Pink",
    value: "#ff83c7",
    shadow: "rgba(255, 131, 199, 0.38)",
  }),
  Object.freeze({
    id: "orange",
    name: "Orange",
    value: "#ff9b3d",
    shadow: "rgba(255, 155, 61, 0.38)",
  }),
]);

export const DEFAULT_PACMAN_COLOR = PACMAN_COLORS[0];

export const GHOSTS = Object.freeze({
  B: Object.freeze({
    id: "blinky",
    color: "#ff4d67",
    scatterTarget: Object.freeze({ x: 19, y: 1 }),
  }),
  P: Object.freeze({
    id: "pinky",
    color: "#ff83c7",
    scatterTarget: Object.freeze({ x: 1, y: 1 }),
  }),
  I: Object.freeze({
    id: "inky",
    color: "#38d7ff",
    scatterTarget: Object.freeze({ x: 19, y: 20 }),
  }),
  C: Object.freeze({
    id: "clyde",
    color: "#ff9b3d",
    scatterTarget: Object.freeze({ x: 1, y: 20 }),
  }),
});
