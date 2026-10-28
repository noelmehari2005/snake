# Snake

A browser-based Snake project exploring game loops, data structures, and collision detection.

## Current milestone

Milestone 1 draws a 20 × 20 grid and a stationary three-segment snake near the center, facing right. The head uses a lighter color. Gameplay has not been implemented. See [DESIGN.md](DESIGN.md) for the approved scope and version-two backlog.

## Run locally

Use Node.js 22.12+ (Node 24 is suitable) and npm. From this repository:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Use Ctrl+C to stop the server.

```sh
npm run check
npm run build
npm run preview
```

`check` runs the TypeScript checker. `build` checks types and creates static files in `dist/`. `preview` serves that build locally. Relative asset paths allow the build to be hosted under a subdirectory; deployment is not configured yet.

The committed `package-lock.json` locks dependency versions. Use `npm ci` for a clean installation of those versions.

## Files and decisions

- `index.html`: page structure and Canvas element.
- `src/style.css`: basic readable layout and responsive Canvas sizing.
- `src/main.ts`: connects the Canvas to the drawing function.
- `src/board.ts`: grid dimensions, coordinate type, and initial head-first snake data.
- `src/render.ts`: draws the background, grid, and snake from coordinates.
- `tsconfig.json`: strict TypeScript checking, including browser DOM types.
- `package.json`: development dependencies and commands.

Vite handles the local server and production build without an application framework. A separate TypeScript check catches type errors before building. Canvas coordinates use pixels: multiplying grid coordinates by the 20-pixel cell size maps (3, 5) to (60, 100).

## Verification

See [LEARNING.md](LEARNING.md) for checks actually performed. Automated game-rule tests will be introduced with the relevant gameplay milestones.
