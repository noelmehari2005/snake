# Snake

A browser-based Snake project exploring game loops, data structures, and collision detection.

## Current milestone

Milestone 3 adds orange food, growth, scoring, wall/self-collision losses, and a full-board win. Movement runs every 150 ms. Use arrows/WASD to turn, Enter or Start to begin, and Space or the button to pause/resume. Losing focus pauses automatically.

Eating adds one segment and one point. A collision freezes the last valid board and displays the final score. Filling the board wins. Reload to reset; restart controls and final interface polish belong to milestone 4. See [DESIGN.md](DESIGN.md) for the complete scope.

## Run locally

Use Node.js 22.12+ (Node 24 is suitable) and npm. From this repository:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use Ctrl+C to stop the server.

```sh
npm run check
npm test
npm run build
npm run preview
```

`check` runs the TypeScript checker. `build` checks types and creates static files in `dist/`. `preview` serves that build locally. Relative asset paths allow the build to be hosted under a subdirectory; deployment is not configured yet.

The committed `package-lock.json` locks dependency versions. Use `npm ci` for a clean installation of those versions.

## Files and decisions

- `index.html`: page structure and Canvas element.
- `src/style.css`: basic readable layout and responsive Canvas sizing.
- `src/main.ts`: connects browser controls, focus events, animation timing, and rendering.
- `src/game.ts`: state transitions, food selection, scoring, collisions, and one movement step.
- `src/timing.ts`: fixed-interval timing without browser dependencies.
- `tests/game.test.mjs`: Node built-in tests for game rules and timing.
- `src/board.ts`: grid dimensions, coordinate type, and initial head-first snake data.
- `src/render.ts`: draws the background, grid, and snake from coordinates.
- `tsconfig.json`: strict TypeScript checking, including browser DOM types.
- `package.json`: development dependencies and commands.

Vite handles the local server and production build without an application framework. A separate TypeScript check catches type errors before building. Canvas coordinates use pixels: multiplying grid coordinates by the 20-pixel cell size maps (3, 5) to (60, 100).

## Verification

See [LEARNING.md](LEARNING.md) for checks actually performed. Run `npm test` for automated movement and timing tests. Node strips TypeScript syntax for these tests; `npm run check` performs the separate type check.
