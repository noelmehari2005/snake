# Learning and collaboration notes

## Milestone 0: setup foundation

The design was developed through discussion, including the learning workflow, test cases, repository structure, and deferred version-two features. AI prepared the setup files at the user's request. Human review and understanding remain part of each milestone.

Concepts demonstrated:

- HTML creates the Canvas; TypeScript obtains its 2D drawing context.
- A DOM query may return the wrong element type or null. An `instanceof` check narrows its type before Canvas methods are used.
- Grid coordinates and pixel coordinates are separate; cell size connects them.
- Type checking and converting source into browser JavaScript are separate tasks.

Verification status:

- Repository inspected; existing README, license, and ignore rules preserved or extended through documented edits.
- Dependency installation attempted but failed because the npm registry hostname could not be resolved in this environment.
- Dependencies were installed from the local terminal, generating package-lock.json.
- Initial type checking exposed a collision between the top-level `status` variable and the browser global. Renamed it `statusElement` and set `moduleDetection: "force"` so TypeScript treats source files as modules, matching the HTML module script.
- `npm run check` and `npm run build` pass after the fix. The development preview was subsequently confirmed in a user-provided screenshot.
- The initial audit identified vulnerable Vite 8.0.14. Updated explicitly to Vite 8.3.5, preserving exact version pinning rather than applying a forced bulk fix.
- User-provided terminal output confirms the update succeeded, `npm audit` reported zero vulnerabilities, `npm run check` and `npm run build` passed, and the Vite 8.3.5 development server started. These results were observed in the local terminal and shared in the discussion.
- Dependency re-optimization after changing the lockfile is expected; it refreshes the development dependency cache.
- The user-provided screenshot confirms the development page displays the title, dark square board, green square at the expected relative position, and successful status text.
- Browser console, resizing, and production-preview checks have not been confirmed.
- No gameplay tests are claimed at this stage.

Browser checklist after installation:

1. Run `npm run check` and `npm run build` successfully.
2. Open the development page; confirm a dark board, one green square, and the successful status message.
3. Confirm no browser console errors.
4. Resize the window; the Canvas should remain square and fit the content width.
5. Run `npm run preview` and repeat the page check against the production build.

## Milestone 1: static board and snake

AI implemented the approved static-board milestone at the user's request. The next review should connect the visible segments to their coordinate data before advancing to movement.

Decisions and concepts:

- `board.ts` defines a `Cell` type and a head-first array: (10, 10), (9, 10), (8, 10). With the head on the right, the initial snake faces right.
- `render.ts` accepts coordinates rather than owning snake state. Changing the array changes the scene without changing the drawing algorithm.
- `readonly` prevents accidental array mutation through the renderer's parameter. It is a TypeScript check, not a runtime freeze.
- Each logical cell is 20 pixels. The board is 400 by 400 internal pixels; CSS scales its display while preserving its proportions.
- Internal grid lines use a half-pixel offset for crisp one-pixel strokes at the native Canvas size. A small inset leaves segment boundaries visible. The head also has a lighter color.
- Canvas uses border-box sizing so its border fits inside the available content width on narrow screens.
- No game loop, input, food, or collision behavior has been added.

Verification performed:

- `npm run check`: passed.
- `npm run build`: passed using Vite 8.3.5.
- `git diff --check`: passed.
- Browser attempt could not connect to a running server. Starting Vite in the agent environment failed with `listen EPERM` on 127.0.0.1:5173. Direct browser access remained unavailable. A subsequent user-provided screenshot confirms the development preview shows the square 20 by 20 grid, three aligned segments near the center, and a lighter rightmost head. Console, resize, stationary-over-time, and production-preview checks remain unconfirmed.

Local browser checklist:

1. Run `npm run dev` in the local terminal and open its URL.
2. Confirm a 20 by 20 grid with three adjacent segments near the center; the rightmost segment should be lighter.
3. Confirm the snake remains stationary and the browser console contains no errors.
4. Resize to a narrow window; the board should remain square without horizontal overflow.
5. Run `npm run preview` and confirm the production build displays the same scene.

Review exercise: the head is at (10, 10). Multiplying by the 20-pixel cell size locates the cell at (200, 200); the 2-pixel drawing inset places the visible square at (202, 202). How would changing only the head's x coordinate to 11 affect the scene?


## Milestone 2: movement, input, and timing

AI implemented this milestone following authorization to proceed. No commit or push is included in that authorization; review remains a separate checkpoint.

Concepts and decisions:

- One movement step creates a new head and keeps all previous segments except the tail. The previous state remains unchanged, making tests and reasoning simpler.
- A direction union limits valid direction values. A vector lookup maps each direction to a one-cell displacement.
- Keyboard events request a turn; the timed step applies it. Reverse and same-direction requests do not consume the one valid turn allowed per tick. Repeated held keys are ignored.
- Pure game and timing functions are separate from DOM events and Canvas, allowing Node's built-in test runner to verify them without browser automation or new dependencies.
- The animation loop uses elapsed time, with a 150 ms movement interval independent of display frame rate. At most one move occurs per frame, and only fractional time is retained after a stalled frame.
- Starting/resuming creates a fresh clock, so movement waits at least a full interval. Pausing clears pending input. Focus loss pauses and clears timing; returning does not resume.
- Native button Enter/Space activation is preserved without also running the global toggle handler.
- A temporary edge guard pauses before leaving the board. Wall-loss and self-collision rules remain milestone 3 work. Reload is the temporary reset action.

Verification:

- `npm run check`: passed.
- `npm test`: all 9 tests passed (inactive states, movement/body shift, four directions, reversal, turn queue, pause, four edges, resume delay, stall backlog).
- `npm run build`: passed.
- Browser interaction is not verified by automated logic tests. Local manual checks remain pending.

Manual checklist:

1. Start with Enter or the button; verify the snake waits briefly then moves right.
2. Try arrows and WASD (including uppercase letters), opposite-direction input, and rapid successive turns.
3. Pause/resume with Space and the button. Confirm the snake stays still while paused and waits a full interval after resume.
4. Verify keyboard activation of the focused button toggles once and game keys do not scroll during play.
5. Switch tabs/windows: confirm it pauses and stays paused on return.
6. Reach each edge: confirm the temporary pause keeps the snake visible. Resume and turn to move away; reload resets.
7. Check the console, narrow-window layout, and production preview.

Review exercise: after moving right from [(10,10), (9,10), (8,10)], the new array is [(11,10), (10,10), (9,10)]. Why does adding a head without removing the tail produce growth instead?


## Milestone 3: food, growth, score, and finished outcomes

Milestone 2 was committed with approval before beginning this work. AI implemented the authorized milestone 3; its commit remains subject to review.

Decisions and concepts:

- Food placement enumerates empty cells and selects one uniformly using a random value in [0, 1). This takes O(board area + snake length) time and O(board area) space, which is small for 400 cells. Random retry placement could keep guessing on a nearly full board.
- Randomness is passed into pure functions, allowing deterministic tests without modifying global Math.random.
- Eating keeps the old tail and adds a head, growing by exactly one. Score increases only on eating.
- Wall/body checks happen before changing the board. A failed move preserves the final valid snake and score.
- A normal move excludes the departing tail from collision checks. Growth includes the tail because it stays in place.
- An empty-cell scan that finds no remaining cell returns null without sampling randomness. Eating the final cell produces a win and stops movement.
- Finished games ignore movement, turning, pause, and resume. The interface shows the outcome and final score; reload is the temporary reset until milestone 4.
- The old four-direction movement test used a body extending left while directing the head left. Self-collision correctly made that fixture invalid. The displacement test now uses a one-segment snake to isolate directional movement; separate tests verify body collisions. Existing tests now use deterministic initial food.

Verification:

- `npm run check`: passed after specifying the button query type for access inside rendering functions.
- `npm test`: 17 tests cover movement/timing plus growth, stable non-eating score/food, all four walls, body collisions, departing tail, food bounds/occupancy, one empty cell, full board, winning, and inactive finished states.
- `npm test`: all 17 tests passed.
- `npm run build`: passed with Vite 8.3.5.
- `git diff --check`: passed.
- Browser playthrough, console, resizing, and production-preview checks remain pending.

Manual checks for review:

1. Start and steer to orange food: score and length should each increase by one, and new food should be outside the snake.
2. Hit a wall: the final valid board should freeze and display the wall outcome and final score.
3. Reload, grow, and turn into the body: confirm a self-collision loss.
4. Confirm pause/resume and focus-loss behavior still work; finished runs should not resume.
5. Reload to reset. Restart controls and finished-screen polish are milestone 4.

Review exercise: why must food detection happen before deciding whether to exclude the tail from collision checks?
