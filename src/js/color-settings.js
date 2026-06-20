import { DEFAULT_PACMAN_COLOR, PACMAN_COLORS } from "./constants.js";

export class PacmanColorSettings {
  constructor({
    container,
    statusElement,
    colors = PACMAN_COLORS,
    defaultColor = DEFAULT_PACMAN_COLOR,
    onColorChange,
  }) {
    this.container = container;
    this.statusElement = statusElement;
    this.colors = colors;
    this.onColorChange = onColorChange;
    this.buttons = new Map();
    this.selectedColor = defaultColor;

    this.render();
    this.select(defaultColor.id, { notify: false });
  }

  render() {
    this.container.innerHTML = "";

    for (const color of this.colors) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "color-swatch";
      button.dataset.colorId = color.id;
      button.style.setProperty("--swatch-color", color.value);
      button.setAttribute("aria-label", `Pac-Man ${color.name}`);
      button.setAttribute("aria-pressed", "false");
      button.title = color.name;
      button.addEventListener("click", () => this.select(color.id));

      this.buttons.set(color.id, button);
      this.container.append(button);
    }
  }

  select(colorId, { notify = true } = {}) {
    const color = this.colors.find((candidate) => candidate.id === colorId) ?? DEFAULT_PACMAN_COLOR;
    this.selectedColor = color;

    for (const [id, button] of this.buttons) {
      button.setAttribute("aria-pressed", String(id === color.id));
    }

    if (this.statusElement) {
      this.statusElement.textContent = `${color.name}. Restart keeps color.`;
    }

    if (notify) {
      this.onColorChange?.(color);
    }
  }

  getColor() {
    return this.selectedColor;
  }
}
