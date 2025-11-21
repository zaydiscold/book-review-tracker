# LibGen Working Mirrors List

**Last Tested:** 2025-11-21
**Test Method:** `libgen-api-enhanced` library with `search_title("Dune")`
**Test Script:** `src/python-service/test_mirrors_with_library.py`

---

## VERIFIED WORKING MIRRORS

These mirrors were tested and confirmed working:

| Mirror | Status | Results | Response Time |
|--------|--------|---------|---------------|
| **li** | ✓ VERIFIED | 100 results | 1.23s |
| **bz** | ✓ VERIFIED | 100 results | 1.23s |

### Usage with libgen-api-enhanced:
```python
from libgen_api_enhanced import LibgenSearch

# Primary (recommended)
s = LibgenSearch(mirror="li")
results = s.search_title("Dune")

# Fallback
s = LibgenSearch(mirror="bz")
results = s.search_title("Dune")
```

---

## FAILED MIRRORS (Tested but Not Working)

| Mirror | Status | Error |
|--------|--------|-------|
| gs | ✗ FAILED | Connection error |
| rs | ✗ FAILED | Timeout |
| st | ✗ FAILED | Timeout |
| is | ✗ FAILED | Timeout |
| lc | ✗ FAILED | Timeout (likely) |

---

## API Endpoints

### Get Verified Mirrors
```
GET http://localhost:5001/mirrors/verified
```

Returns:
```json
{
  "mirrors": ["li", "bz"],
  "count": 2,
  "usage": "LibgenSearch(mirror='li') or LibgenSearch(mirror='bz')",
  "tested": "2025-11-21",
  "test_query": "Dune",
  "test_results": "100 results each"
}
```

### Search with Auto-Fallback
```
POST http://localhost:5001/search
Content-Type: application/json

{
  "query": "Dune",
  "search_type": "title",
  "topics": ["libgen"]
}
```

Response includes `mirror_used` field showing which mirror succeeded.

---

## Discord Bot Integration

```python
from libgen_api_enhanced import LibgenSearch

# Mirror fallback pattern
VERIFIED_MIRRORS = ["li", "bz"]

async def search_book(query: str):
    for mirror in VERIFIED_MIRRORS:
        try:
            s = LibgenSearch(mirror=mirror)
            results = s.search_title(query)
            if results:
                return results
        except Exception as e:
            print(f"Mirror {mirror} failed: {e}")
            continue
    return None
```

---

## Re-Testing Mirrors

To re-test mirrors and update this list:

```bash
cd src/python-service
python3 test_mirrors_with_library.py
```

Update this file with new results!
