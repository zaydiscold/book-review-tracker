# Book Review Tracker (Local-First)

**System Operator**: zayd/cold | **Frontend Build**: v1.0.0 | **Backend Build**: v1.0.0

This is a local-first book tracking system. Data persists to IndexedDB. Nothing leaves your machine unless you explicitly configure cloud replication or Discord webhooks. The frontend is React via Vite. The backend is a minimal Express stub awaiting orders.

No network dependency for core operations. Exactly as intended.

## System Architecture

```
src/frontend/    React interface. Book entry, review editor, OpenLibrary search, Discord bridge.
src/backend/     Express server. Currently contains one placeholder endpoint. Standing by.
src/data/        IndexedDB persistence layer. OpenLibrary adapter. Cloud sync shims.
src/utils/       Support modules: spellcheck stub, cover URL construction, JSON export, Discord webhook.
docs/plan.md     Mission objectives and implementation roadmap.
discord-bot/     Independent Discord agent. Posts book announcements, spawns review threads.
```

## Initialization Sequence

### Automated Startup

Execute `./scripts/start-dev.sh` from repository root. This spawns both frontend and backend processes. Single `Ctrl+C` terminates both. Press `Enter` to restart. Double `Ctrl+C` if you want to escape entirely.

### Manual Initialization

**Frontend Module** (Required)
```bash
cd src/frontend
npm install
npm run dev
```
Server deploys to http://localhost:5173. IndexedDB operations commence immediately. OpenLibrary search available. Discord webhook integration optional.

**Backend Module** (Currently Vestigial)
```bash
cd src/backend
npm install
npm start
```
Express server listening on http://localhost:4000. Contains `/api/scan` placeholder endpoint. Waiting for purpose.

**Discord Bot** (Independent Agent)
```bash
cd discord-bot
npm install
cp .env.example .env    # Configure Discord authentication tokens
npm run register        # Deploy slash commands to dev server
npm start
```
Bot accepts `/pushbook` command to post book announcements and spawn review threads. Operates independently from web interface. Integration protocols under development.

### Cloud Replication Protocol (Supabase)

IndexedDB changes replicate to Supabase when credentials are configured. System operates without it, but you'll need cloud storage if you want data persistence across machines or catastrophic local storage failure.

**Configuration Steps**:

1. Deploy a Supabase instance at https://supabase.com (free tier adequate). Record project URL and anonymous key.

2. Execute table schema with Row Level Security:
   - `books`: id (bigint PK), title, titleLower, author, authorLower, status (text), cover (jsonb), openLibraryUrl (text), openLibraryIdentifiers (jsonb), availability (jsonb), createdAt/updatedAt (timestamptz)
   - `reviews`: id (bigint PK), bookId (bigint FK → books.id), rating (numeric), text, status (text), unread (boolean), createdAt/updatedAt (timestamptz)

3. Grant `anon` role full CRUD permissions on both tables. Implement user-scoped policies later if authentication becomes mission-critical.

4. Configure frontend environment:
   ```bash
   # src/frontend/.env.local
   VITE_SUPABASE_URL="https://your-project-id.supabase.co"
   VITE_SUPABASE_ANON_KEY="public-anon-key"
   ```

5. Restart development server. Application pulls remote snapshot on initialization (suppresses sample data if remote records exist). All subsequent mutations push to Supabase asynchronously.

6. Complete SQL schema and policy definitions: [`docs/supabase-setup.md`](docs/supabase-setup.md)

Network failure triggers automatic fallback to local-only mode. Warning toast displays. System remains operational.

## System Capabilities

**Book Classification**
- Status taxonomy: Wishlist, Library/Owned-Unread, Reading, Finished, Re-reading, On Hold, Did Not Finish (derived from Goodreads/Bookwyrm schemas).
- Unread badge rendering for library entries.

**Review Operations**
- Inline review creation during book entry (auto-enabled for read statuses, suppressed for wishlist/library classifications).
- Per-book review management. Single review per book. Load, edit, delete, or overwrite in-place.
- Decimal rating precision (accepts `9.5` and similar float values).
- 5-star slider interface with timestamp logging. You'll know when you had that opinion.

**Cover Management**
- OpenLibrary cover retrieval with manual override capability for custom URLs/IDs.
- Rendered across all interface views.

**OpenLibrary Integration**
- Metadata quick-search with form auto-population.
- Live availability data in search results: read online, borrow, download, waitlist options.
- Availability status preserved pre-save.

**Data Portability**
- JSON export of complete dataset (books + reviews). Local snapshot for backup or migration.

**Text Processing**
- Optional spellcheck module. Currently corrects approximately five common typos. Inadequate for serious work. Planned expansion pending.

**Discord Bridge**
- Webhook configuration for automated review posting to specified channel.
- Toggle between summary mode (title + rating for quick reactions) and full review embeds.
- No need to leave interface.

**Cloud Synchronization**
- Supabase replication when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` environment variables detected.
- Mirrors IndexedDB mutations to remote PostgreSQL instance.

## Change Log

**v1.0.0**
- OpenLibrary availability data integration (search/library views).
- Quick action buttons: read, borrow, download, waitlist.
- Project metadata stamping for version tracking and maintainer identification.

**UI Iteration**
- Card highlight corner radius corrections.
- Star rating control refresh: striped half-star rendering, centered alignment.
- Discord sharing panel restyling.
- Library tool button staging (awaiting feature implementation).

## Mission Objectives

**Phase 1** (Current): Local persistence architecture. Review management optimization. Cover handling. OpenLibrary integration. JSON export capability. Status: Operational.

**Testing Protocols**: Comprehensive OpenLibrary search validation required. Test matrix: ISBNs, title variants, edge cases. Star rating UX improvements: visual feedback enhancement, click zone predictability.

**Phase 2** (Planned): Spellcheck expansion via `nspell` or `typo-js`. Background sync implementation using backend service. Reading API integration (blocked pending OAuth requirement definition). Discord feature expansion: emoji voting leaderboards, aggregated review summaries for shared titles.

**Phase 3** (Speculative): Additional integration points TBD. Depends on Phase 2 completion and system stability assessment.
