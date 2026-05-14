# Repository Guidelines

## Project Structure & Module Organization

This is an Obsidian plugin for media note taking. Core source lives in `src/`: `main.tsx` is the plugin entry point, `app-context.tsx` holds shared React/plugin state, `viewPlugin.ts` integrates with Obsidian editor views, and `components/` contains UI such as `media-frame.tsx`. Bookmarklet logic lives in `src/bookmarklet.js`.

Tests are in `src/__tests__/`, with current coverage focused on bookmarklet behavior. Static plugin metadata is in `manifest.json` and `versions.json`; built and hosted bookmarklet assets are in `dist/`. Global styles are in `styles.css`, and README images are under `images/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: run the esbuild development build.
- `npm run build`: type-check with `tsc` and create a production bundle.
- `npm test`: run Jest tests in the `jsdom` environment.
- `npm run bookmarklet`: serialize `src/bookmarklet.js` into bookmarklet text.
- `npm run bookmarklet-page`: open `dist/index.html` for preview.
- `npm version <patch|minor|major>`: updates version files and stages them.

## Coding Style & Naming Conventions

Use TypeScript and React for plugin UI code, and keep Obsidian integration code close to `main.tsx` or `viewPlugin.ts`. Follow `.editorconfig`: UTF-8, LF endings, final newline, and tabs with width 4. File names use kebab case for components and utilities, for example `media-frame.tsx` and `convert-bookmarklet.ts`.

ESLint is configured with `@typescript-eslint` recommended rules. There is no npm lint script, so run ESLint directly when needed and use `npm run build` for type-checking.

## Testing Guidelines

Use Jest for tests and place new tests in `src/__tests__/`. Name test files after the behavior or module under test, using the existing `*.test.js` pattern. Prefer focused tests around timestamp parsing, URL handling, editor interactions, and settings behavior.

## Commit & Pull Request Guidelines

Recent commits use short, imperative, lowercase messages such as `add release workflow` and `change horizontal max-width to match file width`. Keep commits scoped and descriptive; version-only commits may use the version number, for example `1.3.0`.

Pull requests should include a concise description, user-visible changes, test/build results, and linked issues when applicable. Include screenshots or a short recording for UI changes. For bookmarklet changes, mention whether `dist/index.html` was updated and previewed.

## Agent-Specific Instructions

Do not edit release metadata unless the task requires a version bump. Avoid committing build artifacts unless the workflow or release process needs them. When changing bookmarklet behavior, update both the source bookmarklet and generated preview output when they should stay in sync.
