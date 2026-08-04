# A Reader's Memoir

[Open the live site](https://zaydiscold.github.io/book-review-tracker/)

A cozy, local-first book discovery demo: look up a title, choose an edition, and open the same search through a visible primary catalog plus two backups.

## Related reading tools

- [Amazon Kindle CLI (MCP + API)](https://github.com/zaydiscold/amazon-kindle-cli-mcp-api) — Kindle-first buyer and library workflow.
- [Goodreads CLI (MCP + API)](https://github.com/zaydiscold/goodreads-cli-mcp-api) — shared CLI/MCP Goodreads workflow.

## What the live site does

- Looks up book metadata and covers through Open Library.
- Gives every result three visible external catalog-search routes: `libgen.li`, `libgen.bz`, and `libgen.vg`.
- Includes one-click demo searches for Dune, The Color Purple, Red Mars, and Beloved.
- Saves selected titles in this browser’s `localStorage`; open or remove them from **My library**.

The site does not host files, proxy catalog traffic, or resolve downloads. Catalog availability varies by location and destination.

## Run locally

```bash
cd src/frontend
npm ci
npm run dev
```

Open the local Vite URL shown in the terminal.

## Deploy GitHub Pages

```bash
cd src/frontend
npm run deploy
```

The Vite base path is `/book-review-tracker/`; deployment publishes `dist` to the `gh-pages` branch.

## Troubleshooting

- **No search results:** Open Library may be unavailable or rate-limited. Retry the lookup.
- **Missing cover:** Metadata is still usable; Open Library may not have a cover for that edition.
- **Saved titles disappear:** Browser private mode or cleared site data removes the local `readers-memoir-searches` shelf.
- **A catalog route fails:** Try the adjacent backup links. The site deliberately leaves each external destination visible.

## Legacy services

The repository retains earlier backend, Python, IndexedDB, and Supabase experiments. They are not part of the current GitHub Pages experience.

## License

MIT.
