import { useEffect, useState } from "react";
import { searchOpenLibrary } from "../data/openLibrary";

const MIRRORS = [
  { name: "LibGen.li", url: "https://libgen.li/index.php?req=", label: "Primary" },
  { name: "LibGen.bz", url: "https://libgen.bz/index.php?req=", label: "Backup 01" },
  { name: "LibGen.vg", url: "https://libgen.vg/index.php?req=", label: "Backup 02" }
];
const SHELF_KEY = "readers-memoir-searches";

function coverUrl(book) {
  return book?.cover?.value ? `https://covers.openlibrary.org/b/${book.cover.type === "id" ? "id" : "ISBN"}/${book.cover.value}-L.jpg` : null;
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

  async function search(event) {
    event?.preventDefault();
    const term = query.trim();
    if (!term) return;
    setSearching(true); setError("");
    try { setResults(await searchOpenLibrary(term, { limit: 9 })); }
    catch { setError("The book lookup is unavailable right now. You can still use the catalog links below."); }
    finally { setSearching(false); }
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
    <header className="navbar"><button className="wordmark" onClick={() => setView("home")}>A Reader’s Memoir</button><nav><button className={view === "home" ? "selected" : ""} onClick={() => setView("home")}>Discover</button><button className={view === "shelf" ? "selected" : ""} onClick={() => setView("shelf")}>My library <span>{saved.length}</span></button></nav></header>
    {view === "home" ? <>
      <section className="hero"><div className="orb rose" /><div className="orb lavender" /><div className="hero-copy"><p className="eyebrow">Your next chapter starts here</p><h1>Find a book.<br /><em>Choose a path.</em></h1><p>Look up a title, then open it through the primary catalog or either backup. The choices stay visible, right where you need them.</p><form onSubmit={search}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by title, author, or ISBN…" aria-label="Search books" /><button disabled={searching}>{searching ? "Searching…" : "Search the archive"}</button></form><div className="quick-searches"><span>Try</span><button onClick={() => { setQuery("Frankenstein"); }}>Frankenstein</button><button onClick={() => { setQuery("Dune"); }}>Dune</button><button onClick={() => { setQuery("Beloved"); }}>Beloved</button></div></div></section>
      <section className="search-area"><div className="section-title"><div><p className="eyebrow">Search results</p><h2>{searching ? "Searching the shelves…" : results.length ? "Choose your edition" : "Search for a book"}</h2></div><p>Visible links, no hidden redirect</p></div>{error && <p className="alert">{error}</p>}{results.length > 0 && <div className="results-grid">{results.map((book) => <BookResult key={book.key} book={book} onSave={saveSearch} />)}</div>}{!searching && !results.length && !error && <div className="empty-state">Search a title and you’ll get a clean card with all three catalog routes.</div>}</section>
    </> : <section className="library"><p className="eyebrow">Kept in this browser</p><h1>Your reading paths</h1>{saved.length === 0 ? <div className="empty-state">Save a result to keep its catalog links close at hand.</div> : <div className="saved-list">{saved.map((book) => <article key={book.title}><div><h2>{book.title}</h2><p>{book.author || "Catalog search"}</p></div><div className="saved-actions"><a href={`${MIRRORS[0].url}${encodeURIComponent(book.query)}`} target="_blank" rel="noreferrer">Open primary ↗</a><button onClick={() => removeSearch(book.title)}>Remove</button></div></article>)}</div>}</section>}
    <footer>Catalog availability can vary by location. The search links are deliberately shown together so a blocked route is never a dead end.</footer>
  </main>;
}

function BookResult({ book, onSave }) {
  const image = coverUrl(book);
  const catalogQuery = `${book.title} ${book.author || ""}`.trim();
  return <article className="result-card"><div className="cover">{image ? <img src={image} alt={`Cover of ${book.title}`} /> : <span>Reader’s<br />Memoir</span>}</div><div className="result-info"><p className="year">{book.year || "Edition date unknown"}</p><h3>{book.title}</h3><p>{book.author || "Unknown author"}</p><button className="save" onClick={() => onSave(book)}>Save to my library</button></div><div className="routes"><p className="eyebrow">Open this search in</p>{MIRRORS.map((mirror) => <a key={mirror.name} href={`${mirror.url}${encodeURIComponent(catalogQuery)}`} target="_blank" rel="noreferrer"><span>{mirror.name}</span><small>{mirror.label} ↗</small></a>)}</div></article>;
}
