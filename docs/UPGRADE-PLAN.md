# Upgrade plan — Architecture A (static + self-service resources)

Decision: ship **A**. The site stays static and honest; users get their own pipeline from this repo.
No hosted downloads, no stored credentials, nothing to subpoena.

## Why A

The thing that makes this site worth visiting is not that it downloads files. It's that it tells
you **exactly where to look**, in the open, and gives you the means to do the rest yourself.
A static site can do that perfectly. A hosted one would take on other people's credentials and
other people's downloads — that's a liability business, not a feature.

## What gets built

### 1. A real library, not a saved search string

Today `localStorage` stores `{title, author, query}` and calls it "My library". It stores no book.

Wire the existing `src/data/db.js` (IndexedDB, already written, 618 lines) so the shelf holds actual
book records: title, author, year, cover, ISBN/OLID, edition, status (`want` / `reading` / `read`),
rating, notes. This is the foundation everything else sits on, and the code already exists.

### 2. Sources panel on every book

Replace the three hardcoded mirror links with a **sources panel** driven by one config file:

```
Catalog   → libgen.li, z-library.bz, libgen.bz, libgen.vg
Audio     → LibriVox (public domain), Internet Archive, Loyal Books
Legit     → Open Library borrow, Project Gutenberg, Hoopla/Libby note
Identify  → Open Library, Goodreads, Google Books
```

Each entry carries a **status badge** (`works`, `search only`, `blocked`, `seizure notice`) and a
"last verified" date. The badges are the honest part — mirror status changes constantly, and a site
that admits which routes are down is more useful than one that pretends.

This turns the site from "three links" into "here is the entire landscape, dated."

### 3. Self-service pipeline page

A page that hands the user the actual tooling, not a promise:

- Link to `book-mesh-playbook` with a copy-paste agent brief
- The exact commands: pull lists → diff → search → download → send
- Requirements stated plainly (you need your own Goodreads cookie; Amazon cookies for Kindle)
- What it cannot do: Audible (separate SSO), bulk Kindle verification (18-receipt cap)

The point is that a curious user can reproduce everything without asking anyone.

### 4. Clipboard + ISBN import

Paste a Goodreads or Amazon list, or a column of ISBNs. Parse to book records. No auth, no API key,
no session — this is how most people will actually get their data in, and it works today.

### 5. Photo-to-list (later, own milestone)

Bookstore stack photo → titles → add to library. Needs a vision model. Deliberately deferred:
it's the demo that sells the product, but it's also the only piece that needs compute, and the
foundation should exist first.

## What is explicitly NOT built

| Not building | Why |
|---|---|
| Hosted download button | Liability; makes the site a target |
| Amazon/Goodreads credential storage | Never. Their cookies, their machine |
| Server-side scraping proxy | Same problem, worse blast radius |
| "Auto-sync" claimed in the README | It doesn't exist. Don't say it does |

## Order of work

1. `ARCHITECTURE.md` — audit (done)
2. Sources config + panel, replacing hardcoded mirrors
3. Wire `db.js` for a real library
4. Self-service pipeline page
5. Clipboard/ISBN import
6. Photo-to-list
7. Fix the stale `docs/assets` build and the README drift

Steps 2 and 3 are the ones that matter. Everything after is refinement.
