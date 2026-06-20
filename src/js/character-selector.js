export class CharacterSelector {
  constructor({ container, characters, selectedId, onSelect }) {
    this.container = container;
    this.characters = characters;
    this.selectedId = selectedId;
    this.onSelect = onSelect;
    this.buttons = new Map();

    if (this.container) {
      this.render();
    }
  }

  setSelected(characterId) {
    this.selectedId = characterId;
    this.updateButtons();
  }

  render() {
    this.container.textContent = "";
    const fragment = document.createDocumentFragment();

    for (const character of this.characters) {
      const button = document.createElement("button");
      button.className = "character-option";
      button.type = "button";
      button.dataset.characterId = character.id;
      button.setAttribute("aria-pressed", String(character.id === this.selectedId));
      button.addEventListener("click", () => this.onSelect(character.id));

      const avatar = document.createElement("span");
      avatar.className = "character-avatar";
      avatar.style.setProperty("--character-color", character.color);
      avatar.style.setProperty("--character-accent", character.accentColor);
      avatar.setAttribute("aria-hidden", "true");

      const body = document.createElement("span");
      body.className = "character-copy";

      const name = document.createElement("strong");
      name.className = "character-name";
      name.textContent = character.shortName;

      const description = document.createElement("span");
      description.className = "character-description";
      description.textContent = character.description;

      const stats = document.createElement("span");
      stats.className = "character-stats";
      stats.textContent = this.formatStats(character);

      body.append(name, description, stats);
      button.append(avatar, body);
      fragment.append(button);
      this.buttons.set(character.id, button);
    }

    this.container.append(fragment);
  }

  updateButtons() {
    for (const [characterId, button] of this.buttons) {
      button.setAttribute("aria-pressed", String(characterId === this.selectedId));
    }
  }

  formatStats(character) {
    const { lives, scoreMultiplier, speedMultiplier, powerDurationMultiplier } = character.stats;
    return `${speedMultiplier.toFixed(2)}x speed · ${lives} lives · ${scoreMultiplier.toFixed(2)}x score · ${powerDurationMultiplier.toFixed(2)}x power`;
  }
}
