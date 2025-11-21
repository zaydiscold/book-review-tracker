# LibGen API Integration Documentation

## Overview

This document describes the LibGen (Library Genesis) integration for the Reading Journal app, based on the enhanced Python library's capabilities but implemented in JavaScript/Node.js.

---

## Features We Can Implement

### 1. **Search Capabilities**

#### Search Types
- **Title Search** - Search specifically in book titles
- **Author Search** - Search specifically in author names  
- **Default Search** - Search across title, author, series, year, publisher, and ISBN

#### Search Topics (Different LibGen Databases)
- **LIBGEN** - Main scientific/academic database
- **FICTION** - Fiction books database
- **COMICS** - Comics and graphic novels
- **ARTICLES** - Academic articles and papers
- **MAGAZINES** - Magazine archives
- **FICTION_RUS** - Russian fiction database
- **STANDARDS** - Technical standards and specifications

### 2. **Filtering**

Apply filters to narrow results:
- **Year** - Filter by publication year (exact or range)
- **Extension** - Filter by file format (epub, pdf, mobi, etc.)
- **Language** - Filter by language
- **Publisher** - Filter by publisher name
- **Pages** - Filter by page count
- **Size** - Filter by file size

**Filtering Modes:**
- **Exact Match** - Case-sensitive, exact string matching
- **Partial Match** - Case-insensitive, substring matching

### 3. **Download Links**

#### Types of Links
1. **Mirror Links** - Links to LibGen mirror pages
   - Mirror 1, 2, 3, 4 (different LibGen mirrors)
   
2. **Direct Download Links**
   - HTTP download links (resolved from mirrors)
   - Tor/Onion links (for privacy)

3. **Metadata Links**
   - Edit page (for metadata viewing)
   - Cover image URLs

### 4. **Result Fields**

Each search result contains:
```javascript
{
  id: "123456",                    // LibGen ID
  title: "Book Title",             // Book title
  author: "Author Name(s)",        // Author(s)
  publisher: "Publisher Name",     // Publisher
  year: "2021",                    // Publication year
  language: "English",             // Language
  pages: "410",                    // Page count
  size: "1.5 MB",                  // File size
  extension: "epub",               // File format
  md5: "abc123...",                // MD5 hash (unique ID)
  isbn: "1234567890",              // ISBN (if available)
  series: "Series Name",           // Book series
  edition: "2nd",                  // Edition
  
  // Links
  mirrors: [...],                  // Array of mirror URLs
  torDownloadLink: "...",          // Tor/onion download link
  resolvedDownloadLink: "...",     // Direct HTTP download
  coverUrl: "...",                 // Cover image URL
  
  // Metadata
  dateAdded: "2021-01-01",         // Date added to LibGen
  dateModified: "2021-06-15"       // Last modified date
}
```

---

## Implementation Plan

### Phase 1: Basic Search ✅ DONE
- [x] Connect to LibGen mirrors
- [x] Implement title search
- [x] Implement author search
- [x] Return basic metadata

### Phase 2: Enhanced Search 🚧 IN PROGRESS
- [ ] Add search topic selection (fiction, comics, etc.)
- [ ] Implement search type filtering
- [ ] Add pagination support
- [ ] Improve error handling

### Phase 3: Filtering 📋 PLANNED
- [ ] Exact match filtering
- [ ] Partial match filtering
- [ ] Multi-field filtering
- [ ] Filter validation

### Phase 4: Downloads 📋 PLANNED
- [ ] Resolve direct download links
- [ ] Generate Tor links
- [ ] Handle multiple mirrors
- [ ] Download link validation

### Phase 5: Metadata 📋 PLANNED
- [ ] Add upload date info
- [ ] Add modification date info
- [ ] Fetch cover images
- [ ] Get additional metadata

---

## Current Implementation

### Backend Service (`libgenService.js`)

```javascript
// Current capabilities:
searchByTitle(title, options)    // Search by title
searchByAuthor(author, options)  // Search by author
search(query, options)           // General search
getMirror()                      // Get fastest mirror
```

### API Endpoints

```
POST /api/libgen/search
GET  /api/libgen/mirror
GET  /api/libgen/latest
```

---

## Usage Examples

### Example 1: Basic Title Search
```javascript
const results = await searchByTitle("Harry Potter", { 
  count: 10 
});
```

### Example 2: Search with Topic (Planned)
```javascript
const results = await searchByTitle("Neuromancer", {
  count: 10,
  topic: "FICTION"  // Search only fiction database
});
```

### Example 3: Filtered Search (Planned)
```javascript
const results = await searchByTitleFiltered("Pride and Prejudice", {
  filters: {
    year: "2007",
    extension: "epub",
    language: "English"
  },
  exactMatch: true,
  topic: "FICTION"
});
```

### Example 4: Get Direct Download (Planned)
```javascript
const book = results[0];
const downloadLink = await resolveDirectDownloadLink(book.md5);
// Returns: "http://download.library.lol/fiction/..."
```

---

## LibGen Mirrors

### Available Mirrors
1. **libgen.is** - Main mirror (default)
2. **libgen.li** - Alternative mirror
3. **libgen.bz** - Alternative mirror  
4. **gen.lib.rus.ec** - Russian mirror
5. **library.lol** - Download mirror

### Mirror Selection
The library automatically selects the fastest responding mirror.

---

## Search Topics Reference

| Topic | Database | Content Type |
|-------|----------|--------------|
| LIBGEN | Main | Scientific, academic, non-fiction |
| FICTION | Fiction | Novels, short stories |
| COMICS | Comics | Comics, manga, graphic novels |
| ARTICLES | Sci Articles | Academic papers, journals |
| MAGAZINES | Magazines | Magazine archives |
| FICTION_RUS | Fiction (Russian) | Russian fiction literature |
| STANDARDS | Standards | Technical standards, specs |

---

## File Extensions Supported

- **eBook**: epub, mobi, azw3, fb2
- **Documents**: pdf, djvu, doc, docx
- **Text**: txt, rtf
- **Other**: chm, lit, pdb

---

## Limitations & Considerations

### API Limitations
- **No Official API** - LibGen doesn't have an official API, we scrape HTML
- **Rate Limiting** - Be respectful, don't spam requests
- **Slow Responses** - LibGen servers can be slow (30-60+ seconds)
- **Availability** - Mirrors may go down or change URLs

### Legal Considerations
- **Copyright**: LibGen hosts copyrighted material
- **Usage**: For educational/research purposes
- **Compliance**: Check your local laws regarding downloading

### Technical Limitations
- **25 Results Max** - LibGen returns max 25 results per page
- **No Pagination** - Currently only first page of results
- **Mirror Changes** - URLs and structure may change
- **CAPTCHA**: Some mirrors may implement CAPTCHA

---

## Troubleshooting

### Issue: Searches timeout
**Solution**: LibGen servers are slow. Increase timeout to 60-120 seconds.

### Issue: No results found
**Solution**: 
- Try a different search term
- Try a different mirror
- Check if specific topic is needed (fiction vs. libgen)

### Issue: Download links don't work
**Solution**:
- Links may expire
- Try alternative mirrors
- Resolve download link in real-time

### Issue: Connection refused
**Solution**:
- Check if backend server is running (`node server.js`)
- Verify port 4000 is available
- Check firewall settings

---

## Future Enhancements

1. **Multi-Topic Search** - Search across multiple databases
2. **Advanced Filtering** - More filter options
3. **Cached Results** - Store recent searches
4. **Batch Downloads** - Queue multiple books
5. **Cover Images** - Fetch and display covers
6. **Reading Lists** - Create lists from search results
7. **Recommendations** - Suggest similar books

---

## API Reference

### Frontend Client (`/src/data/libgen.js`)

```javascript
// Search functions
searchLibgen(query, options)
searchByTitleAndAuthor(title, author, options)

// Utility functions
getLibGenMirrorUrl(md5)
getNextLibGenResult(book)
calculateLibraryStats(books)

// Batch operations
batchSearchBooks(books)
```

### Backend Service (`/src/backend/services/libgenService.js`)

```javascript
// Search methods
search(query, options)
searchByTitle(title, options)
searchByAuthor(author, options)

// Utility methods
getMirror()
getLatest()
```

---

## Testing Checklist

- [ ] Basic title search works
- [ ] Basic author search works
- [ ] Results include all required fields
- [ ] Timeout handling works properly
- [ ] Error messages are clear
- [ ] Multiple mirrors can be tried
- [ ] Download links are valid
- [ ] Cover images load correctly

---

## Resources

- **LibGen Homepage**: http://libgen.is
- **Python Enhanced API**: https://github.com/onurhanak/libgen-api-enhanced
- **LibGen Wiki**: http://wiki.mhut.org/content:library_genesis
- **Alternative Mirrors**: http://libgen.li, http://libgen.bz

---

**Note**: This integration is for educational purposes. Always respect copyright laws in your jurisdiction.

*Last Updated: 2025-11-20*
