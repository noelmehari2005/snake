# Snake design plan

Approved in discussion on October 27, 2026. Milestone 0 setup is implemented and its development preview is visually confirmed. Milestone 1 static grid and snake are implemented; type checking and build pass. Milestone 1 development appearance is confirmed by screenshot. Milestone 2 is committed. Milestone 3 is committed. Milestone 4 restart controls, state overlays, and interface polish are implemented. All 20 tests, type checking, and production build pass; final browser verification remains pending.

## Goal and stack

Build a browser-based Snake game for a portfolio, with an emphasis on understanding, maintainability, and explaining design decisions. Use TypeScript for logic, Canvas for drawing, and HTML/CSS for the interface. TypeScript compiles to browser JavaScript. Produce static files suitable for GitHub Pages.

Each mini-game has its own repository under `Portfolio/MiniGames`. Snake uses the existing repository at `Portfolio/MiniGames/snake`. The sibling `Portfolio/noelmehari2005.github.io` repository contains the portfolio website, which will present the games. Decide how the website links to or embeds published games when preparing deployment. Do not initialize a replacement repository. Choose minimal build tooling after discussing its purpose. No backend or application framework is required for this scope.

## Version one rules

- Board: 20 by 20 cells. Start with three segments near the center, facing right.
- Movement: one cell every 150 ms, with constant speed.
- Controls: arrows or WASD. Reject immediate reversal; accept at most one valid turn per tick.
- Food: one item on a randomly selected empty cell. Eating adds one segment and one point.
- Crossing a wall or entering the body ends the run.
- Entering the current tail cell is allowed when that tail leaves during the same tick.
- Filling the board wins the run; do not attempt to generate more food.
- Space or a button pauses/resumes. Automatically pause on window blur or hidden tab; resume requires an explicit action and a full tick interval before movement.
- Restart is available while paused or finished and returns to the start screen. Reset snake, score, direction, pending input, and timing.
- Ignore held-key repeats for start, pause, and restart.

Keyboard only for version one. No obstacles, levels, saved high scores, or increasing difficulty.

## Screen and states

Use a simple dark board, distinct head/body/food colors, a square Canvas that scales to the window, and HTML controls.

```text
SNAKE                         Score: 0
+------------------------------------+
|                                    |
|           ###           *          |
|                                    |
+------------------------------------+
Arrow keys / WASD to move
Space to pause                 [Pause]
```

| State | Behavior |
| --- | --- |
| Start | Initial board and instructions; Start or Enter begins |
| Playing | Timed movement, direction input, pause |
| Paused | Preserve board; Resume and Restart |
| Game over | Freeze board; final score, loss/win message, Restart |

Transitions: start -> playing; playing <-> paused; playing -> game over; restart from paused/game over -> start. A win is a finished outcome, rather than a separate active mode.

## Representation and update order

Separate game rules, Canvas rendering, and browser interaction/timing so rules can be tested without a browser.

Store the snake as a head-first array of integer `{x, y}` coordinates. Use named direction values and explicit game states. An array is sufficient for this small board; explain alternatives only when useful.

Each tick:

1. Apply the accepted direction.
2. Calculate the next head position.
3. Determine whether it reaches food.
4. Check walls and body, accounting for whether the tail moves.
5. Update snake and score.
6. Place food or declare a win.

Use requestAnimationFrame with elapsed time for fixed movement intervals. Rendering frequency and movement speed are separate. Allow at most one move per animation frame and retain only the fractional interval remainder, discarding backlog after stalls. Reset the timing clock on start, pause, and resume.

## Milestones and collaboration

Before each milestone, explain its concepts and work through a manageable reasoning or implementation task. Review the reasoning and implementation before advancing. Do not build all milestones at once.

| Milestone | Deliverable | Participation and verification |
| --- | --- | --- |
| 0: Plan/setup | Saved plan, minimal TypeScript setup, runnable page | Explain files and commands; build and open page without errors |
| 1: Static board | Grid and initial snake | Practice grid-to-pixel conversion; verify positions and sizing |
| 2: Movement/input | Timed movement, turning, start, pause | Reason through one tick; logic tests and keyboard checks |
| 3: Complete rules | Food, growth, scoring, collisions, win | Predict edge cases; implement and test rules together |
| 4: Finish | Restart, focus handling, polish, README | Playtest, full tests/build, browser checklist |

## Verification plan

Automated logic tests use controlled state and predictable randomness where needed. Add tests with the relevant milestone, not all in advance.

| Case | Expected result |
| --- | --- |
| Move without food | Head advances one cell; length stays constant |
| Valid turn | Direction changes at next tick |
| Reverse input | Ignored |
| Multiple turns in a tick | Only first valid turn applies |
| Eat food | Length and score each increase by one |
| Cross each of four edges | Run ends |
| Enter body | Run ends |
| Enter departing tail | Move succeeds |
| Generate food | In bounds and outside snake |
| One empty cell | Food placed in that cell |
| Fill board | Win; no food generation |
| Restart | Initial state restored, including pending input and timing |

Manual browser checks:

- Start, pause, resume, loss, win display, restart.
- Arrows/WASD work; game controls do not scroll the page during play.
- Focus loss pauses; returning does not automatically resume.
- Paused/finished snake does not move; resume waits one full interval.
- Layout remains readable and Canvas stays aligned at different sizes.

Record actual commands, checks, outcomes, and remaining limitations. Planned tests are not completed tests.

## Documentation and Git

Keep this plan, a README with run/build/test/play instructions, and a short learning/collaboration log. Record CS concepts, meaningful decisions and tradeoffs, human contributions, AI assistance, and verification. Avoid documentation that simply repeats the code.

Review diffs and use meaningful milestone commits. Never push without explicit authorization.

## Version two backlog — do not implement in version one

Requested October 27, 2026:

- Visually appealing background.
- Snake avatar/visual identity; agree on its appearance before implementation.
- Player-adjustable tick interval (movement speed).
- Sounds and visual effects.

Revisit visual references, asset choices, speed limits and change behavior, audio controls, and effects during version two planning. These additions should preserve understandable game rules and testability.


## Milestone 2 intermediate behavior

Milestone 2 temporarily paused at board edges. Milestone 3 replaces that guard with wall-loss behavior and adds self-collision checks. Milestone 4 replaces reload-based reset with Restart while paused or finished, returning to the ready screen. Automatic focus-loss pause was implemented with timing/input because it prevents background time accumulation.


## Version two agreed plan

1. Speed controls: Slow 220 ms, Normal 150 ms (default), Fast 100 ms. Allow live changes without pausing, also available while paused or at the ready/finished screens. Preserve settings across restart; reload restores defaults. Score is one point per food at all speeds.
2. Visual identity: a simplified Orochimaru-style white serpent with ivory connected segments, golden eyes, purple markings, forked tongue, and tapered tail. A muted moonlit garden surrounds a subtle board. Details rotate with movement and do not change occupied-cell collision rules. Review the first visual pass before finalizing.
3. Sounds/effects: short eating/loss/win cues, a visible sound toggle initially off, and subtle eating/finish feedback. No initial background music. Respect reduced motion; effects do not block controls. Sound preference survives restart and resets on refresh.
4. Re-run rule/browser tests, type checking, build, visual/audio review, and update documentation. Commits and pushes require separate approval.

### Speed timing trial and review gate

On a changed speed, reset accumulated movement progress and wait a full interval at the new speed, without changing phase, board, score, direction, or queued turn. Selecting the same speed leaves timing alone. The alternative is preserving fractional interval progress. This choice was raised again after implementation. The user tried it and approved live changes with the full-interval reset; that timing review is complete. Commit authorization remains separate.

Speed milestone implementation: UI and timing integration are prepared; 26 logic tests, type checking, and build pass. The user-provided local rerun confirms all eight Chromium browser tests passed in 6.8 seconds. Artwork/audio/effects have not been implemented.


### Version two visual milestone: first pass

Implemented the agreed white-serpent/garden direction with native Canvas and CSS rather than raster assets. Body connectors follow consecutive cells only, the tail tapers along its final segment, and facial features rotate with the movement direction. Decorative drawing stays within the union of occupied cells; grid collisions remain unchanged. The board uses subtle green tiles, with brighter orange fruit. The surrounding garden is static CSS artwork, leaving sounds and effects for the next milestone.

First-pass checks: type checking, 26 logic tests, and build pass. User-provided local output confirms all eight Chromium browser tests passed in 7.2 seconds after correcting Canvas drawing-state leakage. Visual style approval remains pending; review the appearance before approving a commit.


### Revised visual review direction

After reviewing the garden proposal, the user supplied references showing Orochimaru's pale human-like face, dark hair, open mouth, and white scaled body. Agreed to try a larger, sharper board (approximately 600 pixels on desktop), a simplified reference-based moving head, a larger portrait, and an Akatsuki-style black/red cloud background. This supersedes the garden theme. Keep collision cells and game rules unchanged. First-pass art and any rollback remain reviewable before commit. User-provided local output confirms all eight Chromium tests passed in 7.6 seconds for this revision. Appearance approval remains pending.


Midnight backdrop refinement: using the supplied moon/cloud references, the surround now has a cool navy-purple sky, a large pale pink moon with a restrained crimson glow, and asymmetrically placed crimson clouds with light outlines and curled interior strokes. The earlier regular cloud tile is replaced by a flowing authored SVG composition. Visible character labels now say Orochimaru. All scenery remains static, behind the game, and ignores pointer events. Type checking/production build pass; revised appearance and local browser checks remain pending. No commit or push was made.


Final visual review: the user approved the midnight moon/cloud direction and Orochimaru labels. A subsequent local Chromium rerun passed all eight browser cases in 7.6 seconds. Visual milestone implementation/review is complete; commit approval remains separate. Sounds/effects are still deferred.


## Version two sound/effects implementation

Implemented initially-off sound with a visible pressed-state toggle, session-only preference persistence, generated eating/loss/win cues, food particles, a short eating head pulse, and 450 ms finish glows. Audio context is created/resumed only after opt-in. Effects are separate presentation state derived from game transitions; game rules and movement timing are unchanged. Pause/focus loss/restart clear feedback; reduced motion disables animated effects. No music is included. The user must review actual sound and effects, and approve a separate commit after verification.
