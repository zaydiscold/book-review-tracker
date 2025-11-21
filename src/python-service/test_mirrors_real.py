#!/usr/bin/env python3
"""
Real mirror testing - searches for actual books and tests download links
Tests each mirror by:
1. Searching for "Dune"
2. Extracting MD5 hashes
3. Testing direct download links
"""

import asyncio
import aiohttp
from bs4 import BeautifulSoup
from libgen_mirrors import LIBGEN_MIRRORS
import re


async def search_mirror_for_book(mirror: str, book_query: str = "Dune", timeout: int = 10) -> dict:
    """Search a mirror for a book and try to get download link"""
    try:
        search_url = f"{mirror}/search.php"
        params = {
            "req": book_query,
            "lg_topic": "libgen",
            "open": "0",
            "view": "simple",
            "res": "25",
            "phrase": "1",
            "column": "def"
        }

        async with aiohttp.ClientSession() as session:
            async with session.get(
                search_url,
                params=params,
                timeout=aiohttp.ClientTimeout(total=timeout),
                allow_redirects=True,
                headers={"User-Agent": "Mozilla/5.0"}
            ) as response:
                if response.status != 200:
                    return {
                        "mirror": mirror,
                        "status": f"http_{response.status}",
                        "works": False,
                        "search_results": None,
                        "md5_found": None
                    }

                html = await response.text()

                # Look for book entries in the response
                has_table = "<table" in html.lower()
                has_dune = "dune" in html.lower()

                # Try to extract MD5 hash (book identifier)
                md5_match = re.search(r"md5=([a-f0-9]{32})", html, re.IGNORECASE)
                md5_found = md5_match.group(1) if md5_match else None

                if has_table or has_dune:
                    return {
                        "mirror": mirror,
                        "status": "ok",
                        "works": True,
                        "search_results": True,
                        "has_dune": has_dune,
                        "md5_found": md5_found,
                        "book_query": book_query
                    }
                else:
                    return {
                        "mirror": mirror,
                        "status": "no_results",
                        "works": False,
                        "search_results": False,
                        "md5_found": md5_found
                    }

    except asyncio.TimeoutError:
        return {"mirror": mirror, "status": "timeout", "works": False, "search_results": None}
    except Exception as e:
        return {
            "mirror": mirror,
            "status": f"error: {type(e).__name__}",
            "works": False,
            "search_results": None
        }


async def test_download_link(mirror: str, md5: str, timeout: int = 10) -> dict:
    """Test if a direct download link works"""
    if not md5:
        return {"mirror": mirror, "download_works": None, "status": "no_md5"}

    try:
        download_url = f"{mirror}/book/index.php?md5={md5.lower()}"

        async with aiohttp.ClientSession() as session:
            async with session.head(
                download_url,
                timeout=aiohttp.ClientTimeout(total=timeout),
                allow_redirects=True
            ) as response:
                return {
                    "mirror": mirror,
                    "download_url": download_url,
                    "download_works": response.status == 200,
                    "status_code": response.status
                }
    except Exception as e:
        return {
            "mirror": mirror,
            "download_works": False,
            "status": f"error: {type(e).__name__}"
        }


async def test_all_mirrors_real():
    """Test all mirrors with real book searches"""
    all_mirrors = (
        LIBGEN_MIRRORS["primary"]
        + LIBGEN_MIRRORS["cc_tlds"]
        + LIBGEN_MIRRORS["generic_tlds"]
        + LIBGEN_MIRRORS["backup"]
    )

    print("\n" + "=" * 90)
    print("REAL LibGen Mirror Test - Searching for Books")
    print("=" * 90)
    print(f"\nTesting {len(all_mirrors)} mirrors...")
    print("This will take a few minutes...\n")

    # Test searches
    search_tasks = [search_mirror_for_book(m, "Dune") for m in all_mirrors]
    search_results = await asyncio.gather(*search_tasks)

    # Separate results
    working = [r for r in search_results if r["works"]]
    failed = [r for r in search_results if not r["works"]]

    print("\n" + "=" * 90)
    print(f"RESULTS: {len(working)}/{len(all_mirrors)} mirrors working")
    print("=" * 90)

    # Print working mirrors
    if working:
        print("\n✓ WORKING MIRRORS - Can search for books:")
        print("-" * 90)
        for r in sorted(working, key=lambda x: x["mirror"]):
            md5_info = f" | MD5: {r['md5_found'][:8]}..." if r.get("md5_found") else ""
            print(f"  ✓ {r['mirror']:<40} | {r['status']}{md5_info}")

        # Test download links on working mirrors
        print("\n\nTesting download links on working mirrors...")
        download_tasks = [
            test_download_link(r["mirror"], r.get("md5_found"))
            for r in working
            if r.get("md5_found")
        ]
        download_results = await asyncio.gather(*download_tasks)

        downloadable = [r for r in download_results if r.get("download_works")]
        if downloadable:
            print(f"\n✓ MIRRORS WITH VALID DOWNLOAD LINKS ({len(downloadable)}):")
            print("-" * 90)
            for r in sorted(downloadable, key=lambda x: x["mirror"]):
                print(f"  ✓ {r['mirror']:<40} | Download: {r['download_url']}")

    # Print failed mirrors
    if failed:
        print(f"\n\n✗ FAILED MIRRORS ({len(failed)}):")
        print("-" * 90)
        for r in sorted(failed, key=lambda x: x["mirror"]):
            print(f"  ✗ {r['mirror']:<40} | {r['status']}")

    # Summary by category
    print("\n\n" + "=" * 90)
    print("Results by Category:")
    print("=" * 90)

    for category_name, mirrors_list in [
        ("PRIMARY", LIBGEN_MIRRORS["primary"]),
        ("COUNTRY-CODE TLDs", LIBGEN_MIRRORS["cc_tlds"]),
        ("GENERIC TLDs", LIBGEN_MIRRORS["generic_tlds"]),
        ("BACKUP", LIBGEN_MIRRORS["backup"]),
    ]:
        working_in_cat = [r for r in working if r["mirror"] in mirrors_list]
        total_in_cat = len(mirrors_list)

        status_icon = "✓" if len(working_in_cat) == total_in_cat else "⚠" if len(working_in_cat) > 0 else "✗"
        print(f"\n{status_icon} {category_name} ({len(working_in_cat)}/{total_in_cat}):")

        for mirror in mirrors_list:
            result = next((r for r in search_results if r["mirror"] == mirror), None)
            if result:
                icon = "✓" if result["works"] else "✗"
                print(f"  {icon} {mirror:<45} | {result['status']}")

    print("\n" + "=" * 90)
    print("Copy working mirrors to WORKING_MIRRORS.md and update libgen_mirrors.py")
    print("=" * 90 + "\n")

    return {
        "total": len(all_mirrors),
        "working": working,
        "failed": failed,
        "success_rate": f"{(len(working) / len(all_mirrors) * 100):.1f}%"
    }


if __name__ == "__main__":
    print("\n⚠️  This script requires BeautifulSoup4")
    print("Install with: pip install beautifulsoup4")
    print("\nRunning mirror test...\n")

    asyncio.run(test_all_mirrors_real())
