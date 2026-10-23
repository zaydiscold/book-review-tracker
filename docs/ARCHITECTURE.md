# What this repo actually contains

Written after reading the source on 2026-10-23. Not what the README claims — what the code does.

## The headline finding

**There are two applications in this repository, and the deployed site is the smaller one.**

| | Live site | Repository |
|---|---|---|
| Bundle | `index-CsF9dacE.js`, 151 KB | `docs/assets/index-BIux4L5Y.js`, 373 KB (stale) |
| Open Library search | ✅ 11 refs | ✅ |
| libgen links | ✅ 1 ref | ✅ |
| IndexedDB (offline library) | ❌ **0 refs** | ✅ present |
| Supabase (cloud sync) | ❌ **0 refs** | ✅ 62 refs |
| Stats / modals / LibGenView | ❌ **0 refs** | ✅ present |

The deployed site is `App.jsx` — **83 lines**. Everything interesting in `src/data/` and
`src/frontend/components/` is either orphaned or belongs to a build that was never redeployed.

## Live site: what each piece does

`src/frontend/main.jsx` → `src/frontend/App.jsx` → `src/data/openLibrary.js`

- **Search** — `searchOpenLibrary(query, {limit})` hits Open Library, normalizes results, derives
  covers from ISBN/cover-id.
- **Ranking** — `rankResults()` puts exact title matches first, then sorts by year. Caps at 9.
- **Save** — writes `{title, author, query}` to `localStorage` under `readers-memoir-searches`.
  This is *not* a library — it stores a search string, nothing more.
- **Routes** — three hardcoded mirrors (`libgen.li`, `libgen.bz`, `libgen.vg`) with the query
  URL-encoded. Opens in a new tab. The site never touches the request.
- **`BookResult`** — a result card: cover, year, title, author, save button, and the three route links.

That's the entire live product. It works, it's honest, and it's small.

## Dead or orphaned code

Referenced by **nothing** — not reachable from `main.jsx`:

| File | Lines | What it would do |
|---|---|---|
| `components/LibGenView.jsx` | 249 | Full LibGen search UI |
| `components/StatsView.jsx` | 114 | Reading statistics |
| `components/AddBookModal.jsx` | 162 | Manual book entry |
| `components/SettingsModal.jsx` | 75 | Preferences |
| `data/db.js` | 618 | IndexedDB: books + reviews + migrations |
| `data/cloudSync.js` | 403 | Supabase sync queue |
| `data/supabaseClient.js` | 70 | Supabase init |
| `data/apiIntegrations.js` | 10 | **Stub** — both functions log and return `pending` |

Referenced only by each other, never by the app: `BookCard`, `BookGrid`, `HeroSection`,
`LibGenWidget`, `data/libgen.js` (352 lines of a real LibGen client).

**`data/libgen.js` is the most valuable orphan** — it already implements mirror selection, result
normalization, cover derivation, `checkDownloadAvailability(md5)`, `getLibGenMirrorUrl(md5)`,
`batchSearchBooks()`, and `calculateLibraryStats()`. It is a complete client that nothing calls.

## Configuration

- `src/frontend/.env.example` → `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. No real values.
- `docs/supabase.sql` — schema exists for books/reviews.
- `src/backend/server.js` (117 lines) + `services/libgenService.js` (211 lines) — an Express
  backend that nothing deploys. **This is relevant**: the repo already anticipated a server.

## Why the deployed build can't do more

GitHub Pages serves static files. It cannot:

- make authenticated calls to Goodreads or Amazon (CORS + cookies are origin-scoped)
- run `libgenService.js`
- hold secrets

So the live site can offer **links** to catalogs but can never **fetch** from them. That is an
architecture boundary, not a bug to fix.

## What to keep, what to cut, what to wire

**Keep and wire up:** `openLibrary.js` (works), `libgen.js` (complete, unused), `db.js`
(IndexedDB is the right store for a local-first library), `docs/supabase.sql` (already written).

**Cut or fold in:** `cloudSync.js` + `supabaseClient.js` unless cloud sync is actually wanted —
they add an auth surface for a feature nobody asked for yet. `StatsView`, `SettingsModal`,
`AddBookModal` are fine but should be wired or removed; dead code is a maintenance tax.

**Stubs to replace:** `apiIntegrations.js` — currently a lie that returns `pending` forever.

**Keep the honest footer.** "Catalog availability can vary by location" is correct and should stay.
