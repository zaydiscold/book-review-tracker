import { useEffect, useState } from "react";

// The three endpoints marked verified in this repository's mirror config.
// This page only shows these catalog links; it does not proxy, scrape, or
// resolve files behind them.
const CATALOGS = [
  { name: "LibGen.li", url: "https://libgen.li", note: "Primary catalog" },
  { name: "LibGen.bz", url: "https://libgen.bz", note: "Backup catalog" },
  { name: "LibGen.vg", url: "https://libgen.vg", note: "Backup catalog" }
];
const SHELF_KEY = "free-book-index-catalogs";

function readShelf() {
  try { return JSON.parse(window.localStorage.getItem(SHELF_KEY) || "[]"); }
  catch { return []; }
}

export default function App() {
  const [saved, setSaved] = useState([]);
  const [view, setView] = useState("catalogs");
  const [error, setError] = useState("");
  useEffect(() => { setSaved(readShelf()); }, []);

  function saveCatalog(catalog) {
    try {
      const next = [...saved.filter((item) => item.url !== catalog.url), catalog];
      window.localStorage.setItem(SHELF_KEY, JSON.stringify(next));
      setSaved(next);
    } catch { setError("That catalog could not be saved to your local shelf."); }
  }

  function removeBookmark(url) {
    const next = saved.filter((item) => item.url !== url);
    window.localStorage.setItem(SHELF_KEY, JSON.stringify(next));
    setSaved(next);
  }

  return <main>
    <header><a className="brand" href="#top" onClick={() => setView("catalogs")}>Free Book Index</a><nav aria-label="Primary navigation"><button className={view === "catalogs" ? "active" : ""} onClick={() => setView("catalogs")}>Catalogs</button><button className={view === "shelf" ? "active" : ""} onClick={() => setView("shelf")}>Local shelf <span>{saved.length}</span></button></nav></header>
    {view === "catalogs" ? <><section className="hero" id="top"><p className="eyebrow">A local arts-library experiment</p><h1>The catalogs, plainly visible.</h1><p>No hidden media wall. No local server pretending to work online. Choose a catalog and open it directly; if one is blocked where you are, the next one is right beside it.</p><small>This static page is only a wrapper for the three repository-provided catalog links. It does not host files, search the catalogs, or send you through an intermediary.</small></section><section className="directory"><div className="heading"><div><p className="eyebrow">Three routes, no maze</p><h2>Open a catalog</h2></div><p>Primary + two backups</p></div>{error && <p className="notice">{error}</p>}<div className="catalogs">{CATALOGS.map((catalog, index) => <article key={catalog.url}><p className="number">0{index + 1}</p><div><p className="eyebrow">{catalog.note}</p><h3>{catalog.name}</h3><p>{catalog.url.replace("https://", "")}</p></div><div className="actions"><a href={catalog.url} target="_blank" rel="noreferrer">Open catalog ↗</a><button onClick={() => saveCatalog(catalog)}>Save</button></div></article>)}</div></section></> : <section className="shelf"><p className="eyebrow">Stored only in this browser</p><h1>Local shelf</h1>{saved.length === 0 ? <p className="notice">Save a catalog from the index and it will stay here as a local bookmark.</p> : <div className="saved">{saved.map((item) => <article key={item.url}><div><h2>{item.name}</h2><p>{item.url.replace("https://", "")}</p></div><div className="actions"><a href={item.url} target="_blank" rel="noreferrer">Open ↗</a><button onClick={() => removeBookmark(item.url)}>Remove</button></div></article>)}</div>}</section>}
    <footer>A static index of the configured catalog endpoints. Availability and access rules belong to each destination.</footer>
  </main>;
}
