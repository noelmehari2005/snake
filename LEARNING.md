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


## Version two, milestone 1: live speed selection

The discussion approved Slow/Normal/Fast presets, revised the initial paused-only proposal to allow changes while playing, and selected clock reset as a trial. The user specifically requested revisiting that choice before commit. No commit or push has been made.

- Speed is session configuration, separate from game state. Restart recreates run data while retaining the preference. Refresh reinitializes it to Normal.
- `settings.ts` centralizes labels/intervals and validates button values. `advanceClock` accepts the selected interval while retaining the version-one default for existing callers.
- On an actual preference change, `freshClock(performance.now())` starts a complete new interval at the event time. The playing/paused state and pending turn are untouched. Re-selecting the active speed is a no-op.
- Native buttons avoid a select popup interrupting focus; their pressed state communicates the active selection. Enter/Space keeps native button activation; direction keys still reach the game while a speed button is focused.
- Node tests cover default/name validation, each threshold, switching faster/slower with reset, and stall handling. Browser tests additionally check visible movement, preserved pending turn, unchanged playing/paused state, restart persistence, and refresh defaults.
- Verification: `npm run check`, all 26 Node tests, `npm run build`, and `git diff --check` pass. `npm run test:browser` could not start its production preview because binding 127.0.0.1:4173 failed with EPERM. All eight browser cases require a local rerun; prior five-test success does not verify the new changes.

Review before commit: try changing speed mid-run and decide whether the full-interval reset feels acceptable or whether fractional progress should carry over. Also try pausing, switching speed, resuming, and restarting. The added browser test reads the current head color to verify a preserved turn; revisit that rendering assertion when implementing the avatar.


Speed milestone review outcome: the user tried live speed changes and approved retaining the full-interval clock reset. A subsequent user-provided terminal run confirms all eight Chromium browser tests passed in 6.8 seconds. Combined with 26 passing Node tests, type checking, and the production build, the speed-settings checkpoint is verified within the documented coverage. Commit/push authorization remains separate; nothing has been committed or pushed for this milestone.


## Version two, milestone 2: white serpent and moonlit garden

AI prepared a first visual pass following approval to begin. No commit or push is included.

- Canvas save/translate/rotate/restore draws the same facial design in all four directions. Movement direction is passed to the renderer, while game rules remain unchanged.
- Rounded paths connect ordered neighboring segments. Adjacency checks avoid bridging invalid gaps, and body order prevents merging nearby coils. The tail uses a rotated tapered shape and stops the thick connector at the shared cell boundary.
- Ivory body, golden eyes, purple markings/scale chevrons, and a small forked tongue simplify the requested Orochimaru-style serpent for 20-pixel cells. Orange fruit stays visually distinct.
- CSS gradients produce the moon, bamboo-like stems, and foliage. Decorative layers are behind the main panel and ignore pointer events. No raster image, external asset, extra dependency, or audio was added.
- The existing browser test checked a hard-coded green pixel. It now compares the expected head cell against its earlier empty appearance, preserving the queued-turn check without depending on a specific palette.
- `npm run check`, all 26 Node tests, `npm run build`, and `git diff --check` pass. The browser-suite attempt failed before test execution because the preview server could not bind 127.0.0.1:4173 (EPERM). No new browser success is claimed.

Visual review checklist: inspect all four facing directions, turns, tapered tail, and adjacent coils; verify food and grid readability; check overlays/buttons/speed settings and narrow layout. The initial serpent silhouette and garden style await user review before commit. Sounds and feedback effects are still deferred.


Visual browser follow-up: the user-provided run passed six of eight cases. Restart and pre-movement image equality failed. The new renderer left `lineCap`/`lineJoin` settings on the shared Canvas context, so later grid/food strokes differed from the first frame even with unchanged data. The renderer now saves the context before drawing and restores it in a finally block, including early returns. Original browser assertions are retained. A local rerun is required to verify the fix; no browser success is claimed yet.


Visual browser rerun: user-provided terminal output confirms all eight Chromium cases passed in 7.2 seconds after isolating Canvas context state. Together with 26 passing Node tests, type checking, and build, the automated checks pass. This does not replace review of the serpent silhouette, direction details, garden appearance, or dense-coil readability. No commit or push has been made for this visual milestone.


## Visual revision after reference review

The user requested more visible eyes/textures and the human-faced white-serpent form shown in supplied reference images, plus an Akatsuki/Uchiha-themed surround. Discussion selected an Akatsuki-style cloud background, larger/sharper board, reference-based sprite, and portrait. AI authored local SVG portrait/cloud assets and revised Canvas/CSS; no external art was downloaded.

- Canvas backing pixels are scaled by 1.5 times device pixel ratio (minimum 1.5), while transforms preserve the original 400-unit logical drawing space. CSS supports a 600-pixel desktop board without changing the 20 by 20 collision grid. A page reload recalculates density; live monitor-density changes are not separately observed.
- The moving head now emphasizes dark hair, a pale face, gold eyes, purple markings, and an open fanged mouth. The larger SVG portrait provides detail that cannot fit clearly in a single cell.
- The surround uses local cloud motifs and charcoal/red accents; the board remains visually restrained. Responsive layout keeps the portrait beside the panel on wide screens and above it on smaller screens.
- Canvas browser pixel sampling was updated to account for backing resolution. Existing context save/restore remains in place to prevent redraw differences.
- 26 Node tests, type checking, production build, and whitespace checks pass. Browser-suite execution and revised visual approval remain pending. Previous browser success predates this revision. No commit/push has been made.


Revised visual-pass browser result: user-provided terminal output confirms all eight Chromium tests passed in 7.6 seconds, including redraw/reset equality and resolution-adjusted pixel sampling. All automated checks pass within the suite's existing coverage. The revised artwork still awaits visual feedback and approval. No commit or push has been made.


Midnight backdrop refinement: using the supplied moon/cloud references, the surround now has a cool navy-purple sky, a large pale pink moon with a restrained crimson glow, and asymmetrically placed crimson clouds with light outlines and curled interior strokes. The earlier regular cloud tile is replaced by a flowing authored SVG composition. Visible character labels now say Orochimaru. All scenery remains static, behind the game, and ignores pointer events. Type checking/production build pass; revised appearance and local browser checks remain pending. No commit or push was made.


Final visual milestone result: after the midnight sky, moon, flowing-cloud, and character-label refinements, the user approved the appearance. User-provided local output confirms all eight Chromium tests passed in 7.6 seconds. Together with the existing 26 passing logic tests, type checking, and production build, this completes the visual checkpoint within documented coverage. No commit or push has been made for this milestone.
