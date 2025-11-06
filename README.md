# Book Review Tracker (Local-First)

> Maintainer tag: built by **zayd / cold** · Frontend `v1.0.0` · Backend `v1.0.0`

A lightweight proof of concept for tracking books and writing reviews without leaving your device. The frontend runs on React (Vite) and persists everything to IndexedDB; the backend is a thin Express stub ready for future sync features.

Made with love by ayd / cold.

## Project Structure

- `src/frontend/` — Vite + React UI with forms to add/edit reviews, OpenLibrary search + cover selection, and optional Discord webhook settings
- `src/backend/` — Express server exposing `/api/scan` placeholder and future endpoints
- `src/data/` — IndexedDB helpers, OpenLibrary search adapter, plus future cloud/API integration shims
- `src/utils/` — Utility helpers like the spellcheck placeholder, cover URL builder, export helpers, and Discord webhook sender
- `docs/plan.md` — High-level implementation plan and roadmap
- `discord-bot/` — Standalone Discord bot that posts book announcements and spins up review threads

## Getting Started

### One-command Dev Environment

Run `./scripts/start-dev.sh` from the repo root to boot the frontend Vite dev server and the backend Express stub together. Press `Ctrl+C` once to stop both; hit `Enter` to restart immediately (or press `Ctrl+C` again to exit the script).

### Manual Steps

1. **Frontend**
   ```bash
   cd src/frontend
   npm install
   npm run dev
   ```
   Visit the Vite dev server (defaults to http://localhost:5173) to use the local-first UI. Use the OpenLibrary search box to pull in book details (including cover art), edit reviews inline from the library list, and optionally paste a Discord webhook URL to cross-post reviews for your friends.

2. **Backend (optional for now)**
   ```bash
   cd src/backend
   npm install
   npm start
   ```
   This starts a stub Express API on http://localhost:4000 with the `/api/scan` placeholder route.

3. **Discord Bot (optional for now)**
   ```bash
   cd discord-bot
   npm install
   cp .env.example .env # fill in Discord credentials
   npm run register     # optional: quick command registration for a dev server
   npm start
   ```
   Use the `/pushbook` slash command in your Discord server to post a book announcement and automatically open a review thread. The bot currently runs independently from the web app while we prep deeper integrations.

### Optional: Enable Supabase-backed sync

The UI now mirrors every IndexedDB change to Supabase when credentials are present. To enable it:

1. [Create a Supabase project](https://supabase.com/) (the free tier is sufficient) and note the project URL and anon key.
2. Create two tables with Row Level Security enabled:
   - `books` (columns: `id` bigint primary key, `title` text, `titleLower` text, `author` text, `authorLower` text, `status` text, `cover` jsonb, `openLibraryUrl` text, `openLibraryIdentifiers` jsonb, `availability` jsonb, `createdAt` timestamptz, `updatedAt` timestamptz).
   - `reviews` (columns: `id` bigint primary key, `bookId` bigint with a foreign key to `books.id`, `rating` numeric, `text` text, `status` text, `unread` boolean, `createdAt` timestamptz, `updatedAt` timestamptz).
3. Grant insert/update/delete/select permissions to the `anon` role for both tables (or add policies that scope access per user if you later add auth).
4. Add the connection details to the frontend build:
   ```bash
   # src/frontend/.env.local
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="public-anon-key"
   ```
5. Restart `npm run dev`. The app will pull the latest snapshot on load (skipping sample data when remote rows exist) and push future edits to Supabase in the background.
6. Need the exact SQL for tables and policies? See [`docs/supabase-setup.md`](docs/supabase-setup.md) for a ready-to-run script and environment checklist.

If Supabase is unreachable, the UI falls back to local-only mode and surfaces a warning toast.

## Current Behavior

- Books include categories inspired by Goodreads/Bookwyrm (Wishlist, Library/Owned-Unread, Reading, Finished, Re-reading, On Hold, Did Not Finish), and library entries display an unread badge.
- Add a review while creating a book (enabled by default for read statuses) or skip it for wishlist/library items.
- Reviews are managed per-book; selecting an existing review loads it for editing, and you can delete or overwrite it in place. Ratings accept decimals (e.g., `9.5`).
- Covers are pulled from OpenLibrary when available (with manual overrides for custom URLs/IDs) and displayed throughout the UI.
- Quick-search OpenLibrary for book metadata and auto-fill the add-book form.
- OpenLibrary search results surface live availability (read online, borrow, download when offered, or join waitlists) before saving.
- Export the full library (books + reviews) as a local JSON snapshot.
- Reviews can opt into a basic spellcheck that only fixes a handful of common typos.
- When a Discord webhook is configured, new reviews post to the specified channel.
- Toggle Discord sharing between quick summary posts (title + rating for group reactions) and full review embeds without leaving the app.
- Ratings use a 5-star slider UI with timestamps so you can see exactly when each take was logged.
- Optional Supabase replication keeps IndexedDB changes mirrored in the cloud when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are provided.

## Update Log

- **v1.0.0** — Surfaced OpenLibrary availability data in search/library views, added quick read/borrow/download/waitlist actions, and stamped project metadata so collaborators can spot the maintainer and active versions at a glance.
- **UI polish** — Smoothed card highlight corners, refreshed the star-rating controls (striped half-stars, centered meters), restyled the Discord sharing panel, and staged future library tool buttons for upcoming features.

## Roadmap Notes

Phase 1 focuses on local persistence, streamlined review management (including add-on-save reviews, unread library tracking, and cover management), and quality-of-life tooling (OpenLibrary lookups, JSON export). 

**Testing & Polish**: Add comprehensive OpenLibrary search testing with various ISBNs, titles, and edge cases. Improve star rating UX with better visual feedback and predictable click zones.

Future phases will extend the spellchecker with `nspell` or `typo-js`, add background sync using the backend service, connect to reading APIs once OAuth requirements are defined, and explore Discord-first features such as emoji voting leaderboards and combined review summaries for shared books.
