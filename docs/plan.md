# Book Review Tracker - Technical Plan

- React UI captures books (title, author, status, cover) and reviews (rating, text, spellcheck toggle) with Goodreads/Bookwyrm-inspired status list (Wishlist, Library/Owned-Unread, Reading, Finished, Re-reading, On Hold, Did Not Finish).
- Add-book flow can collect an initial review (default on for read statuses), attach OpenLibrary cover metadata (with manual overrides), and flags library-owned titles as unread so they surface in the library section without a review.
- Selecting a book auto-loads its review for editing; reviews can be updated or deleted in place.
- IndexedDB (`src/data/db.js`) stores all entities. Reviews upsert by book so edits overwrite instead of duplicating and duplicates are cleaned up.
- Spellcheck shim corrects obvious word typos only; punctuation and casing are preserved when possible, and autocorrect stays enabled during edits by default.
- OpenLibrary search helper seeds book details (including cover metadata and source links) directly into the add-book form.
- Discord webhook support posts saved reviews to a shared channel when configured.
- JSON export creates a local snapshot of books and reviews for safekeeping.
- Express backend exposes `/health` and `/api/scan` placeholder routes. No database writes yet.

## Architecture Overview
```
[React UI]
  ├─ uses IndexedDB wrapper for persistence
  ├─ optional spellcheck step before saving review text
  ├─ optional Discord webhook post on save
  └─ future: enqueue sync jobs

[Express Stub]
  ├─ keeps API surface consistent for future clients
  └─ will mediate cloud sync + device bridging later
```

## Frontend Roadmap
- Enhance dashboard with filters (status, rating, spellcheck state) and bulk actions.
- Support multi-review per book (e.g., one per reader) with attribution once collaboration features land.
- Introduce context providers for sync status and user preferences.
- Package spellcheck into a worker during phase 2 for better responsiveness.
- Build Discord collaboration features: shared leaderboards, emoji reaction tallies, clear-vote resets.
- Add additional export formats (CSV/Markdown) and import flows for the JSON snapshots.
- Explore end-to-end borrowing UX: surface OpenLibrary availability, handle sign-in handoffs, and guide readers from preview to download/waitlist.
- Tighten Discord webhook controls (summary vs full posting, opt-in toggles) ahead of migrating to a managed bot.
- Graduate Discord integration to a managed bot that listens for reactions, edits embeds with live vote counts, and automates cleanup.

## Backend Roadmap
- Implement `/api/scan` to accept ISBN payloads and respond with book metadata.
- Add endpoints for pushing/pulling book/review snapshots.
- Harden with request validation, auth tokens, and rate limiting.
- Consider server-side Discord integrations for multi-user coordination.

## Data & Sync Considerations
- Define a CRDT or timestamp-based merge strategy for reconciling IndexedDB with cloud replicas.
- Encrypt user data before transmission once remote sync is introduced.
- Evaluate storage quotas and add cleanup tooling (e.g., archive or export flows).

## Tooling & Developer Experience
- Add linting/formatting (ESLint + Prettier) to frontend and backend packages.
- Write integration tests that mock IndexedDB (front) and exercise Express routes (back).
- Wire lightweight CI pipeline to run unit tests and bundle checks.
