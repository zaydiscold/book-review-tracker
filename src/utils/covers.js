// Placeholder: extend with caching, responsive sizes, and alt-text sourcing for accessibility polish.
const OPEN_LIBRARY_COVER_BASE = "https://covers.openlibrary.org";

export function getCoverUrl(cover, size = "M") {
  if (!cover || !cover.type || !cover.value) {
    return null;
  }

  if (cover.type === "url") {
    return cover.value;
  }

  const normalizedSize = size?.toUpperCase?.() ?? "M";
  const key = encodeURIComponent(cover.type.toLowerCase());
  const value = encodeURIComponent(cover.value);
  return `${OPEN_LIBRARY_COVER_BASE}/b/${key}/${value}-${normalizedSize}.jpg`;
}

export function hasCover(cover) {
  return Boolean(cover && cover.type && cover.value);
}
