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
- TypeScript checking, Vite build, and visual browser verification remain pending until dependencies can be installed.
- No gameplay tests are claimed at this stage.

Browser checklist after installation:

1. Run `npm run check` and `npm run build` successfully.
2. Open the development page; confirm a dark board, one green square, and the successful status message.
3. Confirm no browser console errors.
4. Resize the window; the Canvas should remain square and fit the content width.
5. Run `npm run preview` and repeat the page check against the production build.
