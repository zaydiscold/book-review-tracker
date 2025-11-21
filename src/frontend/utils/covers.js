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

/**
 * Auto-populate cover if missing
 * (Placeholder for future logic if needed)
 */
export function autoPopulateCoverIfNeeded(book) {
    return book;
}
