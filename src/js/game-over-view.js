export class GameOverView {
  constructor({ screenElement, scoreElement, restartButton, onRestart }) {
    this.screenElement = screenElement;
    this.scoreElement = scoreElement;
    this.restartButton = restartButton;

    this.restartButton.addEventListener("click", onRestart);
    this.hide();
  }

  show(score) {
    this.scoreElement.textContent = String(score);
    this.screenElement.hidden = false;
    this.screenElement.setAttribute("aria-hidden", "false");
    this.restartButton.focus({ preventScroll: true });
  }

  hide() {
    this.screenElement.hidden = true;
    this.screenElement.setAttribute("aria-hidden", "true");
  }
}
