# MEMORY

- 2026-06-07: The Pac-Man project is a static, dependency-free browser game. It uses ES modules under `src/js/`, renders with Canvas, and can be served from the project root with `python3 -m http.server 5173`.
- 2026-06-07: Keep game code modular: `maze.js` owns layout/pellets, `movement.js` owns grid movement, `entities.js` owns Pac-Man and ghost state, `renderer.js` owns Canvas drawing, `input.js` owns keyboard/touch controls, and `game.js` coordinates the loop.
- 2026-06-08: GitHub remote for the project is `https://github.com/agentdouble/lab-pacman.git`; use `main` as the primary branch.
- 2026-06-20: Enemy color selection lives in `src/js/settings.js`, persists with localStorage key `pacman.enemyColor`, and `PacmanGame.setEnemyColor()` applies the chosen readable color to every ghost while `renderer.js` still overrides ghosts with frightened-state colors.
- 2026-06-20: Difficulty settings live in `src/js/difficulty.js`; `game.js` applies them to Pac-Man speed, ghost speed, frightened speed, power pellet duration, and ghost release delays, while `index.html` exposes the selector.
- 2026-06-20: Pac-Man color selection is handled by `src/js/color-settings.js`; the selected color is stored on the `Pacman` entity and intentionally persists when using Restart.
