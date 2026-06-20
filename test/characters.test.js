import assert from "node:assert/strict";
import test from "node:test";

import {
  CHARACTERS,
  DEFAULT_CHARACTER_ID,
  getCharacterById,
  getDefaultCharacter,
  scoreForCharacter,
} from "../src/js/characters.js";

test("characters expose unique playable profiles with stats", () => {
  const ids = new Set(CHARACTERS.map((character) => character.id));

  assert.equal(ids.size, CHARACTERS.length);
  assert.ok(CHARACTERS.length >= 3);

  for (const character of CHARACTERS) {
    assert.equal(typeof character.name, "string");
    assert.ok(character.name.length > 0);
    assert.equal(typeof character.description, "string");
    assert.ok(character.description.length > 0);
    assert.ok(character.stats.speedMultiplier > 0);
    assert.ok(character.stats.lives > 0);
    assert.ok(character.stats.scoreMultiplier > 0);
    assert.ok(character.stats.powerDurationMultiplier > 0);
  }
});

test("default and fallback character are classic", () => {
  assert.equal(getDefaultCharacter().id, DEFAULT_CHARACTER_ID);
  assert.equal(getCharacterById("missing").id, DEFAULT_CHARACTER_ID);
});

test("score multiplier changes awarded points", () => {
  const classicScore = scoreForCharacter(100, getCharacterById("classic"));
  const cometScore = scoreForCharacter(100, getCharacterById("comet"));
  const guardianScore = scoreForCharacter(100, getCharacterById("guardian"));

  assert.equal(classicScore, 100);
  assert.equal(cometScore, 135);
  assert.equal(guardianScore, 90);
});
