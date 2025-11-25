# Reading Journal
A local-first tracker for your library, wishlist, notes, and quick searches against OpenLibrary or LibGen.

## Highlights
- Add books with title, author, status, and covers pulled from OpenLibrary or LibGen metadata.
- Search LibGen and OpenLibrary from the landing page, then drop results straight into your library or wishlist.
- Works offline after first load with IndexedDB storage; optional backend proxy for LibGen.
- Reading stats view is available; more reporting is planned.

## Stack
- React 18 + Vite with Tailwind.
- IndexedDB for persistence (client only).
- Optional LibGen proxy: Express on port 4000 forwarding to a Python microservice on 5001.

## Supabase sync (optional)
- Drop `docs/supabase.sql` into the Supabase SQL editor to create tables, indexes, triggers, and policies.
- Add env vars in `src/frontend/.env`:
  ```
  VITE_SUPABASE_URL=...
  VITE_SUPABASE_ANON_KEY=...
  ```
- The app will auto-sync when those env vars are set (see `src/data/supabaseClient.js` and `src/data/cloudSync.js`).

## Getting Started
Frontend
```
cd src/frontend
npm install
npm run dev -- --host --port 5174
```
Open http://localhost:5174/book-review-tracker/

Frontend build
```
cd src/frontend
npm run build
```

Optional backend (LibGen proxy)
```
cd src/backend
npm install
node server.js
```
Ensure the Python LibGen service is running on port 5001 before using the proxy.

## Project Map
```
book-review-tracker/
├─ src/
│  ├─ frontend/        React app, Tailwind styles, components, data clients
│  ├─ backend/         Express proxy for LibGen
│  ├─ data/            Shared helpers for storage and APIs
│  ├─ python-service/  LibGen microservice (manual start)
│  └─ utils/           Legacy helpers now removed
├─ docs/               Plan and setup notes
└─ README.md
```

## Usage Notes
- Add books manually or from search results; LibGen metadata flows through when searched there.
- Status options include wishlist, reading, finished, on hold, and did not finish.
- Data stays in the browser unless you wire up the proxy and cloud sync.

## Troubleshooting
- White screen during development: run `npm run dev` from `src/frontend` and confirm Tailwind content globs target frontend files.
- LibGen search fails: start the Python service on 5001 and the Express proxy on 4000, or rely on OpenLibrary search only.
- Missing data after reload: some browsers block IndexedDB in private mode; switch to a regular tab.

## License
MIT.
