const WALL_COLOR = "#234cff";
const WALL_EDGE = "#91b7ff";
const PELLET_COLOR = "#fff3a6";
const POWER_COLOR = "#ffd84d";
const FRIGHTENED_COLOR = "#3267ff";
const FRIGHTENED_FLASH = "#fff8d8";
const BACKGROUND = "#05050a";

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.tileSize = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    this.cssWidth = 0;
    this.cssHeight = 0;
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.cssWidth = Math.max(1, rect.width);
    this.cssHeight = Math.max(1, rect.height);
    this.canvas.width = Math.round(this.cssWidth * dpr);
    this.canvas.height = Math.round(this.cssHeight * dpr);
    this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render({ maze, pacman, ghosts, time, isFrightened, frightenedTimeLeft }) {
    const ctx = this.context;
    ctx.clearRect(0, 0, this.cssWidth, this.cssHeight);
    ctx.fillStyle = BACKGROUND;
    ctx.fillRect(0, 0, this.cssWidth, this.cssHeight);

    this.tileSize = Math.min(this.cssWidth / maze.width, this.cssHeight / maze.height);
    this.offsetX = (this.cssWidth - maze.width * this.tileSize) / 2;
    this.offsetY = (this.cssHeight - maze.height * this.tileSize) / 2;

    this.drawGridGlow(maze);
    this.drawWalls(maze);
    this.drawPellets(maze, time);
    for (const ghost of ghosts) {
      this.drawGhost(ghost, time, isFrightened, frightenedTimeLeft);
    }
    this.drawPacman(pacman, time);
  }

  drawGridGlow(maze) {
    const ctx = this.context;
    const radius = this.tileSize * 0.42;

    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = "#17204d";
    for (let row = 0; row < maze.height; row += 1) {
      for (let column = 0; column < maze.width; column += 1) {
        if (maze.getCell(column, row) !== "#") {
          const { x, y } = this.toPixel(column, row);
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    ctx.restore();
  }

  drawWalls(maze) {
    const ctx = this.context;
    const pad = Math.max(1.5, this.tileSize * 0.08);
    const radius = this.tileSize * 0.2;

    ctx.save();
    ctx.shadowColor = "rgba(38, 103, 255, 0.48)";
    ctx.shadowBlur = this.tileSize * 0.24;
    for (let row = 0; row < maze.height; row += 1) {
      for (let column = 0; column < maze.width; column += 1) {
        if (maze.getCell(column, row) !== "#") {
          continue;
        }

        const x = this.offsetX + column * this.tileSize + pad;
        const y = this.offsetY + row * this.tileSize + pad;
        const size = this.tileSize - pad * 2;
        this.roundRect(x, y, size, size, radius);
        ctx.fillStyle = WALL_COLOR;
        ctx.fill();
        ctx.lineWidth = Math.max(1, this.tileSize * 0.045);
        ctx.strokeStyle = WALL_EDGE;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  drawPellets(maze, time) {
    const ctx = this.context;

    for (let row = 0; row < maze.height; row += 1) {
      for (let column = 0; column < maze.width; column += 1) {
        const cell = maze.getCell(column, row);

        if (cell !== "." && cell !== "o") {
          continue;
        }

        const { x, y } = this.toPixel(column, row);
        const isPower = cell === "o";
        const pulse = isPower ? 0.84 + Math.sin(time * 7) * 0.16 : 1;
        const radius = this.tileSize * (isPower ? 0.19 * pulse : 0.07);
        ctx.beginPath();
        ctx.fillStyle = isPower ? POWER_COLOR : PELLET_COLOR;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawPacman(pacman, time) {
    const ctx = this.context;
    const { x, y } = this.toPixel(pacman.x, pacman.y);
    const radius = this.tileSize * 0.42;
    const mouth = 0.18 + Math.abs(Math.sin(time * 13)) * 0.28;
    const angle = directionAngle(pacman.facing);

    ctx.save();
    ctx.shadowColor = pacman.shadowColor;
    ctx.shadowBlur = this.tileSize * 0.28;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, radius, angle + mouth, angle + Math.PI * 2 - mouth);
    ctx.closePath();
    ctx.fillStyle = pacman.color;
    ctx.fill();
    ctx.restore();
  }

  drawGhost(ghost, time, isFrightened, frightenedTimeLeft) {
    const ctx = this.context;
    const { x, y } = this.toPixel(ghost.x, ghost.y);
    const radius = this.tileSize * 0.39;
    const bodyTop = y - radius * 0.86;
    const bodyBottom = y + radius * 0.86;
    const flash = isFrightened && frightenedTimeLeft < 2.2 && Math.floor(time * 8) % 2 === 0;
    const color = isFrightened ? (flash ? FRIGHTENED_FLASH : FRIGHTENED_COLOR) : ghost.color;

    ctx.save();
    ctx.shadowColor = `${color}55`;
    ctx.shadowBlur = this.tileSize * 0.22;
    ctx.beginPath();
    ctx.moveTo(x - radius, bodyBottom);
    ctx.lineTo(x - radius, y);
    ctx.arc(x, y, radius, Math.PI, 0);
    ctx.lineTo(x + radius, bodyBottom);

    const wave = radius / 3;
    for (let index = 0; index < 3; index += 1) {
      const waveX = x + radius - wave * (index * 2 + 1);
      ctx.quadraticCurveTo(waveX, bodyBottom - radius * 0.32, waveX - wave, bodyBottom);
    }

    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    this.drawGhostEyes(ghost, x, y, isFrightened);
    ctx.restore();
  }

  drawGhostEyes(ghost, x, y, isFrightened) {
    const ctx = this.context;
    const eyeRadius = this.tileSize * 0.095;
    const pupilRadius = this.tileSize * 0.042;
    const eyeOffsetX = this.tileSize * 0.13;
    const eyeOffsetY = this.tileSize * -0.06;
    const pupilShiftX = ghost.direction.dx * this.tileSize * 0.035;
    const pupilShiftY = ghost.direction.dy * this.tileSize * 0.035;

    if (isFrightened) {
      ctx.fillStyle = "#fff8d8";
      ctx.beginPath();
      ctx.arc(x - eyeOffsetX, y + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
      ctx.arc(x + eyeOffsetX, y + eyeOffsetY, pupilRadius, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.fillStyle = "#fff8d8";
    ctx.beginPath();
    ctx.arc(x - eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.arc(x + eyeOffsetX, y + eyeOffsetY, eyeRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#111019";
    ctx.beginPath();
    ctx.arc(x - eyeOffsetX + pupilShiftX, y + eyeOffsetY + pupilShiftY, pupilRadius, 0, Math.PI * 2);
    ctx.arc(x + eyeOffsetX + pupilShiftX, y + eyeOffsetY + pupilShiftY, pupilRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  toPixel(column, row) {
    return {
      x: this.offsetX + (column + 0.5) * this.tileSize,
      y: this.offsetY + (row + 0.5) * this.tileSize,
    };
  }

  roundRect(x, y, width, height, radius) {
    const ctx = this.context;
    const corner = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + corner, y);
    ctx.lineTo(x + width - corner, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + corner);
    ctx.lineTo(x + width, y + height - corner);
    ctx.quadraticCurveTo(x + width, y + height, x + width - corner, y + height);
    ctx.lineTo(x + corner, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - corner);
    ctx.lineTo(x, y + corner);
    ctx.quadraticCurveTo(x, y, x + corner, y);
  }
}

function directionAngle(direction) {
  if (direction.name === "left") {
    return Math.PI;
  }

  if (direction.name === "up") {
    return -Math.PI / 2;
  }

  if (direction.name === "down") {
    return Math.PI / 2;
  }

  return 0;
}
