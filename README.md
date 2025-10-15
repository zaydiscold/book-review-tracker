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
- All sync, cloud storage, and external API integrations are no-ops for now.

## Update Log

- **v1.0.0** — Surfaced OpenLibrary availability data in search/library views, added quick read/borrow/download/waitlist actions, and stamped project metadata so collaborators can spot the maintainer and active versions at a glance.
- **UI polish** — Smoothed card highlight corners, refreshed the star-rating controls (striped half-stars, centered meters), restyled the Discord sharing panel, and staged future library tool buttons for upcoming features.

## Roadmap Notes

Phase 1 focuses on local persistence, streamlined review management (including add-on-save reviews, unread library tracking, and cover management), and quality-of-life tooling (OpenLibrary lookups, JSON export). 

**Testing & Polish**: Add comprehensive OpenLibrary search testing with various ISBNs, titles, and edge cases. Improve star rating UX with better visual feedback and predictable click zones.

Future phases will extend the spellchecker with `nspell` or `typo-js`, add background sync using the backend service, connect to reading APIs once OAuth requirements are defined, and explore Discord-first features such as emoji voting leaderboards and combined review summaries for shared books.
