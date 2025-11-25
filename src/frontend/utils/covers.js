/**
 * Utility functions for handling book covers
 */

/**
 * Generate a cover URL for a book
 * @param {Object} cover - Cover object { type, value }
 * @param {string} size - Size code ('S', 'M', 'L')
 * @returns {string|null} Cover URL
 */
export function getCoverUrl(cover, size = 'M') {
    if (!cover || !cover.value) {
        return null;
    }

    // Handle direct URLs
    if (cover.type === 'url') {
        return cover.value;
    }

    // Handle OpenLibrary covers
    // Types: 'isbn', 'olid', 'id', 'lccn', 'oclc'
    if (['isbn', 'olid', 'id', 'lccn', 'oclc'].includes(cover.type)) {
        const key = cover.type === 'id' ? 'id' : cover.type.toUpperCase();
        return `https://covers.openlibrary.org/b/${key}/${cover.value}-${size}.jpg`;
    }

    return null;
}

/**
 * Check if a book has a valid cover
 * @param {Object} cover - Cover object
 * @returns {boolean}
 */
export function hasCover(cover) {
    return !!(cover && cover.value);
}

export function buildCoverFromIdentifiers(identifiers) {
    if (!identifiers || typeof identifiers !== "object") {
        return null;
    }

    const pick = (arr) => Array.isArray(arr) && arr.length > 0 ? arr[0] : null;

    const isbn = pick(identifiers.isbn);
    if (isbn) return { type: "isbn", value: String(isbn) };

    const olid = pick(identifiers.olid);
    if (olid) return { type: "olid", value: String(olid) };

    const lccn = pick(identifiers.lccn);
    if (lccn) return { type: "lccn", value: String(lccn) };

    const oclc = pick(identifiers.oclc);
    if (oclc) return { type: "oclc", value: String(oclc) };

    if (identifiers.id) return { type: "id", value: String(identifiers.id) };

    return null;
}

export function ensureCover(book) {
    if (!book) return null;
    if (hasCover(book.cover)) {
        return book.cover;
    }

    const identifiers = book.openLibraryIdentifiers || book.identifiers;
    const derived = buildCoverFromIdentifiers(identifiers);
    if (derived) {
        return derived;
    }

    return null;
}

/**
 * Auto-populate cover if missing
 * (Placeholder for future logic if needed)
 */
export function autoPopulateCoverIfNeeded(book) {
    return book;
}
