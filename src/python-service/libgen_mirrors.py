"""
LibGen Mirror Configuration and Management
List of known working LibGen mirrors in priority order
"""

from typing import List, Dict, Optional
import asyncio
import aiohttp

LIBGEN_MIRRORS = {
    "primary": [
        "http://libgen.is",      # Iceland (original)
        "http://libgen.rs",      # Serbia
        "http://libgen.st",      # Saint Helena
        "http://libgen.gs",      # South Georgia
    ],
    "cc_tlds": [
        "http://libgen.lc",      # Saint Lucia
        "http://libgen.bz",      # Belize
        "http://libgen.br",      # Brazil
        "http://libgen.il",      # Israel
        "http://libgen.sg",      # Singapore
        "http://libgen.in",      # India
        "http://libgen.mk",      # North Macedonia
        "http://libgen.vg",      # British Virgin Islands
        "http://libgen.me",      # Montenegro
        "http://libgen.tv",      # Tuvalu
        "http://libgen.io",      # British Indian Ocean Territory
        "http://libgen.co",      # Colombia
        "http://libgen.cc",      # Cocos Islands
        "http://libgen.to",      # Tonga
        "http://libgen.ws",      # Samoa
        "http://libgen.nu",      # Niue
        "http://libgen.sh",      # Saint Helena (alternate)
        "http://libgen.re",      # Reunion
    ],
    "generic_tlds": [
        "http://libgen.click",   # Generic TLD
        "http://libgen.today",   # Generic TLD
        "http://libgen.fun",     # Generic TLD
        "http://libgen.world",   # Generic TLD
        "http://libgen.tech",    # Generic TLD
        "http://libgen.top",     # Generic TLD
        "http://libgen.site",    # Generic TLD
        "http://libgen.online",  # Generic TLD
        "http://libgen.space",   # Generic TLD
        "http://libgen.zone",    # Generic TLD
    ],
    "backup": [
        "http://gen.lib.rus.ec", # Russian mirrors relay
    ],
}


def get_all_mirrors() -> List[str]:
    """Get all mirrors in recommended priority order"""
    return (
        LIBGEN_MIRRORS["primary"]
        + LIBGEN_MIRRORS["cc_tlds"]
        + LIBGEN_MIRRORS["generic_tlds"]
        + LIBGEN_MIRRORS["backup"]
    )


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
