#!/usr/bin/env python3
"""
Test LibGen mirrors using the actual libgen-api-enhanced library.
This is the REAL test - it searches for books on each mirror.
"""

from libgen_api_enhanced import LibgenSearch, SearchTopic
import time
from datetime import datetime

# Mirrors to test (TLD format - library will add https://libgen.)
MIRRORS_TO_TEST = [
    # Primary (documented)
    "li",      # Default - should work
    "bz",      # Documented alternative
    "gs",      # Documented alternative

    # Fallbacks (from docs as working)
    "rs",      # Serbia
    "st",      # Saint Helena
    "is",      # Iceland
    "lc",      # Saint Lucia
    "br",      # Brazil
    "vg",      # British Virgin Islands
    "io",      # British Indian Ocean Territory

    # Additional possibilities
    "il",      # Israel
    "sg",      # Singapore
    "in",      # India
    "me",      # Montenegro
    "click",   # Generic TLD
    "fun",     # Generic TLD
    "world",   # Generic TLD
]


def test_mirror(mirror_tld: str, query: str = "Dune", timeout: int = 15) -> dict:
    """
    Test a single mirror by searching for a book.
    Returns result with success status, count, and timing.
    """
    result = {
        "mirror": mirror_tld,
        "url": f"https://libgen.{mirror_tld}",
        "working": False,
        "results_count": 0,
        "response_time": 0,
        "error": None,
        "book_found": False,
    }

    start_time = time.time()

    try:
        # Create search with specified mirror
        s = LibgenSearch(mirror=mirror_tld)

        # Search for the book
        results = s.search_title(query, search_in=[SearchTopic.LIBGEN])

        elapsed = time.time() - start_time
        result["response_time"] = elapsed

        if results and len(results) > 0:
            result["working"] = True
            result["results_count"] = len(results)
            result["book_found"] = any(
                "Dune" in book.title.lower() for book in results
            )

            # Get first result details
            first_book = results[0]
            result["first_result"] = {
                "title": first_book.title,
                "author": first_book.author,
                "mirrors": first_book.mirrors[:2] if first_book.mirrors else [],
            }

            return result
        else:
            result["error"] = "No results returned"
            return result

    except ConnectionError as e:
        result["error"] = f"Connection error: {str(e)}"
        return result
    except TimeoutError as e:
        result["error"] = f"Timeout: {str(e)}"
        result["response_time"] = time.time() - start_time
        return result
    except Exception as e:
        result["error"] = f"{type(e).__name__}: {str(e)}"
        result["response_time"] = time.time() - start_time
        return result


def print_results(results: list):
    """Print formatted test results"""
    print("\n" + "=" * 100)
    print("LibGen Mirror Test Results (Using libgen-api-enhanced Library)")
    print("=" * 100)
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"Query: Dune")
    print(f"Total Mirrors Tested: {len(results)}\n")

    # Separate working and failed
    working = [r for r in results if r["working"]]
    failed = [r for r in results if not r["working"]]

    print(f"✓ WORKING MIRRORS: {len(working)}")
    print(f"✗ FAILED MIRRORS: {len(failed)}")
    print(f"Success Rate: {(len(working) / len(results) * 100):.1f}%\n")

    if working:
        print("=" * 100)
        print("✓ WORKING MIRRORS (Can search for books):")
        print("=" * 100)
        for r in sorted(working, key=lambda x: x["response_time"]):
            book_info = (
                f" | Found: {r['first_result']['title']}"
                if r.get("first_result")
                else ""
            )
            print(
                f"  ✓ {r['mirror']:<15} | {r['results_count']:>3} results | "
                f"{r['response_time']:.2f}s{book_info}"
            )

    if failed:
        print("\n" + "=" * 100)
        print("✗ FAILED MIRRORS:")
        print("=" * 100)
        for r in sorted(failed, key=lambda x: x["mirror"]):
            print(f"  ✗ {r['mirror']:<15} | {r['error']}")

    # Summary
    print("\n" + "=" * 100)
    print("RECOMMENDATIONS FOR DISCORD BOT:")
    print("=" * 100)

    if working:
        print("\nPrimary mirrors (fastest):")
        fastest = sorted(working, key=lambda x: x["response_time"])[:3]
        for r in fastest:
            print(f"  - {r['mirror']} ({r['response_time']:.2f}s)")

        print("\nFallback mirrors (for rotation):")
        for r in sorted(working, key=lambda x: x["response_time"])[3:]:
            print(f"  - {r['mirror']} ({r['response_time']:.2f}s)")

    print("\n" + "=" * 100)
    print("Update libgen_mirrors.py with these results!")
    print("=" * 100 + "\n")

    return working, failed


def main():
    """Run all mirror tests"""
    print("\n🔍 Testing LibGen mirrors with real searches...")
    print("This may take 2-3 minutes...\n")

    results = []
    for i, mirror in enumerate(MIRRORS_TO_TEST, 1):
        print(f"[{i}/{len(MIRRORS_TO_TEST)}] Testing {mirror:<15}", end=" ", flush=True)
        result = test_mirror(mirror)
        results.append(result)

        if result["working"]:
            print(f"✓ OK ({result['results_count']} results, {result['response_time']:.2f}s)")
        else:
            print(f"✗ FAILED ({result['error'][:40]})")

    # Print formatted results
    working, failed = print_results(results)

    # Save results to file for reference
    with open("mirror_test_results.txt", "w") as f:
        f.write("LibGen Mirror Test Results\n")
        f.write(f"Test Time: {datetime.now()}\n\n")
        f.write(f"Working Mirrors: {len(working)}\n")
        for r in working:
            f.write(f"  {r['mirror']}\n")
        f.write(f"\nFailed Mirrors: {len(failed)}\n")
        for r in failed:
            f.write(f"  {r['mirror']}: {r['error']}\n")

    print("Results saved to mirror_test_results.txt")


if __name__ == "__main__":
    main()
