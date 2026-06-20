import { PacmanGame } from "./game.js";

const game = new PacmanGame({
  canvas: document.querySelector("#gameCanvas"),
  scoreElement: document.querySelector("#score"),
  levelElement: document.querySelector("#level"),
  livesElement: document.querySelector("#lives"),
  messageElement: document.querySelector("#message"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  characterOptionsElement: document.querySelector("#characterOptions"),
  characterRuleElement: document.querySelector("#characterRule"),
  difficultySelect: document.querySelector("#difficultySelect"),
  colorOptionsElement: document.querySelector("#pacmanColorOptions"),
  colorStatusElement: document.querySelector("#pacmanColorStatus"),
  enemyColorElement: document.querySelector("#enemyColorSetting"),
});

game.start();
