# Frontend Notes (Current)

This frontend now uses Tailwind for styling and a small set of cozy components. Old CSS-in-JS references (`styles/appStyles.js`, `variables.css`, `App-old-monolithic.jsx`) were removed; the active structure is:

```
src/frontend/
├── components/      # Layout, hero, book grid/cards, LibGen widget, ratings, toasts
├── constants/       # Theme constants, book status helpers, default form values
├── utils/           # Formatting, ratings, book matching/covers
├── index.css        # Tailwind layers + small component helpers
├── tailwind.config.js
├── main.jsx         # Entry point
└── App.jsx          # App shell (search, library grid, toasts)
```

Key points:
- Tailwind is configured via `tailwind.config.js` with content globs scoped to `components`, `utils`, `constants`, `App.jsx`, and `main.jsx`.
- Styling lives in `index.css` using Tailwind utilities; no external `styles/` folder is used.
- Cover utilities live in `src/frontend/utils/covers.js` and are used by cards and matching helpers.
- Run from `src/frontend`: `npm run dev -- --host --port 5174` or `npm run build`.

Deprecated references in older docs (appStyles, variables.css, monolithic App) can be ignored. Use the paths above as the source of truth.
