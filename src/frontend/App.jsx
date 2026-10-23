import { useEffect, useState } from "react";
import { searchOpenLibrary } from "../data/openLibrary";
import { SOURCE_GROUPS, STATUS_LABEL, VERIFIED_ON } from "../data/sources";

const SHELF_KEY = "readers-memoir-searches";
const DEMO_QUERIES = ["Dune", "The Color Purple", "Red Mars", "Beloved"];

function coverUrl(book) {
  return book?.cover?.value ? `https://covers.openlibrary.org/b/${book.cover.type === "id" ? "id" : "ISBN"}/${book.cover.value}-L.jpg` : null;
}

function rankResults(results, query) {
  const normalizedQuery = query.toLocaleLowerCase();
  return [...results]
    .sort((left, right) => {
      const leftExact = left.title?.toLocaleLowerCase() === normalizedQuery;
      const rightExact = right.title?.toLocaleLowerCase() === normalizedQuery;
      if (leftExact !== rightExact) return leftExact ? -1 : 1;
      return (left.year ?? Number.MAX_SAFE_INTEGER) - (right.year ?? Number.MAX_SAFE_INTEGER);
    })
    .slice(0, 9);
}

/** One expandable group of sources. Shows status honestly — including the dead ones. */
function SourceGroup({ group, query, open, onToggle }) {
  const live = group.sources.filter((s) => s.status === "works").length;
  return <section className={`source-group ${open ? "open" : ""}`}>
    <button className="source-group-head" onClick={onToggle} aria-expanded={open}>
      <span className="source-group-label">{group.label}</span>
      <span className="source-group-count">{live} usable / {group.sources.length}</span>
      <span className="source-group-chevron">{open ? "−" : "+"}</span>
    </button>
    {open && <div className="source-group-body">
      <p className="source-blurb">{group.blurb}</p>
      <ul className="source-list">
        {group.sources.map((source) => <li key={source.name} className={`source status-${source.status}`}>
          <a href={source.url(query)} target="_blank" rel="noreferrer">
            <span className="source-name">{source.name}</span>
            <span className="source-status">{STATUS_LABEL[source.status]}</span>
          </a>
          <p className="source-note">{source.note}</p>
        </li>)}
      </ul>
    </div>}
  </section>;
}

/** The full source landscape for one book. */
export function SourcesPanel({ query }) {
  const [open, setOpen] = useState(["catalog"]);
  const toggle = (id) => setOpen((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  return <div className="sources-panel">
    <p className="sources-meta">Routes for <strong>{query || "this book"}</strong><span className="sources-verified">verified {VERIFIED_ON}</span></p>
    {SOURCE_GROUPS.map((group) => <SourceGroup key={group.id} group={group} query={query} open={open.includes(group.id)} onToggle={() => toggle(group.id)} />)}
    <p className="sources-disclaimer">Status reflects one machine on one day. Availability varies by region and changes often — a route marked dead here may work for you. Nothing is proxied: every link opens in your own browser.</p>
  </div>;
}

export default function App() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [saved, setSaved] = useState([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [view, setView] = useState("home");

  useEffect(() => {
    try { setSaved(JSON.parse(window.localStorage.getItem(SHELF_KEY) || "[]")); }
    catch { setSaved([]); }
  }, []);

  async function runSearch(rawQuery) {
    const term = rawQuery.trim();
    if (!term) return;
    setQuery(term);
    setSearching(true); setError("");
    try { setResults(rankResults(await searchOpenLibrary(term, { limit: 30 }), term)); }
    catch { setError("The book lookup is unavailable right now. You can still use the catalog links below."); }
    finally { setSearching(false); }
  }

  function search(event) {
    event.preventDefault();
    runSearch(query);
  }

  function saveSearch(book) {
    const next = [{ title: book.title, author: book.author, query: `${book.title} ${book.author || ""}`.trim() }, ...saved.filter((item) => item.title !== book.title)];
    window.localStorage.setItem(SHELF_KEY, JSON.stringify(next));
    setSaved(next);
  }

  function removeSearch(title) {
    const next = saved.filter((item) => item.title !== title);
    window.localStorage.setItem(SHELF_KEY, JSON.stringify(next));
    setSaved(next);
  }

  return <main className="memoir">
    <aside className="toolbar" aria-label="Related reading tools"><span>Reader tools</span><a href="https://github.com/zaydiscold/amazon-kindle-cli-mcp-api" target="_blank" rel="noreferrer">Amazon Kindle CLI ↗</a><a href="https://github.com/zaydiscold/goodreads-cli-mcp-api" target="_blank" rel="noreferrer">Goodreads CLI ↗</a></aside>
    <header className="navbar"><button className="wordmark" onClick={() => setView("home")}>A Reader’s Memoir</button><nav><button className={view === "home" ? "selected" : ""} onClick={() => setView("home")}>Discover</button><button className={view === "sources" ? "selected" : ""} onClick={() => setView("sources")}>Sources</button><button className={view === "shelf" ? "selected" : ""} onClick={() => setView("shelf")}>My library <span>{saved.length}</span></button></nav></header>
    {view === "home" ? <>
      <section className="hero"><div className="orb rose" /><div className="orb lavender" /><div className="hero-copy"><p className="eyebrow">Your next chapter starts here</p><h1>Choose a book.<br /><em>Choose a path.</em></h1><p>Look up a title, then open it through the primary catalog or either backup. The choices stay visible, right where you need them.</p><form onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, author, or ISBN…" aria-label="Search books" /><button disabled={searching}>{searching ? "Searching…" : "Search the archive"}</button></form><div className="quick-searches"><span>Demo lineup</span>{DEMO_QUERIES.map((title) => <button key={title} onClick={() => runSearch(title)}>{title}</button>)}</div></div></section>
      <section className="search-area"><div className="section-title"><div><p className="eyebrow">Search results</p><h2>{searching ? "Searching the shelves…" : results.length ? "Choose your edition" : "Choose a book"}</h2></div><p>Visible links, no hidden redirect</p></div>{error && <p className="alert">{error}</p>}{results.length > 0 && <div className="results-grid">{results.map((book) => <BookResult key={book.key} book={book} onSave={saveSearch} />)}</div>}{!searching && !results.length && !error && <div className="empty-state">Choose a demo title above or search anything you want; every result gets three visible catalog routes.</div>}</section>
    </> : view === "sources" ? <section className="sources-page"><p className="eyebrow">The whole landscape</p><h1>Where books actually live</h1><p className="sources-intro">Every catalog this site knows about, with its real status rather than a hopeful link. Verified {VERIFIED_ON}. Search a title above, or open any result to see sources scoped to that book.</p><SourcesPanel query={query} /></section> : <section className="library"><p className="eyebrow">Kept in this browser</p><h1>Your reading paths</h1>{saved.length === 0 ? <div className="empty-state">Save a result to keep its catalog links close at hand.</div> : <div className="saved-list">{saved.map((book) => <article key={book.title}><div><h2>{book.title}</h2><p>{book.author || "Catalog search"}</p></div><div className="saved-actions"><button onClick={() => { setQuery(book.query); setView("sources"); }}>Show sources</button><button onClick={() => removeSearch(book.title)}>Remove</button></div></article>)}</div>}</section>}
    <footer>Catalog availability can vary by location. The search links are deliberately shown together so a blocked route is never a dead end.</footer>
  </main>;
}

function BookResult({ book, onSave }) {
  const image = coverUrl(book);
  const catalogQuery = `${book.title} ${book.author || ""}`.trim();
  const [showSources, setShowSources] = useState(false);
  return <article className="result-card"><div className="cover">{image ? <img src={image} alt={`Cover of ${book.title}`} /> : <span>Reader’s<br />Memoir</span>}</div><div className="result-info"><p className="year">{book.year || "Edition date unknown"}</p><h3>{book.title}</h3><p>{book.author || "Unknown author"}</p><button className="save" aria-label={`Save ${book.title}${book.author ? ` by ${book.author}` : ""} to my library`} onClick={() => onSave(book)}>Save to my library</button><button className="toggle-sources" onClick={() => setShowSources((v) => !v)}>{showSources ? "Hide sources" : "Show sources"}</button></div><div className="routes"><p className="eyebrow">Open this search in</p><a href={`https://libgen.li/index.php?req=${encodeURIComponent(catalogQuery)}`} target="_blank" rel="noreferrer"><span>LibGen.li</span><small>Primary ↗</small></a><a href={`https://openlibrary.org/search?q=${encodeURIComponent(catalogQuery)}`} target="_blank" rel="noreferrer"><span>Open Library</span><small>Editions ↗</small></a><a href={`https://librivox.org/search?q=${encodeURIComponent(catalogQuery)}`} target="_blank" rel="noreferrer"><span>LibriVox</span><small>Audio ↗</small></a>{showSources && <SourcesPanel query={catalogQuery} />}</div></article>;
}
