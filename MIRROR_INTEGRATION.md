# LibGen Mirror Integration Guide

This document explains how to integrate the mirror system into the Discord bot and other components.

## Quick Start

### Python Service
The mirror system is fully integrated into the FastAPI service at `src/python-service/`.

**Available Endpoints:**
```
GET /mirrors/all           # All 33 mirrors + stats
GET /mirrors/recommended   # Working mirrors only (11 mirrors)
GET /mirrors/primary       # Primary mirror
GET /mirrors/book/{md5}    # Book links across 5 mirrors
POST /mirrors/test         # Test all mirrors
POST /mirrors/fastest      # Find fastest mirror
```

### Testing Mirrors Locally
```bash
cd src/python-service
python3 test_mirrors.py          # Test connectivity
python3 test_mirrors.py search   # Test search capability for "Dune"
```

Update `../../WORKING_MIRRORS.md` with your results!

---

## Discord Bot Integration

### Option 1: Use Recommended Mirrors (Simple)
```python
from libgen_mirrors import get_recommended_mirrors

mirrors = get_recommended_mirrors()  # Returns 11 working mirrors
# Use in book links, fallback rotation, etc.
```

### Option 2: Use API Endpoint (Recommended)
```python
import aiohttp

async def get_book_mirrors(md5: str):
    async with aiohttp.ClientSession() as session:
        async with session.get(
            f"http://localhost:5001/mirrors/recommended"
        ) as resp:
            data = await resp.json()
            mirrors = data["mirrors"]
```

### Example: Book Search with Fallbacks
```python
async def search_dune_with_fallbacks():
    # Get recommended mirrors
    mirrors = get_recommended_mirrors()

    # Try each mirror until one works
    for mirror in mirrors:
        try:
            url = f"{mirror}/search.php"
            params = {
                "req": "Dune",
                "lg_topic": "libgen",
                "phrase": "1"
            }
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params, timeout=5) as resp:
                    if resp.status == 200:
                        return await resp.text()  # Found working mirror!
        except Exception as e:
            print(f"Failed on {mirror}: {e}")
            continue  # Try next mirror

    raise Exception("All mirrors failed")
```

### Example: Direct Book Links
```python
from libgen_mirrors import get_book_mirror_urls

def get_book_links(md5: str):
    """Get direct download links across multiple mirrors"""
    result = get_book_mirror_urls(md5, limit=5)

    # result = {
    #     "mirrors": [
    #         "http://libgen.is/book/index.php?md5=abc123...",
    #         "http://libgen.rs/book/index.php?md5=abc123...",
    #         ...
    #     ],
    #     "count": 5,
    #     "primary": "http://libgen.is/book/index.php?md5=abc123..."
    # }

    return result["mirrors"]
```

---

## Mirror Prioritization Strategy

### For Book Search (Using libgen-api-enhanced):
1. Try **primary mirrors** first (library verified)
   - https://libgen.li (default)
   - https://libgen.bz
   - https://libgen.gs
2. Fall back to **working_fallbacks** if needed
   - https://libgen.rs, https://libgen.st, https://libgen.is, etc.
3. Last resort: **all other mirrors**

### For Direct Links:
- Generate links for all primary + recommended mirrors
- Present user with multiple download options
- Try each link if one fails

---

## Mirror List Maintenance

### Current Status
- **Primary**: 4 mirrors (most stable)
- **Working Fallbacks**: 7 verified mirrors
- **All Categories**: 33 mirrors total
- **Last Tested**: See `WORKING_MIRRORS.md`

### How to Update
1. Run tests locally:
   ```bash
   python3 src/python-service/test_mirrors.py
   ```

2. Update `WORKING_MIRRORS.md` with results

3. Reorganize mirrors in `libgen_mirrors.py` based on reliability

4. Commit changes:
   ```bash
   git add WORKING_MIRRORS.md src/python-service/libgen_mirrors.py
   git commit -m "Update mirror list based on latest testing"
   ```

---

## Mirror Availability Notes

⚠️ **Important:**
- Mirrors go down/get blocked frequently (days to weeks)
- Different ISPs and countries have different accessible mirrors
- Some mirrors may be blocked in certain regions
- Generic TLDs (.click, .fun, .world) are less stable
- Test regularly and update the working list!

✓ **Most Reliable:**
- libgen.is (Iceland) - original, usually works
- libgen.rs (Serbia) - excellent backup
- libgen.st (Saint Helena) - good uptime

---

## API Response Examples

### GET /mirrors/recommended
```json
{
  "mirrors": [
    "http://libgen.is",
    "http://libgen.rs",
    "http://libgen.st",
    "http://libgen.gs",
    "http://libgen.lc",
    "http://libgen.br",
    "http://libgen.bz",
    "http://libgen.il",
    "http://libgen.sg",
    "http://libgen.in",
    "http://gen.lib.rus.ec"
  ],
  "count": 11,
  "note": "These mirrors are known to be reliably working"
}
```

### GET /mirrors/book/{md5}
```json
{
  "mirrors": [
    "http://libgen.is/book/index.php?md5=abc123...",
    "http://libgen.rs/book/index.php?md5=abc123...",
    "http://libgen.st/book/index.php?md5=abc123...",
    "http://libgen.gs/book/index.php?md5=abc123...",
    "http://libgen.lc/book/index.php?md5=abc123..."
  ],
  "count": 5,
  "primary": "http://libgen.is/book/index.php?md5=abc123..."
}
```

---

## Testing & Validation

Before releasing bot updates with new mirrors:
1. Test on your machine
2. Run `test_mirrors.py` to verify access
3. Test actual book searches in the bot
4. Update `WORKING_MIRRORS.md` with results
5. Create a PR/commit with updated mirror list

---

## Troubleshooting

**No mirrors working?**
- Check your internet connection
- Your ISP may be blocking LibGen
- Try VPN or proxy
- Check if region-specific mirrors work better

**Search returns empty?**
- Mirror may be down/returning errors
- Try a different mirror
- Check mirror status with `test_mirrors.py`

**Links give 404?**
- Book may have been removed from that mirror
- Try links on other mirrors
- MD5 hash may be incorrect
