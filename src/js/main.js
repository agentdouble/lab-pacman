import { DEFAULT_MAZE_ID, MAZE_OPTIONS } from "./constants.js";
import { PacmanGame } from "./game.js";

const mazeSelectElement = document.querySelector("#mazeSelect");

if (mazeSelectElement) {
  for (const maze of MAZE_OPTIONS) {
    const option = document.createElement("option");
    option.value = maze.id;
    option.textContent = maze.name;
    mazeSelectElement.append(option);
  }

  mazeSelectElement.value = DEFAULT_MAZE_ID;
}

const game = new PacmanGame({
  canvas: document.querySelector("#gameCanvas"),
  scoreElement: document.querySelector("#score"),
  levelElement: document.querySelector("#level"),
  livesElement: document.querySelector("#lives"),
  messageElement: document.querySelector("#message"),
  pauseButton: document.querySelector("#pauseButton"),
  restartButton: document.querySelector("#restartButton"),
  mazeSelectElement,
  characterOptionsElement: document.querySelector("#characterOptions"),
  characterRuleElement: document.querySelector("#characterRule"),
  difficultySelect: document.querySelector("#difficultySelect"),
  colorOptionsElement: document.querySelector("#pacmanColorOptions"),
  colorStatusElement: document.querySelector("#pacmanColorStatus"),
  enemyColorElement: document.querySelector("#enemyColorSetting"),
});

game.start();
