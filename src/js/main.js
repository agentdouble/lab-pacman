import { PacmanGame } from "./game.js";

const game = new PacmanGame({
  canvas: document.querySelector("#gameCanvas"),
  scoreElement: document.querySelector("#score"),
  levelElement: document.querySelector("#level"),
  livesElement: document.querySelector("#lives"),
  messageElement: document.querySelector("#message"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  colorButtons: document.querySelectorAll("[data-pacman-color]"),
  colorNameElement: document.querySelector("#pacmanColorName"),
});

game.start();
