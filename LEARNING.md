# Snake

A browser-based Snake project exploring game loops, data structures, and collision detection.

## Version one

A 20 × 20 board, three-segment starting snake, food, growth, scoring, wall/self-collisions, and a full-board win. The movement interval is fixed at 150 ms. Each food adds one segment and one point.

| Action | Control |
| --- | --- |
| Start | Start button or Enter |
| Turn | Arrow keys or WASD |
| Pause/resume | Space or Pause/Resume button |
| Restart | Restart button while paused or finished |

Restart returns to the ready screen; press Start to begin a fresh run. Switching tabs/windows pauses automatically and requires explicit resume. Focused buttons use normal Enter/Space activation. Immediate reversal is rejected, and only one valid turn is accepted per tick.

The light green segment is the head and orange circles are food. Finished screens preserve the board and show the final score. The game requires a keyboard; the board adapts to narrow windows, but touch controls and a screen-reader equivalent for spatial gameplay are not implemented.

See [DESIGN.md](DESIGN.md) for decisions and scope, and [LEARNING.md](LEARNING.md) for concepts, collaboration, and verification. Version-two backgrounds, snake avatar, adjustable speed, sounds, and effects remain deferred.

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
- `src/view.ts`: maps game states to screen messages and available actions.
- `src/timing.ts`: fixed-interval timing without browser dependencies.
- `tests/game.test.mjs`: Node built-in tests for game rules and timing.
- `src/board.ts`: grid dimensions, coordinate type, and initial head-first snake data.
- `src/render.ts`: draws the background, grid, and snake from coordinates.
- `tsconfig.json`: strict TypeScript checking, including browser DOM types.
- `package.json`: development dependencies and commands.

Vite handles the local server and production build without an application framework. A separate TypeScript check catches type errors before building. Canvas coordinates use pixels: multiplying grid coordinates by the 20-pixel cell size maps (3, 5) to (60, 100).

## Verification

See [LEARNING.md](LEARNING.md) for checks actually performed. Run `npm test` for automated game-rule, timing, restart, and screen-state tests. Node strips TypeScript syntax for these tests; `npm run check` performs the separate type check.


## Build and hosting

`npm run build` produces `dist/`, containing browser-ready HTML, CSS, and JavaScript. Players do not need Node.js or TypeScript. Publish the contents through static hosting, then link to the game from the separate portfolio website repository. Hosting and deployment automation have not been configured, and no deployment is implied by a local commit.

## Final browser checklist

- Start, turn, eat food, and check score/growth.
- Pause/resume using keyboard and buttons; verify a full movement delay after resume.
- Switch windows/tabs; returning should stay paused.
- Lose to a wall and the body; confirm the final board and score remain visible.
- Restart from paused and finished states; verify zero score, initial snake, and no movement until Start.
- Tab through controls and activate with Enter/Space; check focus visibility and single activation.
- Check narrow and wide windows, console errors, and the production build with `npm run preview`.

The full-board win is covered by a deterministic automated fixture; a manual full-board run has not been claimed.


## Browser interaction tests

Five Playwright tests exercise the actual page in Chromium: Start and food/score rendering, keyboard pause/resume, restart from pause, wall loss and restart, and narrow-window layout. Every case also checks for browser runtime/console errors.

One-time setup on a new machine:

```sh
npm install --save-dev --save-exact @playwright/test@1.64.1
npx playwright install chromium
```

The test runner is recorded in package.json and package-lock.json. Clean dependency installs can use `npm ci`. Browser installation is a separate one-time download on each machine.

```sh
npm run test:browser
npm run test:browser:headed
```

Playwright builds the app and starts its production preview on port 4173, then stops it when the suite finishes. Keep port 4173 free; the normal development server can stay on 5173. Failure screenshots and traces are written under ignored `test-results/`.

The tests control the browser clock and food randomness for repeatability. They compare Canvas contents before/after actions rather than storing pixel-perfect screenshot baselines. These checks validate actual browser wiring, movement visibility, score text, overlays, buttons, and reset behavior, but do not replace aesthetic review or cover every game rule in-browser. Existing Node tests retain coverage of self-collision and full-board wins. This initial suite uses Chromium only; Firefox and WebKit are not yet tested.

The first local Chromium run passed four tests and exposed a focus-transfer bug in the wall-loss test. The controller now captures focus before hiding Pause; a full browser rerun is pending.


Browser rerun result: user-provided local terminal output confirms all five Chromium tests passed in 5.5 seconds after the focus fix. This verifies the tested production-page interactions and narrow layout, alongside the 20 passing Node tests, TypeScript check, and production build. Firefox/WebKit, aesthetic review, and a manual full-board win are outside this browser suite's coverage.
