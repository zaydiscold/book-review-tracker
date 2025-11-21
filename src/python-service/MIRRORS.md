# LibGen Mirror Management

The Python service now includes comprehensive mirror management with 31+ known LibGen mirrors.

## Mirror Configuration

Mirrors are categorized into 4 groups in `libgen_mirrors.py`:

- **Primary** (4 mirrors) - Most stable and reliable
- **Country-Code TLDs** (18 mirrors) - Regional alternatives like .br, .il, .bz, etc.
- **Generic TLDs** (10 mirrors) - Alternative extensions like .click, .fun, .world
- **Backup** (1 mirror) - Russian relay as last resort

## API Endpoints

### Get All Mirrors
```
GET /mirrors/all
```

Returns all available mirrors with statistics:
```json
{
  "mirrors": [
    "http://libgen.is",
    "http://libgen.rs",
    ...
  ],
  "stats": {
    "primary": 4,
    "cc_tlds": 18,
    "generic_tlds": 10,
    "backup": 1,
    "total": 33
  }
}
```

### Get Mirror Statistics
```
GET /mirrors/stats
```

Returns statistics about mirror distribution:
```json
{
  "stats": {
    "primary": 4,
    "cc_tlds": 18,
    "generic_tlds": 10,
    "backup": 1,
    "total": 33
  },
  "total_mirrors": 33
}
```

### Get Primary Mirror
```
GET /mirrors/primary
```

Returns the default/primary mirror:
```json
{
  "mirror": "http://libgen.is"
}
```

### Get Book Mirror URLs
```
GET /mirrors/book/{md5}?limit=5
```

Returns direct download links for a book across multiple mirrors:
```json
{
  "mirrors": [
    "http://libgen.is/book/index.php?md5=abc123...",
    "http://libgen.rs/book/index.php?md5=abc123...",
    ...
  ],
  "count": 5,
  "primary": "http://libgen.is/book/index.php?md5=abc123..."
}
```

### Test All Mirrors
```
POST /mirrors/test
```

Tests which mirrors are currently accessible (takes ~10-15 seconds):
```json
{
  "working": [
    "http://libgen.is",
    "http://libgen.rs"
  ],
  "failed": [
    "http://libgen.st",
    ...
  ],
  "total_tested": 33,
  "working_count": 2
}
```

### Find Fastest Mirror
```
POST /mirrors/fastest
```

Returns the fastest responding mirror:
```json
{
  "mirror": "http://libgen.is",
  "status": "ok"
}
```

If all mirrors fail:
```json
{
  "mirror": "http://libgen.is",
  "status": "fallback",
  "message": "All mirrors failed, using primary fallback"
}
```

## Usage Examples

### Python Client
```python
import requests

# Get all mirrors
response = requests.get("http://localhost:5001/mirrors/all")
mirrors = response.json()

# Get book download links
response = requests.get(f"http://localhost:5001/mirrors/book/abc123def456")
book_mirrors = response.json()

# Test mirrors
response = requests.post("http://localhost:5001/mirrors/test")
test_results = response.json()

# Find fastest
response = requests.post("http://localhost:5001/mirrors/fastest")
fastest = response.json()
```

### JavaScript/Frontend
```javascript
// Get all mirrors
const response = await fetch("http://localhost:4000/api/mirrors/all");
const mirrors = await response.json();

// Get book mirrors
const bookResponse = await fetch(`http://localhost:4000/api/mirrors/book/${md5}`);
const bookMirrors = await bookResponse.json();
```

## Mirror Priority List

1. `libgen.is` - Primary (Iceland)
2. `libgen.rs` - Serbia
3. `libgen.st` - Saint Helena
4. `libgen.gs` - South Georgia
5. `libgen.lc` - Saint Lucia
6. `libgen.bz` - Belize
7. `libgen.br` - Brazil
8. ... and 26 more alternatives

## Adding New Mirrors

To add new mirrors, edit `libgen_mirrors.py` and add them to the appropriate category:

```python
LIBGEN_MIRRORS = {
    "primary": [...],
    "cc_tlds": [...],  # Add new country-code TLDs here
    "generic_tlds": [...],  # Add new generic TLDs here
    "backup": [...]
}
```

## Performance Notes

- Mirror availability changes frequently (daily/weekly)
- Different regions may have different working mirrors
- `.is` (Iceland) and `.rs` (Serbia) are historically more stable
- Generic TLDs (.click, .fun, etc.) have higher turnover
- Use `/mirrors/test` to find current working mirrors
- Use `/mirrors/fastest` to optimize response times

## Integration with Search

The mirror endpoints are available alongside existing search functionality:

- `/search` - Search books (uses backend's configured mirror)
- `/mirrors/*` - Mirror management endpoints (new)

Future: Search could be enhanced to automatically select the fastest mirror.
