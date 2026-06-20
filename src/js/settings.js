import { DEFAULT_ENEMY_COLOR, ENEMY_COLOR_OPTIONS } from "./constants.js";

const ENEMY_COLOR_STORAGE_KEY = "pacman.enemyColor";

export class EnemyColorSettings {
  constructor({ element, onChange }) {
    if (!element) {
      throw new Error("Enemy color settings element is required");
    }

    this.element = element;
    this.onChange = onChange;
    this.buttons = new Map();
    this.color = readStoredEnemyColor();

    this.render();
    this.select(this.color, { notify: false, persist: false });
  }

  get value() {
    return this.color;
  }

  render() {
    this.element.textContent = "";

    const label = document.createElement("span");
    label.className = "metric-label";
    label.textContent = "Enemies";

    const hint = document.createElement("span");
    hint.className = "setting-hint";
    hint.textContent = "Kept on restart";

    const options = document.createElement("div");
    options.className = "enemy-color-options";
    options.setAttribute("role", "radiogroup");
    options.setAttribute("aria-label", "Enemy color. New games keep the selected color.");

    for (const option of ENEMY_COLOR_OPTIONS) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "enemy-color-option";
      button.style.setProperty("--enemy-color", option.color);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-label", `${option.label} enemies`);
      button.addEventListener("click", () => this.select(option.color));

      const swatch = document.createElement("span");
      swatch.className = "enemy-color-swatch";
      swatch.setAttribute("aria-hidden", "true");
      button.append(swatch);

      this.buttons.set(option.color, button);
      options.append(button);
    }

    this.element.append(label, hint, options);
  }

  select(color, { notify = true, persist = true } = {}) {
    const option = findEnemyColorOption(color) ?? findEnemyColorOption(DEFAULT_ENEMY_COLOR);
    this.color = option.color;

    for (const [buttonColor, button] of this.buttons) {
      const isSelected = buttonColor === this.color;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-checked", String(isSelected));
    }

    if (persist) {
      writeStoredEnemyColor(this.color);
    }

    if (notify) {
      this.onChange?.(this.color);
    }
  }
}

export function findEnemyColorOption(color) {
  if (!color) {
    return null;
  }

  const normalized = color.toLowerCase();
  return ENEMY_COLOR_OPTIONS.find((option) => option.color.toLowerCase() === normalized) ?? null;
}

function readStoredEnemyColor() {
  try {
    const storedColor = window.localStorage.getItem(ENEMY_COLOR_STORAGE_KEY);
    return findEnemyColorOption(storedColor)?.color ?? DEFAULT_ENEMY_COLOR;
  } catch {
    return DEFAULT_ENEMY_COLOR;
  }
}

function writeStoredEnemyColor(color) {
  try {
    window.localStorage.setItem(ENEMY_COLOR_STORAGE_KEY, color);
  } catch {
    // The setting still applies for the current game when storage is unavailable.
  }
}
