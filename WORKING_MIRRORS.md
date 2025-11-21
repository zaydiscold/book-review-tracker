# LibGen Working Mirrors List

**Last Updated:** 2025-11-21
**Based On:** libgen-api-enhanced library defaults and documentation
**Source:** https://github.com/libgen-api-enhanced/libgen-api-enhanced

## VERIFIED Working Mirrors (libgen-api-enhanced)

The `libgen-api-enhanced` library is the working implementation. It defaults to `.li` and supports documented alternatives.

### Primary Mirrors (Library Verified)
- ✓ `https://libgen.li` - **Library default (verified working)**
- ✓ `https://libgen.bz` - Belize (documented alternative)
- ✓ `https://libgen.gs` - South Georgia (documented alternative)

### Recommended Fallbacks (Compatible)
- ✓ `https://libgen.rs` - Serbia
- ✓ `https://libgen.st` - Saint Helena
- ✓ `https://libgen.is` - Iceland
- ✓ `https://libgen.lc` - Saint Lucia
- ✓ `https://libgen.br` - Brazil
- ✓ `https://libgen.vg` - British Virgin Islands
- ✓ `https://libgen.io` - British Indian Ocean Territory

### Alternative TLDs (May Work)
- `https://libgen.il` - Israel
- `https://libgen.sg` - Singapore
- `https://libgen.in` - India
- `https://libgen.me` - Montenegro
- `https://libgen.click` - Generic TLD
- `https://libgen.fun` - Generic TLD
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
