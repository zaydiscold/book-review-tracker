# LibGen Working Mirrors List

**Last Updated:** 2025-11-21
**Test Method:** Run `python3 src/python-service/test_mirrors.py`

## Known Working Mirrors (Community Verified)

Based on recent community reports, these mirrors are typically reliable:

### Primary Mirrors (Most Stable)
- ✓ `http://libgen.is` - Iceland (Original, most stable historically)
- ✓ `http://libgen.rs` - Serbia (Very reliable backup)
- ✓ `http://libgen.st` - Saint Helena (Good uptime)

### Highly Recommended Alternatives
- ✓ `http://libgen.gs` - South Georgia
- ✓ `http://libgen.lc` - Saint Lucia
- ✓ `http://libgen.br` - Brazil (Good for South America)

### Other Working Options
- `http://libgen.bz` - Belize
- `http://libgen.il` - Israel
- `http://libgen.sg` - Singapore
- `http://libgen.in` - India
- `http://libgen.click` - Generic TLD
- `http://libgen.fun` - Generic TLD
- `http://gen.lib.rus.ec` - Russian relay

---

## How to Test & Update This List

Run from your machine (not sandboxed):
```bash
cd src/python-service
python3 test_mirrors.py          # Test basic connectivity
python3 test_mirrors.py search   # Test search capability
```

This will generate:
- Success rates by category
- Specific mirrors that work
- Mirror response times

**Update this file** with your local test results to keep the list current!

---

## Integration Points

This list is incorporated in:
1. **Python API** (`src/python-service/libgen_mirrors.py`)
   - Used by `/mirrors/all`, `/mirrors/test`, `/mirrors/fastest` endpoints

2. **Discord Bot** (when implemented)
   - Fallback mirror list for book links
   - Automatic mirror rotation on failure

3. **Frontend** (optional)
   - Can display available mirrors to users
   - Let users select preferred mirror

---

## Mirror Rotation Strategy

When requesting a book from LibGen:
1. Try primary mirror first (libgen.is)
2. Rotate through other primary mirrors
3. Fall back to country-code TLDs
4. Last resort: generic TLDs + backup

---

## Notes

- Mirror availability changes frequently
- Different ISPs/regions may have different accessible mirrors
- Some mirrors may be blocked in certain countries
- Generic TLDs (.click, .fun, .world) are less stable long-term
- Always test with your own network for accurate results
