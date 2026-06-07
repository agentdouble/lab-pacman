import { DIRECTION_LIST, DIRECTIONS, OPPOSITE_DIRECTION } from "./constants.js";

const CENTER_EPSILON = 0.04;

export function tileFromPosition(entity, maze) {
  return {
    x: maze.normalizeColumn(Math.round(entity.x)),
    y: Math.round(entity.y),
  };
}

export function isCentered(entity) {
  return (
    Math.abs(entity.x - Math.round(entity.x)) <= CENTER_EPSILON &&
    Math.abs(entity.y - Math.round(entity.y)) <= CENTER_EPSILON
  );
}

export function snapToCenter(entity, maze) {
  entity.x = maze.normalizeColumn(Math.round(entity.x));
  entity.y = Math.round(entity.y);
}

export function canMoveFrom(entity, maze, direction) {
  if (!direction || direction.name === DIRECTIONS.none.name) {
    return false;
  }

  const tile = tileFromPosition(entity, maze);
  return maze.isWalkable(tile.x + direction.dx, tile.y + direction.dy);
}

export function legalDirections(entity, maze) {
  return DIRECTION_LIST.filter((direction) => canMoveFrom(entity, maze, direction));
}

export function withoutReverse(directions, currentDirection) {
  const reverseName = OPPOSITE_DIRECTION[currentDirection.name];
  const filtered = directions.filter((direction) => direction.name !== reverseName);
  return filtered.length > 0 ? filtered : directions;
}

export function moveEntity(entity, maze, dt, speed) {
  let distance = speed * dt;

  while (distance > 0) {
    if (entity.direction.name === DIRECTIONS.none.name) {
      return;
    }

    if (isCentered(entity)) {
      snapToCenter(entity, maze);

      if (!canMoveFrom(entity, maze, entity.direction)) {
        entity.direction = DIRECTIONS.none;
        return;
      }
    }

    const target = nextCenter(entity);
    const distanceToTarget = Math.max(0, Math.hypot(target.x - entity.x, target.y - entity.y));
    const step = Math.min(distance, distanceToTarget || distance);

    entity.x += entity.direction.dx * step;
    entity.y += entity.direction.dy * step;
    distance -= step;

    if (distanceToTarget <= step + 0.0001) {
      entity.x = target.x;
      entity.y = target.y;

      if (entity.x < 0) {
        entity.x = maze.width - 1;
      } else if (entity.x > maze.width - 1) {
        entity.x = 0;
      }

      if (distanceToTarget === 0) {
        return;
      }
    }
  }
}

function nextCenter(entity) {
  if (entity.direction.dx > 0) {
    return { x: Math.floor(entity.x + 1), y: entity.y };
  }

  if (entity.direction.dx < 0) {
    return { x: Math.ceil(entity.x - 1), y: entity.y };
  }

  if (entity.direction.dy > 0) {
    return { x: entity.x, y: Math.floor(entity.y + 1) };
  }

  if (entity.direction.dy < 0) {
    return { x: entity.x, y: Math.ceil(entity.y - 1) };
  }

  return { x: entity.x, y: entity.y };
}
