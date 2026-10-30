# Snake

A browser-based Snake project exploring game loops, data structures, and collision detection.

## Version one

A 20 × 20 board, three-segment starting snake, food, growth, scoring, wall/self-collisions, and a full-board win. Normal uses a 150 ms movement interval. Version two adds live Slow (220 ms), Normal (150 ms), and Fast (100 ms) settings. Each food adds one segment and one point.

| Action | Control |
| --- | --- |
| Start | Start button or Enter |
| Turn | Arrow keys or WASD |
| Pause/resume | Space or Pause/Resume button |
| Restart | Restart button while paused or finished |

Restart returns to the ready screen; press Start to begin a fresh run. Switching tabs/windows pauses automatically and requires explicit resume. Focused buttons use normal Enter/Space activation. Immediate reversal is rejected, and only one valid turn is accepted per tick.

The ivory serpent has a golden-eyed head with purple markings, and orange fruit is food. Finished screens preserve the board and show the final score. The game requires a keyboard; the board adapts to narrow windows, but touch controls and a screen-reader equivalent for spatial gameplay are not implemented.

See [DESIGN.md](DESIGN.md) for decisions and scope, and [LEARNING.md](LEARNING.md) for concepts, collaboration, and verification. Version-two speed controls are implemented for review. The moonlit garden and stylized white-serpent avatar are implemented for first-pass visual review; sounds and effects remain deferred.

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
- `src/settings.ts`: speed presets and validation.
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

Eight Playwright tests exercise the actual page in Chromium: Start and food/score rendering, keyboard pause/resume, restart from pause, wall loss and restart, and narrow-window layout, plus speed intervals, live changes, and setting persistence. Every case also checks for browser runtime/console errors.

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

The first local Chromium run exposed a focus-transfer bug in the wall-loss test. After fixing focus capture before hiding Pause, the user-provided rerun confirms all five Chromium tests passed (5.5 seconds).


## Version two: speed settings

Choose Slow (220 ms), Normal (150 ms), or Fast (100 ms) using the always-available buttons. Choices can change during play without pausing; the selected button is marked visually and with `aria-pressed`. Arrow/WASD controls continue to work while a speed button is focused. Enter/Space activates a focused button normally; use Pause/Resume or move focus away from the speed buttons to use Space as a pause shortcut.

A changed speed discards the partial movement interval and waits one full interval at the new speed, measured from the change. The full-interval reset was tried and approved in review. Selecting the same speed does not reset timing. Board, score, direction, and queued input are preserved. Paused games stay paused; restarting preserves the selected speed. Reloading restores Normal. Score remains one point per food at every speed.

Current verification: all 26 Node tests, type checking, and production build pass. User-provided local terminal output confirms all eight Chromium browser tests passed in 6.8 seconds, including speed thresholds, live changes, paused changes, restart persistence, and refresh defaults.


## Version two: visual pass 

The renderer draws a simplified Orochimaru-style white serpent with golden eyes, purple markings and scale details, a small forked tongue, and a tapered tail. Only adjacent entries in the ordered snake array are connected, so nearby parallel body sections do not merge. The head rotates using the actual movement direction. Presentation does not change grid positions or collision rules.

The garden uses CSS moonlight, bamboo-like stems, and foliage silhouettes around a subdued green board. All artwork is drawn in Canvas/CSS; no external images, fonts, or character assets are downloaded. Orange fruit remains distinct in both shape and color. Decorative page layers cannot intercept input. No audio or animation effects are added in this milestone.

Verification: 26 logic tests, type checking, and production build pass. After fixing Canvas state leakage between redraws, user-provided local output confirms all eight Chromium tests passed in 7.2 seconds for this visual pass. Review all four head directions, straight and bent body sections, tail taper, dense coils, food visibility, overlays, and 320-pixel layout. Appearance is a first pass pending user feedback, not an exact reproduction of an anime frame.


### Revised visual direction: reference-based serpent and red clouds

The earlier garden pass is superseded by an Akatsuki-style charcoal/red cloud surround and a dark-haired, human-faced white serpent inspired by the supplied reference images. A local SVG portrait makes facial details visible outside the moving sprite; on smaller windows it moves above the header. The portrait/cloud artwork is authored vector art, not a downloaded anime frame.

The desktop board now displays at approximately 600 pixels, retaining 20 by 20 logical cells. Its Canvas backing resolution is scaled for desktop enlargement and device pixel density; drawing and collision coordinates remain unchanged. Browser tests sample logical positions through the backing-pixel scale. No gameplay, speed, or audio changes are included.

Revised-pass verification: 26 Node tests, type checking, build, and whitespace checks pass. User-provided local output confirms all eight Chromium tests passed in 7.6 seconds for the revised artwork. Visual approval remains pending.


The latest background refinement uses a midnight navy-purple sky, a pale moon with crimson glow, and flowing red clouds with light curled outlines based on the supplied visual references. The visible character name is Orochimaru. These are authored CSS/SVG decorations, with gameplay unchanged. Build/type checks pass. The user approved the final appearance and supplied a local Chromium rerun with all eight browser tests passing in 7.6 seconds.


## Version two: sounds and effects 

Sound starts off. Use **Sound: off/on** to opt in or mute at any time. The preference survives restart and resets on refresh. Audio is generated locally with Web Audio: a short rising eating cue, lower loss cue, and three-note win cue. No music, external sound files, or extra dependencies are added. If audio is unavailable or blocked, sound stays off and the game remains playable.

Eating produces a small particle burst and a very brief head pulse; finishing gives the board a soft border glow. Feedback does not change the rules or delay input. Effects are separate HTML layers, leaving the Canvas test comparisons focused on the actual board. Pause, focus loss, and restart stop active sounds and clear effects. Finish feedback ends after 450 ms. Reduced-motion preferences suppress these animated effects; score/outcome text still provides feedback.

Tests cover transition-to-feedback selection, audio opt-in/mute and failure handling, browser effect cleanup/reduced motion, and sound state across restart/refresh. Browser audio scheduling uses a simulated device and does not verify actual audibility or volume. Listen locally for all three cues; win scheduling is tested with a deterministic logic fixture rather than a manual full-board run. Review volume and visual intensity before committing.

Current milestone checks and pending browser execution are recorded in LEARNING.md. Run `npm test`, `npm run check`, `npm run build`, and `npm run test:browser`.


Sound/effects automated result: all 11 Chromium browser tests passed locally in 12.7 seconds (user-provided output), alongside 29 Node tests, type checking, and build. Listening and visual approval remain pending; the simulated-audio test does not verify speaker output.
