import { PacmanGame } from "./game.js";

const game = new PacmanGame({
  canvas: document.querySelector("#gameCanvas"),
  scoreElement: document.querySelector("#score"),
  levelElement: document.querySelector("#level"),
  livesElement: document.querySelector("#lives"),
  messageElement: document.querySelector("#message"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  gameOverScreen: document.querySelector("#gameOverScreen"),
  finalScoreElement: document.querySelector("#finalScore"),
  gameOverRestartButton: document.querySelector("#gameOverRestartButton"),
});

game.start();
