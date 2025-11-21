/**
 * LibGen Service Module
 * Handles all Library Genesis API interactions
 * Based on libgen npm package: https://www.npmjs.com/package/libgen
 */

const libgen = require('libgen');

/**
 * Search Library Genesis by title
 * @param {string} title - Book title to search for (min 3 characters)
 * @param {Object} options - Search options
 * @param {number} options.count - Number of results to return (default: 25, max: 25)
 * @param {string} options.mirror - LibGen mirror to use
 * @returns {Promise<Array>} Array of book results
 */
async function searchByTitle(title, options = {}) {
    if (!title || title.length < 3) {
        throw new Error('Search query must be at least 3 characters long');
    }

    const { count = 25, mirror } = options;

    try {
        // Get mirror if not provided
        const selectedMirror = mirror || await getMirror();

        const searchOptions = {
            mirror: selectedMirror,
            query: title,
            count: Math.min(count, 25), // Max 25 results per libgen limitation
            search_in: 'title' // Search specifically in title field
        };

        console.log('[LibGen] Searching by title:', title, 'with options:', searchOptions);
        const results = await libgen.search(searchOptions);

        return normalizeResults(results, selectedMirror);
    } catch (error) {
        console.error('[LibGen] Search by title failed:', error);
        throw error;
    }
}

/**
 * Search Library Genesis by author
 * @param {string} author - Author name to search for (min 3 characters)
 * @param {Object} options - Search options
 * @param {number} options.count - Number of results to return (default: 25, max: 25)
 * @param {string} options.mirror - LibGen mirror to use
 * @returns {Promise<Array>} Array of book results
 */
async function searchByAuthor(author, options = {}) {
    if (!author || author.length < 3) {
        throw new Error('Search query must be at least 3 characters long');
    }

    const { count = 25, mirror } = options;

    try {
        const selectedMirror = mirror || await getMirror();

        const searchOptions = {
            mirror: selectedMirror,
            query: author,
            count: Math.min(count, 25),
            search_in: 'author' // Search specifically in author field
        };

        console.log('[LibGen] Searching by author:', author, 'with options:', searchOptions);
        const results = await libgen.search(searchOptions);

        return normalizeResults(results, selectedMirror);
    } catch (error) {
        console.error('[LibGen] Search by author failed:', error);
        throw error;
    }
}

/**
 * General search across all fields
 * @param {string} query - Search query (min 3 characters)
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Array of book results
 */
async function search(query, options = {}) {
    if (!query || query.length < 3) {
        throw new Error('Search query must be at least 3 characters long');
    }

    const { count = 25, mirror, search_in = 'def' } = options;

    try {
        const selectedMirror = mirror || await getMirror();

        const searchOptions = {
            mirror: selectedMirror,
            query: query,
            count: Math.min(count, 25),
            search_in: search_in // 'def', 'title', 'author', etc.
        };

        console.log('[LibGen] General search:', query, 'with options:', searchOptions);
        const results = await libgen.search(searchOptions);

        return normalizeResults(results, selectedMirror);
    } catch (error) {
        console.error('[LibGen] General search failed:', error);
        throw error;
    }
}

/**
 * Get the fastest available LibGen mirror
 * @returns {Promise<string>} Mirror URL
 */
async function getMirror() {
    try {
        const mirror = await libgen.mirror();
        console.log('[LibGen] Selected mirror:', mirror);
        return mirror;
    } catch (error) {
        console.warn('[LibGen] Failed to get mirror, using fallback:', error.message);
        return 'http://libgen.is';
    }
}

/**
 * Get the latest uploaded book
 * @returns {Promise<Object>} Latest book data
 */
async function getLatest() {
    try {
        const mirror = await getMirror();
        const latest = await libgen.latest.text(mirror);

        return {
            ...latest,
            downloadUrl: generateDownloadUrl(latest.md5, mirror),
            mirrors: generateMirrorUrls(latest.md5)
        };
    } catch (error) {
        console.error('[LibGen] Failed to get latest:', error);
        throw error;
    }
}

/**
 * Normalize search results to include download URLs
 * @param {Array} results - Raw results from libgen
 * @param {string} mirror - Mirror used for search
 * @returns {Array} Normalized results
 */
function normalizeResults(results, mirror) {
    if (!Array.isArray(results)) {
        console.warn('[LibGen] Non-array results received:', results);
        return [];
    }

    return results.map(result => ({
        ...result,
        // Ensure we have an md5 field (some results might use different capitalization)
        md5: result.md5 || result.MD5 || '',
        downloadUrl: generateDownloadUrl(result.md5 || result.MD5, mirror),
        mirrors: generateMirrorUrls(result.md5 || result.MD5),
        // Additional normalized fields
        id: result.ID || result.id,
        author: result.Author || result.author || '',
        title: result.Title || result.title || '',
        publisher: result.Publisher || result.publisher || '',
        year: result.Year || result.year || '',
        pages: result.Pages || result.pages || '',
        language: result.Language || result.language || '',
        filesize: result.Size || result.filesize || '',
        extension: result.Extension || result.extension || '',
    }));
}

/**
 * Generate download URL for a given MD5 hash
 * @param {string} md5 - MD5 hash of the book
 * @param {string} mirror - Mirror URL
 * @returns {string} Download page URL
 */
function generateDownloadUrl(md5, mirror) {
    if (!md5) return '';
    return `${mirror}/book/index.php?md5=${md5.toLowerCase()}`;
}

/**
 * Generate mirror URLs for a given MD5 hash
 * @param {string} md5 - MD5 hash of the book
 * @returns {Array<string>} Array of mirror URLs
 */
function generateMirrorUrls(md5) {
    if (!md5) return [];
    const lowerMd5 = md5.toLowerCase();
    return [
        `http://libgen.is/book/index.php?md5=${lowerMd5}`,
        `http://gen.lib.rus.ec/book/index.php?md5=${lowerMd5}`,
        `http://library.lol/main/${lowerMd5}`,
    ];
}

module.exports = {
    search,
    searchByTitle,
    searchByAuthor,
    getMirror,
    getLatest,
};
