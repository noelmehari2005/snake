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
