// Placeholder: expand with caching and richer metadata (covers, subjects) as collaboration features grow.
const OPEN_LIBRARY_URL = "https://openlibrary.org/search.json";
const OPEN_LIBRARY_FIELDS = [
  "key",
  "title",
  "subtitle",
  "author_name",
  "first_publish_year",
  "publish_year",
  "cover_i",
  "isbn",
  "lccn",
  "oclc",
  "edition_key",
  "availability"
].join(",");

export async function searchOpenLibrary(query, { limit = 5 } = {}) {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    fields: OPEN_LIBRARY_FIELDS
  });

  const response = await fetch(`${OPEN_LIBRARY_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`OpenLibrary responded with status ${response.status}`);
  }

  const payload = await response.json();
  const docs = Array.isArray(payload?.docs) ? payload.docs : [];

  return docs.slice(0, limit).map((doc, index) => ({
    key: doc.key ?? `${doc.title ?? "result"}-${index}`,
    title: doc.title ?? doc.subtitle ?? "Untitled",
    author: Array.isArray(doc.author_name)
      ? doc.author_name.filter(Boolean).join(", ")
      : doc.author_name ?? "",
    year: doc.first_publish_year ?? doc.publish_year?.[0] ?? null,
    isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : doc.isbn ?? null,
    cover: deriveCover(doc),
    availability: normalizeAvailability(doc),
    openLibraryUrl: doc.key ? `https://openlibrary.org${doc.key}` : null,
    identifiers: buildIdentifiers(doc)
  }));
}

function normalizeAvailability(doc) {
  const availability = doc?.availability;
  if (!availability || typeof availability !== "object") {
    return {
      status: "unknown",
      isReadAvailable: false,
      isBorrowAvailable: false,
      previewUrl: null,
      borrowUrl: null,
      openLibraryWorkUrl: doc?.key ? `https://openlibrary.org${doc.key}` : null,
      openLibraryEditionUrl: null,
      hasDownload: false
    };
  }

  const status = availability.status ?? "unknown";
  const openLibraryWorkUrl = availability.openlibrary_work
    ? `https://openlibrary.org${availability.openlibrary_work}`
    : doc?.key
      ? `https://openlibrary.org${doc.key}`
      : null;
  const openLibraryEditionUrl = availability.openlibrary_edition
    ? `https://openlibrary.org${availability.openlibrary_edition}`
    : null;

  const previewUrl = availability.preview_url ?? openLibraryEditionUrl ?? openLibraryWorkUrl;
  const borrowUrl = availability.borrow_url ?? openLibraryEditionUrl ?? openLibraryWorkUrl;
  const hasDownload = status === "open" && Boolean(previewUrl);

  return {
    status,
    isReadAvailable: status === "open",
    isBorrowAvailable: status === "borrow_available",
    previewUrl,
    borrowUrl,
    openLibraryWorkUrl,
    openLibraryEditionUrl,
    hasDownload,
    identifier: availability.identifier ?? null,
    identifierType: availability.identifier_type ?? null
  };
}

function deriveCover(doc) {
  if (!doc) {
    return null;
  }

  if (doc.cover_i) {
    return { type: "id", value: String(doc.cover_i) };
  }

  if (Array.isArray(doc.isbn) && doc.isbn.length > 0) {
    return { type: "isbn", value: doc.isbn[0] };
  }

  if (Array.isArray(doc.lccn) && doc.lccn.length > 0) {
    return { type: "lccn", value: doc.lccn[0] };
  }

  if (Array.isArray(doc.oclc) && doc.oclc.length > 0) {
    return { type: "oclc", value: doc.oclc[0] };
  }

  if (Array.isArray(doc.edition_key) && doc.edition_key.length > 0) {
    return { type: "olid", value: doc.edition_key[0] };
  }

  return null;
}

function buildIdentifiers(doc) {
  if (!doc) {
    return null;
  }

  const identifiers = {
    id: doc.cover_i ? String(doc.cover_i) : null,
    isbn: Array.isArray(doc.isbn) ? doc.isbn.filter(Boolean).map(String) : [],
    olid: Array.isArray(doc.edition_key) ? doc.edition_key.filter(Boolean).map(String) : [],
    lccn: Array.isArray(doc.lccn) ? doc.lccn.filter(Boolean).map(String) : [],
    oclc: Array.isArray(doc.oclc) ? doc.oclc.filter(Boolean).map(String) : []
  };

  return identifiers;
}
