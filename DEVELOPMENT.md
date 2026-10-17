## Development

Use `npm ci` to install dependencies, `npm test` to run tests, and `npm run build` to type-check and build the plugin. The tracked `main.js` is included for this fork's BRAT workflow.

## Bookmarklet

Edit `src/bookmarklet.js`, then run `npm run bookmarklet`. The Node-based generator updates the copyable root `bookmarklet.js`, the README code block, and the draggable link in `dist/index.html`.

Run `npm run bookmarklet:check` to confirm those outputs are in sync. Bookmarklet tests are in `src/__tests__/bookmarket.test.js`.

Run `npm run bookmarklet-page` to open the local preview page. This fork does not control the original project's Netlify site.

## Web Clipper

`YT-notes-webclipper.json` is the template distributed with the fork. Its content, properties, path, and URL triggers match upstream PR #50; only the display name is changed to YouTube Notes.

## Releasing

Run `npm version <patch|minor|major> --no-git-tag-version` to update version metadata, then run bookmarklet checks, tests, and the production build before committing. Tag the release with the exact manifest version. Release assets are `main.js`, `manifest.json`, and `styles.css`; the bookmarklet and Web Clipper template can also be attached for convenient download.
