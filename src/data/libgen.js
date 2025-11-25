// Library Genesis API integration
// Uses backend proxy to interact with libgen API
const API_BASE_URL = "http://127.0.0.1:4000";

/**
 * Get the fastest available libgen mirror
 * @returns {Promise<string>} The fastest mirror URL
 */
export async function getMirror() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/libgen/mirror`);
    if (!response.ok) {
      throw new Error(`Failed to fetch mirror: ${response.status}`);
    }
    const data = await response.json();
    return data.mirror;
  } catch (error) {
    console.warn("Error fetching libgen mirror, using fallback:", error);
    return "http://libgen.is";
  }
}

/**
 * Search Library Genesis for books
 * @param {string} query - Search query (can be title, author, ISBN, etc.)
 * @param {Object} options - Search options
 * @param {number} options.count - Number of results to return (default: 10)
 * @param {string} options.sort_by - Field to sort by (title, publisher, year, pages, language, filesize, extension, def)
 * @param {boolean} options.reverse - Reverse sort order
 * @returns {Promise<Array>} Array of book results with libgen metadata
 */
export async function searchLibgen(query, { count = 10, sort_by = "def", reverse = false } = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/libgen/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        count,
        sort_by,
        reverse
      })
    });

    if (!response.ok) {
      throw new Error(`Libgen search failed: ${response.status}`);
    }

    const data = await response.json();
    return normalizeLibgenResults(data.results);
  } catch (error) {
    console.error("Error searching libgen:", error);
    throw error;
  }
}

/**
 * Get the latest text uploaded to Library Genesis
 * @returns {Promise<Object>} Latest book metadata
 */
export async function getLatestUpload() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/libgen/latest`);
    if (!response.ok) {
      throw new Error(`Failed to fetch latest upload: ${response.status}`);
    }
    const data = await response.json();
    return normalizeLibgenResult(data.latest);
  } catch (error) {
    console.error("Error fetching latest upload:", error);
    throw error;
  }
}

/**
 * Normalize a single libgen result to match our book schema
 * @param {Object} result - Raw libgen result
 * @param {number} index - Index in search results
 * @param {Array} allResults - All search results for this book
 * @returns {Object} Normalized book object
 */
function normalizeLibgenResult(result, index = 0, allResults = []) {
  if (!result) return null;

  const cover = deriveLibgenCover(result);
  const coverUrl = buildCoverUrl(cover);

  return {
    key: `libgen-${result.id || result.md5}`,
    title: result.title || "Untitled",
    author: result.author || "",
    year: result.year ? parseInt(result.year, 10) : null,
    isbn: result.identifier || result.isbn || null,
    publisher: result.publisher || null,
    pages: result.pages || null,
    language: result.language || null,
    filesize: result.filesize || null,
    extension: result.extension || null,
    md5: result.md5,
    cover,
    coverUrl,
    libgenMetadata: {
      id: result.id,
      md5: result.md5,
      downloadUrl: result.downloadUrl,
      extension: result.extension,
      filesize: result.filesize,
      size: result.size, // Add size field
      language: result.language,
      pages: result.pages,
      publisher: result.publisher,
      currentIndex: index,
      totalResults: allResults.length,
      allResults: allResults.map(r => ({
        id: r.id,
        md5: r.md5,
        title: r.title,
        author: r.author,
        year: r.year,
        extension: r.extension,
        filesize: r.filesize,
        size: r.size, // Add size field here too
        pages: r.pages,
        language: r.language,
        publisher: r.publisher,
        downloadUrl: r.downloadUrl
      }))
    },
    source: "libgen"
  };
}

/**
 * Normalize libgen search results to match our book schema
 * @param {Array} results - Raw libgen results
 * @returns {Array} Normalized book objects
 */
function normalizeLibgenResults(results) {
  if (!Array.isArray(results)) return [];
  return results.map((result, index) => normalizeLibgenResult(result, index, results)).filter(Boolean);
}

/**
 * Derive cover information from libgen result
 * Uses ISBN if available, otherwise returns null
 * @param {Object} result - Libgen result
 * @returns {Object|null} Cover object {type, value}
 */
function deriveLibgenCover(result) {
  if (!result) return null;

  // Try to extract ISBN from identifier field
  const isbn = result.identifier || result.isbn;
  if (isbn) {
    // Clean ISBN (remove hyphens, spaces)
    const cleanIsbn = isbn.replace(/[-\s]/g, "");
    if (cleanIsbn.length === 10 || cleanIsbn.length === 13) {
      return { type: "isbn", value: cleanIsbn };
    }
  }

  return null;
}

function buildCoverUrl(cover, size = "L") {
  if (!cover || !cover.value) return null;

  if (cover.type === "url") {
    return cover.value;
  }

  const type = cover.type.toLowerCase();
  if (["isbn", "olid", "id", "lccn", "oclc"].includes(type)) {
    const key = type === "id" ? "id" : type.toUpperCase();
    return `https://covers.openlibrary.org/b/${key}/${cover.value}-${size}.jpg`;
  }

  return null;
}

/**
 * Check if a direct download is available for a book
 * @param {string} md5 - MD5 hash of the book
 * @returns {Promise<Object>} Download availability info
 */
export async function checkDownloadAvailability(md5) {
  // This would require additional libgen.js functionality
  // For now, we'll return the standard mirrors
  return {
    available: true,
    mirrors: [
      `http://libgen.is/book/index.php?md5=${md5.toLowerCase()}`,
      `http://gen.lib.rus.ec/book/index.php?md5=${md5.toLowerCase()}`
    ]
  };
}

/**
 * Search both title and author to find best matches
 * @param {string} title - Book title
 * @param {string} author - Book author
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of matching books
 */
export async function searchByTitleAndAuthor(title, author, options = {}) {
  const query = author ? `${title} ${author}` : title;
  return searchLibgen(query, { count: 5, ...options });
}

/**
 * Get the primary LibGen mirror URL for a book
 * @param {string} md5 - MD5 hash of the book
 * @returns {string} Mirror URL
 */
export function getLibGenMirrorUrl(md5) {
  // Using .li as it is currently more reliable than .is
  return `http://libgen.li/ads.php?md5=${md5}`;
}

/**
 * Switch to the next available LibGen result for a book
 * @param {Object} book - Book object with libgenMetadata
 * @returns {Object|null} Updated libgenMetadata or null if no next result
 */
export function getNextLibGenResult(book) {
  if (!book?.libgenMetadata?.allResults) return null;

  const { currentIndex, allResults } = book.libgenMetadata;
  const nextIndex = currentIndex + 1;

  if (nextIndex >= allResults.length) {
    return null; // No more results
  }

  const nextResult = allResults[nextIndex];

  return {
    ...book.libgenMetadata,
    id: nextResult.id,
    md5: nextResult.md5,
    downloadUrl: nextResult.downloadUrl,
    extension: nextResult.extension,
    filesize: nextResult.filesize,
    language: nextResult.language,
    pages: nextResult.pages,
    publisher: nextResult.publisher,
    currentIndex: nextIndex
  };
}

/**
 * Search for multiple books in batch
 * @param {Array} books - Array of book objects with title and author
 * @returns {Promise<Object>} Map of book IDs to libgen results
 */
export async function batchSearchBooks(books) {
  const results = {};

  // Search books with a delay to avoid overwhelming the API
  for (const book of books) {
    if (!book.title) continue;

    try {
      const libgenResults = await searchByTitleAndAuthor(
        book.title,
        book.author || "",
        { count: 3 }
      );

      if (libgenResults.length > 0) {
        results[book.id] = libgenResults[0]; // Take the best match
      }

      // Small delay to be respectful to the API
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to search for book ${book.id}:`, error);
    }
  }

  return results;
}

/**
 * Calculate library statistics for LibGen availability
 * @param {Array} books - Array of books in the library
 * @returns {Object} Statistics object
 */
export function calculateLibraryStats(books) {
  if (!Array.isArray(books)) {
    return {
      total: 0,
      withLibgen: 0,
      percentage: 0,
      totalSize: "0 MB",
      formats: {}
    };
  }

  const withLibgen = books.filter(book => book.libgenMetadata?.md5);
  const totalSize = withLibgen.reduce((sum, book) => {
    const size = book.libgenMetadata?.filesize || "";
    const match = size.match(/(\d+\.?\d*)\s*(MB|KB|GB)/i);
    if (match) {
      const value = parseFloat(match[1]);
      const unit = match[2].toUpperCase();
      if (unit === "GB") return sum + (value * 1024);
      if (unit === "KB") return sum + (value / 1024);
      return sum + value;
    }
    return sum;
  }, 0);

  const formats = {};
  withLibgen.forEach(book => {
    const ext = book.libgenMetadata?.extension?.toUpperCase();
    if (ext) {
      formats[ext] = (formats[ext] || 0) + 1;
    }
  });

  return {
    total: books.length,
    withLibgen: withLibgen.length,
    percentage: books.length > 0 ? Math.round((withLibgen.length / books.length) * 100) : 0,
    totalSize: totalSize > 1024 ? `${(totalSize / 1024).toFixed(2)} GB` : `${totalSize.toFixed(2)} MB`,
    totalSizeMB: totalSize,
    formats
  };
}
