# My Reading Journal

## Premise
You are the commander of a quiet starship whose only cargo is books. This app is the ship log. It tracks what you read, what you want to read, and what you really meant when you said a book was "pretty good". Tone: lighthearted sci fi, practical engineering.

## What It Does
- Track books with title, author, status, and cover art pulled from OpenLibrary or LibGen metadata.
- Search OpenLibrary and LibGen from the hero bar to seed entries quickly.
- Write reviews with 0-5 star ratings, local-first in IndexedDB.
- Work offline after first load. Optional LibGen proxy exists if you run the backend stack.
- Export plans are in motion so local data can travel later.

## Tech Loadout
- React 18 with Vite.
- Tailwind for styling, fonts from Google.
- IndexedDB for storage, wrapped in a small helper.
- Optional LibGen proxy: Express on port 4000 forwarding to the Python microservice on 5001.

## Quickstart
Frontend
```
cd src/frontend
npm install
npm run dev -- --host --port 5174
```
Open http://localhost:5174/book-review-tracker/

Backend (optional LibGen proxy)
```
cd src/backend
npm install
node server.js
```
Python LibGen microservice must also be running on port 5001 for the proxy to succeed.

## Project Map
```
book-review-tracker/
├─ src/
│  ├─ frontend/        React app, Tailwind styles, components, utils, data clients
│  ├─ backend/         Express proxy for LibGen
│  ├─ data/            Shared helpers for storage and APIs
│  ├─ python-service/  LibGen microservice (manual start)
│  └─ utils/           Legacy helpers now removed
├─ docs/               Plan and setup notes
└─ README.md           This file
```

## Design Notes
- Palette: cream, rose, sage, lavender, honey. Warm, soft, a little dreamy.
- Typography: Playfair Display for headings, Inter for body.
- Shapes: rounded corners, glassy cards, soft shadows.
- Motion: gentle fades and slides where useful.

## Usage Guide
- Add books manually or by search. Covers arrive from OpenLibrary when possible; LibGen metadata flows through when searched there.
- Status options: wishlist, reading, finished, on hold, did not finish.
- Reviews save inline to IndexedDB. No cloud sync until you wire it.

## Troubleshooting
- White screen while developing: ensure tailwind.config.js content globs point to frontend files only. Run npm run dev from src/frontend. Hard refresh.
- LibGen search fails: the Python service at 5001 must be running; otherwise use OpenLibrary search.
- Data missing after reload: IndexedDB may be blocked in private mode. Use a regular tab.

## Roadmap (near term)
- Harden IndexedDB with migrations and better error handling.
- Build import and export for JSON and CSV.
- Add reading stats and filters on the grid.
- Finish Discord webhook controls once the bot work catches up.

## License
MIT. Keep the ship tidy and share improvements.
