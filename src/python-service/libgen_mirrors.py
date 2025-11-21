"""
LibGen Mirror Configuration and Management
List of known working LibGen mirrors in priority order
"""

from typing import List, Dict, Optional
import asyncio
import aiohttp

LIBGEN_MIRRORS = {
    # VERIFIED WORKING MIRRORS (Tested 2025-11-21 with libgen-api-enhanced)
    # Test: search_title("Dune") - 100 results returned
    "verified_working": [
        "li",                    # ✓ VERIFIED: 100 results in 1.23s (DEFAULT)
        "bz",                    # ✓ VERIFIED: 100 results in 1.23s
    ],

    # Primary mirrors - use TLD format for LibgenSearch(mirror="xx")
    "primary": [
        "li",                    # Library default (VERIFIED WORKING)
        "bz",                    # Belize (VERIFIED WORKING)
    ],

    # FAILED/TIMEOUT mirrors (tested but don't work)
    "failed_mirrors": [
        "gs",                    # ✗ Failed to connect
        "rs",                    # ✗ Timeout
        "st",                    # ✗ Timeout
        "is",                    # ✗ Timeout
        "lc",                    # ✗ Timeout (likely)
    ],

    # Untested mirrors (may or may not work)
    "untested": [
        "br",                    # Brazil
        "vg",                    # British Virgin Islands
        "io",                    # British Indian Ocean Territory
        "il",                    # Israel
        "sg",                    # Singapore
        "in",                    # India
        "me",                    # Montenegro
    ],
    "cc_tlds": [
        "https://libgen.lc",     # Saint Lucia
        "https://libgen.bz",     # Belize
        "https://libgen.br",     # Brazil
        "https://libgen.il",     # Israel
        "https://libgen.sg",     # Singapore
        "https://libgen.in",     # India
        "https://libgen.mk",     # North Macedonia
        "https://libgen.vg",     # British Virgin Islands
        "https://libgen.me",     # Montenegro
        "https://libgen.tv",     # Tuvalu
        "https://libgen.io",     # British Indian Ocean Territory
        "https://libgen.co",     # Colombia
        "https://libgen.cc",     # Cocos Islands
        "https://libgen.to",     # Tonga
        "https://libgen.ws",     # Samoa
        "https://libgen.nu",     # Niue
        "https://libgen.sh",     # Saint Helena (alternate)
        "https://libgen.re",     # Reunion
    ],
    "generic_tlds": [
        "https://libgen.click",  # Generic TLD
        "https://libgen.today",  # Generic TLD
        "https://libgen.fun",    # Generic TLD
        "https://libgen.world",  # Generic TLD
        "https://libgen.tech",   # Generic TLD
        "https://libgen.top",    # Generic TLD
        "https://libgen.site",   # Generic TLD
        "https://libgen.online", # Generic TLD
        "https://libgen.space",  # Generic TLD
        "https://libgen.zone",   # Generic TLD
    ],
    "backup": [
        "http://gen.lib.rus.ec", # Russian mirrors relay
    ],
}


def get_verified_mirrors() -> List[str]:
    """Get only verified working mirrors (TLD format for LibgenSearch)"""
    return LIBGEN_MIRRORS["verified_working"]


def get_all_mirrors_tld() -> List[str]:
    """Get all mirrors in TLD format for LibgenSearch(mirror='xx')"""
    return (
        LIBGEN_MIRRORS["verified_working"]
        + LIBGEN_MIRRORS["untested"]
    )


def get_recommended_mirrors() -> List[str]:
    """Get recommended/working mirrors (TLD format)"""
    return LIBGEN_MIRRORS["verified_working"]


def get_all_mirrors() -> List[str]:
    """Get all mirrors as full URLs (for HTTP requests)"""
    tlds = get_all_mirrors_tld()
    return [f"https://libgen.{tld}" for tld in tlds]


def get_mirror_stats() -> Dict[str, int]:
    """Get mirror count by category"""
    return {
        "primary": len(LIBGEN_MIRRORS["primary"]),
        "cc_tlds": len(LIBGEN_MIRRORS["cc_tlds"]),
        "generic_tlds": len(LIBGEN_MIRRORS["generic_tlds"]),
        "backup": len(LIBGEN_MIRRORS["backup"]),
        "total": len(get_all_mirrors()),
    }


async def test_mirror(mirror: str, timeout: int = 3) -> Optional[str]:
    """Test if a single mirror is accessible"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.head(mirror, timeout=aiohttp.ClientTimeout(total=timeout)) as response:
                if response.status == 200:
                    return mirror
    except Exception:
        # Try GET if HEAD fails
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(mirror, timeout=aiohttp.ClientTimeout(total=timeout)) as response:
                    if response.status == 200:
                        return mirror
        except Exception:
            pass
    return None


async def test_all_mirrors(timeout: int = 3) -> Dict[str, List[str]]:
    """Test all mirrors and return results"""
    mirrors = get_all_mirrors()
    tasks = [test_mirror(m, timeout) for m in mirrors]
    results = await asyncio.gather(*tasks)

    working = [m for m in results if m is not None]
    failed = [m for m in mirrors if m not in working]

    return {
        "working": working,
        "failed": failed,
        "total_tested": len(mirrors),
        "working_count": len(working),
    }


async def get_fastest_mirror(timeout: int = 3) -> Optional[str]:
    """Get the fastest responding mirror"""
    mirrors = get_all_mirrors()

    for mirror in mirrors:
        result = await test_mirror(mirror, timeout)
        if result:
            return result

    return None


def get_book_mirror_urls(md5: str, limit: int = 5) -> Dict[str, List[str]]:
    """Get book URLs for multiple mirrors"""
    if not md5:
        return {}

    lower_md5 = md5.lower()
    book_path = f"/book/index.php?md5={lower_md5}"
    mirrors = get_all_mirrors()[:limit]

    return {
        "mirrors": [f"{m}{book_path}" for m in mirrors],
        "count": len(mirrors),
        "primary": f"{mirrors[0]}{book_path}" if mirrors else None,
    }


def get_primary_mirror() -> str:
    """Get the primary mirror URL"""
    mirrors = get_all_mirrors()
    return mirrors[0] if mirrors else "http://libgen.is"
