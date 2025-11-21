#!/usr/bin/env python3
"""
Test all LibGen mirrors to see which ones are working
Searches for "Dune" book and checks if mirrors are accessible
"""

import asyncio
import aiohttp
from libgen_mirrors import LIBGEN_MIRRORS, get_all_mirrors
import sys


async def test_mirror_access(mirror: str, timeout: int = 5) -> dict:
    """Test if a mirror is accessible"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.head(mirror, timeout=aiohttp.ClientTimeout(total=timeout)) as response:
                return {
                    "mirror": mirror,
                    "status": "ok" if response.status == 200 else f"http_{response.status}",
                    "accessible": response.status == 200,
                }
    except asyncio.TimeoutError:
        return {"mirror": mirror, "status": "timeout", "accessible": False}
    except Exception as e:
        return {"mirror": mirror, "status": f"error: {type(e).__name__}", "accessible": False}


async def test_mirror_dune_search(mirror: str, timeout: int = 10) -> dict:
    """Test if we can search for Dune on a mirror"""
    try:
        search_url = f"{mirror}/search.php"
        params = {
            "req": "Dune",
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
                allow_redirects=True
            ) as response:
                if response.status == 200:
                    content = await response.text()
                    # Check if results page contains book entries
                    has_results = "Dune" in content or "table" in content.lower()
                    return {
                        "mirror": mirror,
                        "search_status": "ok" if has_results else "no_results",
                        "searchable": has_results,
                        "status_code": response.status,
                    }
                else:
                    return {
                        "mirror": mirror,
                        "search_status": f"http_{response.status}",
                        "searchable": False,
                        "status_code": response.status,
                    }
    except asyncio.TimeoutError:
        return {"mirror": mirror, "search_status": "timeout", "searchable": False}
    except Exception as e:
        return {
            "mirror": mirror,
            "search_status": f"error: {type(e).__name__}",
            "searchable": False
        }


async def test_all_mirrors_async(test_type: str = "access") -> dict:
    """Test all mirrors with specified test type"""
    mirrors = get_all_mirrors()
    print(f"\n🔍 Testing {len(mirrors)} mirrors ({test_type} test)...\n")

    if test_type == "search":
        tasks = [test_mirror_dune_search(m) for m in mirrors]
    else:
        tasks = [test_mirror_access(m) for m in mirrors]

    results = await asyncio.gather(*tasks)

    # Organize results
    working = [r for r in results if r.get("accessible") or r.get("searchable")]
    failed = [r for r in results if not (r.get("accessible") or r.get("searchable"))]

    return {
        "results": results,
        "working": working,
        "failed": failed,
        "total": len(mirrors),
        "working_count": len(working),
        "failed_count": len(failed),
        "success_rate": f"{(len(working) / len(mirrors) * 100):.1f}%" if mirrors else "0%",
    }


def print_results(data: dict, test_type: str = "access"):
    """Print formatted test results"""
    print("=" * 80)
    print(f"LibGen Mirror Test Results ({test_type.upper()})")
    print("=" * 80)

    print(f"\nTotal Mirrors: {data['total']}")
    print(f"Working: {data['working_count']} ✓")
    print(f"Failed: {data['failed_count']} ✗")
    print(f"Success Rate: {data['success_rate']}")

    if data["working"]:
        print(f"\n✓ WORKING MIRRORS ({len(data['working'])}):")
        print("-" * 80)
        for result in sorted(data["working"], key=lambda x: x["mirror"]):
            if test_type == "search":
                print(f"  {result['mirror']:<35} | {result['search_status']}")
            else:
                print(f"  {result['mirror']:<35} | {result['status']}")

    if data["failed"]:
        print(f"\n✗ FAILED MIRRORS ({len(data['failed'])}):")
        print("-" * 80)
        for result in sorted(data["failed"], key=lambda x: x["mirror"]):
            if test_type == "search":
                print(f"  {result['mirror']:<35} | {result['search_status']}")
            else:
                print(f"  {result['mirror']:<35} | {result['status']}")

    print("\n" + "=" * 80)

    # Print organized by category
    print("\nResults by Category:")
    print("-" * 80)

    for category_name, mirrors_list in [
        ("PRIMARY", LIBGEN_MIRRORS["primary"]),
        ("COUNTRY-CODE TLDs", LIBGEN_MIRRORS["cc_tlds"]),
        ("GENERIC TLDs", LIBGEN_MIRRORS["generic_tlds"]),
        ("BACKUP", LIBGEN_MIRRORS["backup"]),
    ]:
        working_in_cat = [r for r in data["working"] if r["mirror"] in mirrors_list]
        total_in_cat = len(mirrors_list)
        success = len(working_in_cat)

        status_icon = "✓" if success == total_in_cat else "⚠" if success > 0 else "✗"
        print(f"\n{status_icon} {category_name} ({success}/{total_in_cat}):")

        for mirror in mirrors_list:
            result = next((r for r in data["results"] if r["mirror"] == mirror), None)
            if result:
                is_working = result.get("accessible") or result.get("searchable")
                icon = "✓" if is_working else "✗"
                if test_type == "search":
                    status = result.get("search_status", "unknown")
                else:
                    status = result.get("status", "unknown")
                print(f"  {icon} {mirror:<35} | {status}")


async def main():
    """Main test function"""
    if len(sys.argv) > 1 and sys.argv[1] == "search":
        # Test with search
        results = await test_all_mirrors_async(test_type="search")
        print_results(results, test_type="search")
    else:
        # Default: test basic access
        results = await test_all_mirrors_async(test_type="access")
        print_results(results, test_type="access")

        # Then test search on working mirrors
        print("\n\n" + "=" * 80)
        print("Running search test on WORKING mirrors...")
        print("=" * 80)

        working_mirrors = [r["mirror"] for r in results["working"]]
        if working_mirrors:
            search_tasks = [test_mirror_dune_search(m) for m in working_mirrors]
            search_results = await asyncio.gather(*search_tasks)

            searchable = [r for r in search_results if r.get("searchable")]
            not_searchable = [r for r in search_results if not r.get("searchable")]

            print(f"\n✓ Searchable: {len(searchable)}/{len(working_mirrors)}")
            for result in searchable:
                print(f"  ✓ {result['mirror']}")

            if not_searchable:
                print(f"\n⚠ Not Searchable: {len(not_searchable)}/{len(working_mirrors)}")
                for result in not_searchable:
                    print(f"  ✗ {result['mirror']}")
        else:
            print("\n⚠ No accessible mirrors found!")


if __name__ == "__main__":
    asyncio.run(main())
