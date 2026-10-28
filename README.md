# Snake

A browser-based Snake project exploring game loops, data structures, and collision detection.

## Current milestone

Milestone 2 adds movement every 150 ms, arrow/WASD turns, and Start/Pause/Resume. Press Enter to start and Space to pause or resume. Switching tabs or windows automatically pauses; resuming is explicit.

This is an intermediate movement preview: reaching a wall pauses the snake rather than ending a run. Resume and turn before the next tick to move away, or reload to reset. Food, scoring, self-collisions, and wall-loss behavior arrive in milestone 3. See [DESIGN.md](DESIGN.md) for the complete scope.

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
- `src/game.ts`: state transitions, queued direction, and one movement step.
- `src/timing.ts`: fixed-interval timing without browser dependencies.
- `tests/game.test.mjs`: Node built-in tests for movement and timing.
- `src/board.ts`: grid dimensions, coordinate type, and initial head-first snake data.
- `src/render.ts`: draws the background, grid, and snake from coordinates.
- `tsconfig.json`: strict TypeScript checking, including browser DOM types.
- `package.json`: development dependencies and commands.

Vite handles the local server and production build without an application framework. A separate TypeScript check catches type errors before building. Canvas coordinates use pixels: multiplying grid coordinates by the 20-pixel cell size maps (3, 5) to (60, 100).

## Verification

See [LEARNING.md](LEARNING.md) for checks actually performed. Run `npm test` for automated movement and timing tests. Node strips TypeScript syntax for these tests; `npm run check` performs the separate type check.
