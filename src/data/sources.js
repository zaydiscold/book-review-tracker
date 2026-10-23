/**
 * Every catalogue, audio, and identification source — with honest status.
 *
 * Status vocabulary:
 *   "works"        verified reachable and usable for its stated purpose
 *   "search-only"  metadata search works, but the download/book page does not
 *   "blocked"      resolves, but refuses this network (IP reputation / WAF)
 *   "dead"         host does not resolve, TCP-times out, or serves a seizure notice
 *   "unverified"   linked but not tested from this machine
 *
 * `verified` is the date of the last real test. Mirror status changes weekly — treat
 * anything older than a month as a claim, not a fact. Re-test before trusting.
 */

export const VERIFIED_ON = "2026-10-23";

export const SOURCE_GROUPS = [
  {
    id: "catalog",
    label: "Find the ebook",
    blurb: "Catalogs. Availability varies by region — that is why more than one is listed.",
    sources: [
      {
        name: "LibGen.li",
        url: (q) => `https://libgen.li/index.php?req=${encodeURIComponent(q)}`,
        status: "works",
        note: "The one that actually downloads. ~42 KB/s per connection, 50 files / 300s per IP.",
      },
      {
        name: "Z-Library",
        url: (q) => `https://z-library.bz/s/?q=${encodeURIComponent(q)}`,
        status: "search-only",
        note: "Search returns results in a real browser; book pages redirect and are IP-blocked.",
      },
      {
        name: "LibGen.bz",
        url: (q) => `https://libgen.bz/index.php?req=${encodeURIComponent(q)}`,
        status: "unverified",
        note: "Linked as a backup route. Not tested from this machine.",
      },
      {
        name: "LibGen.vg",
        url: (q) => `https://libgen.vg/index.php?req=${encodeURIComponent(q)}`,
        status: "unverified",
        note: "Linked as a backup route. Not tested from this machine.",
      },
      {
        name: "LibGen.is / .rs / .st",
        url: (q) => `https://libgen.is/index.php?req=${encodeURIComponent(q)}`,
        status: "dead",
        note: "DNS resolves but TCP times out — network-level block.",
      },
      {
        name: "library.lol",
        url: (q) => `https://library.lol/main/${encodeURIComponent(q)}`,
        status: "dead",
        note: "Serves a domain seizure notice, not a block.",
      },
      {
        name: "Anna's Archive",
        url: (q) => `https://annas-archive.org/search?q=${encodeURIComponent(q)}`,
        status: "dead",
        note: "Domain does not resolve (NXDOMAIN).",
      },
    ],
  },
  {
    id: "audio",
    label: "Find the audiobook",
    blurb: "Free and legal audio. LibriVox has public domain only — no modern titles.",
    sources: [
      {
        name: "LibriVox",
        url: (q) => `https://librivox.org/search?q=${encodeURIComponent(q)}&search_form=advanced`,
        status: "works",
        note: "Public domain. JSON API returns direct MP3s. Verified: 4 MB file downloaded and played.",
      },
      {
        name: "Internet Archive",
        url: (q) => `https://archive.org/search?query=${encodeURIComponent(q)}`,
        status: "works",
        note: "Hosts LibriVox audio; whole-book ZIPs available.",
      },
      {
        name: "Loyal Books",
        url: (q) => `https://loyalbooks.com/search?q=${encodeURIComponent(q)}`,
        status: "works",
        note: "Reachable. Public domain audio.",
      },
      {
        name: "Hoopla / Libby",
        url: () => `https://www.hoopladigital.com/`,
        status: "works",
        note: "The legal route for in-copyright audiobooks — needs a library card.",
      },
    ],
  },
  {
    id: "identify",
    label: "Identify the edition",
    blurb: "Get the right edition before you go looking for a file.",
    sources: [
      {
        name: "Open Library",
        url: (q) => `https://openlibrary.org/search?q=${encodeURIComponent(q)}`,
        status: "works",
        note: "Powers this site's search. Title, author, cover, editions, borrowable copies.",
      },
      {
        name: "Goodreads",
        url: (q) => `https://www.goodreads.com/search?q=${encodeURIComponent(q)}`,
        status: "works",
        note: "In a browser. First-party API is closed and the site redirect-loops server-side.",
      },
      {
        name: "Google Books",
        url: (q) => `https://www.google.com/search?tbm=bks&q=${encodeURIComponent(q)}`,
        status: "works",
        note: "Best for identifying an edition from a cover photo or an ISBN.",
      },
      {
        name: "Project Gutenberg",
        url: (q) => `https://www.gutenberg.org/ebooks/search/?query=${encodeURIComponent(q)}`,
        status: "works",
        note: "Public domain ebooks, free and direct. Better than a mirror when the title is old.",
      },
    ],
  },
];

/** Flatten to a lookup when you only need the working routes. */
export function workingSources(groupId) {
  const groups = groupId ? SOURCE_GROUPS.filter((g) => g.id === groupId) : SOURCE_GROUPS;
  return groups.flatMap((g) => g.sources.filter((s) => s.status === "works"));
}

export const STATUS_LABEL = {
  works: "works",
  "search-only": "search only",
  blocked: "blocked",
  dead: "dead",
  unverified: "untested",
};
