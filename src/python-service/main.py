from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict
from libgen_api_enhanced import LibgenSearch, SearchTopic
import uvicorn
from libgen_mirrors import (
    get_all_mirrors,
    get_recommended_mirrors,
    get_mirror_stats,
    test_all_mirrors,
    get_fastest_mirror,
    get_book_mirror_urls,
    get_primary_mirror,
)
import asyncio

app = FastAPI()

class SearchRequest(BaseModel):
    query: str
    search_type: str = "title" # title, author, default
    topics: List[str] = ["libgen"] # libgen, fiction, etc.

class BookResult(BaseModel):
    id: str
    title: str
    author: str
    publisher: Optional[str] = ""
    year: Optional[str] = ""
    language: Optional[str] = ""
    pages: Optional[str] = ""
    size: Optional[str] = ""
    extension: Optional[str] = ""
    md5: Optional[str] = ""
    mirrors: List[str] = []
    tor_download_link: Optional[str] = ""
    # We don't include resolved_download_link here as it requires an extra call

class ResolveRequest(BaseModel):
    book_data: dict # Pass the full book data back to reconstruct/resolve

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/search")
def search_books(req: SearchRequest):
    s = LibgenSearch()
    
    # Map string topics to SearchTopic enum
    topic_map = {
        "libgen": SearchTopic.LIBGEN,
        "fiction": SearchTopic.FICTION,
        "comics": SearchTopic.COMICS,
        "articles": SearchTopic.ARTICLES,
        "magazines": SearchTopic.MAGAZINES,
        "fiction_rus": SearchTopic.FICTION_RUS,
        "standards": SearchTopic.STANDARDS
    }
    
    selected_topics = [topic_map.get(t.lower(), SearchTopic.LIBGEN) for t in req.topics]
    
    try:
        if req.search_type == "title":
            results = s.search_title(req.query, search_in=selected_topics)
        elif req.search_type == "author":
            results = s.search_author(req.query, search_in=selected_topics)
        else:
            results = s.search_default(req.query, search_in=selected_topics)
            
        # Convert Book objects to dicts
        # The library returns Book objects, we need to serialize them
        serialized_results = []
        for book in results:
            # Assuming Book object has __dict__ or similar, but let's be safe and map fields
            # Based on user provided output format
            serialized_results.append({
                "id": getattr(book, "id", ""),
                "title": getattr(book, "title", ""),
                "author": getattr(book, "author", ""),
                "publisher": getattr(book, "publisher", ""),
                "year": getattr(book, "year", ""),
                "language": getattr(book, "language", ""),
                "pages": getattr(book, "pages", ""),
                "size": getattr(book, "size", ""),
                "extension": getattr(book, "extension", ""),
                "md5": getattr(book, "md5", ""),
                "mirrors": getattr(book, "mirrors", []),
                "tor_download_link": getattr(book, "tor_download_link", ""),
            })
            
        return {"results": serialized_results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/resolve")
def resolve_download(req: ResolveRequest):
    # To resolve, we might need to reconstruct the Book object or just use the mirror link
    # The library's resolve_direct_download_link method is on the Book instance.
    # Let's try to instantiate a Book object with the data.
    # We need to import Book from libgen_api_enhanced.libgen_search (or wherever it is)
    # Let's check where Book is defined. It's likely available.

    try:
        # Dynamic import or just using the class if available
        from libgen_api_enhanced import Book

        book = Book(**req.book_data)
        book.resolve_direct_download_link()

        return {"download_link": book.resolved_download_link}
    except Exception as e:
        # Fallback: if we can't instantiate Book easily, we might need to inspect the library code
        # But assuming the library is well structured
        raise HTTPException(status_code=500, detail=str(e))

# ===== MIRROR MANAGEMENT ENDPOINTS =====

@app.get("/mirrors/all")
def get_mirrors():
    """Get all available LibGen mirrors"""
    return {
        "mirrors": get_all_mirrors(),
        "stats": get_mirror_stats(),
    }

@app.get("/mirrors/recommended")
def get_recommended():
    """Get recommended/working mirrors for fallback use"""
    return {
        "mirrors": get_recommended_mirrors(),
        "count": len(get_recommended_mirrors()),
        "note": "These mirrors are known to be reliably working"
    }

@app.get("/mirrors/stats")
def get_mirrors_statistics():
    """Get mirror statistics"""
    return {
        "stats": get_mirror_stats(),
        "total_mirrors": len(get_all_mirrors()),
    }

@app.get("/mirrors/primary")
def get_primary():
    """Get the primary/default mirror"""
    return {
        "mirror": get_primary_mirror(),
    }

@app.get("/mirrors/book/{md5}")
def get_book_mirrors(md5: str, limit: int = 5):
    """Get all available mirrors with a book's direct links"""
    if not md5:
        raise HTTPException(status_code=400, detail="MD5 hash is required")

    result = get_book_mirror_urls(md5, limit)
    return result

@app.post("/mirrors/test")
async def test_mirrors():
    """Test which mirrors are currently accessible"""
    try:
        result = await test_all_mirrors(timeout=3)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/mirrors/fastest")
async def get_fastest():
    """Find the fastest responding mirror"""
    try:
        fastest = await get_fastest_mirror(timeout=3)
        if fastest:
            return {"mirror": fastest, "status": "ok"}
        else:
            return {
                "mirror": get_primary_mirror(),
                "status": "fallback",
                "message": "All mirrors failed, using primary fallback"
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)
