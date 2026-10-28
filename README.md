# Snake

A browser-based Snake project exploring game loops, data structures, and collision detection.

## Current milestone

Milestone 0 contains a setup preview: a dark Canvas and one green square at grid cell (3, 5). Gameplay has not been implemented. See [DESIGN.md](DESIGN.md) for the approved scope and version-two backlog.

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

The first successful installation generates `package-lock.json`; commit it with the setup to lock transitive dependencies. Subsequent clean installations can use `npm ci`.

## Files and decisions

- `index.html`: page structure and Canvas element.
- `src/style.css`: basic readable layout and responsive Canvas sizing.
- `src/main.ts`: obtains the drawing context, draws the background and one square, and updates the status text.
- `tsconfig.json`: strict TypeScript checking, including browser DOM types.
- `package.json`: development dependencies and commands.

Vite handles the local server and production build without an application framework. A separate TypeScript check catches type errors before building. Canvas coordinates use pixels: multiplying grid coordinates by the 20-pixel cell size maps (3, 5) to (60, 100).

## Verification

See [LEARNING.md](LEARNING.md) for checks actually performed. Automated game-rule tests will be introduced with the relevant gameplay milestones.
