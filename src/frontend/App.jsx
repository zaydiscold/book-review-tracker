import { useCallback, useEffect, useMemo, useState } from "react";
import {
  initDB,
  addBook,
  getBooks,
  deleteBook,
  applyRemoteSnapshot
} from "../data/db";
import { isCloudSyncEnabled, pullCloudSnapshot } from "../data/cloudSync";
import {
  searchLibgen,
  calculateLibraryStats
} from "../data/libgen";

// Import new Cozy components
import { Layout } from "./components/Layout";
import { HeroSection } from "./components/HeroSection";
import { BookGrid } from "./components/BookGrid";
import { ToastOverlay } from "./components/ToastOverlay";
import { LibGenWidget } from "./components/LibGenWidget";

export default function App() {
  const [books, setBooks] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Calculate library statistics
  const libraryStats = useMemo(() => calculateLibraryStats(books), [books]);

  const showToast = useCallback((text, tone = "info") => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  // Bootstrap data
  useEffect(() => {
    async function bootstrap() {
      try {
        await initDB();

        if (isCloudSyncEnabled()) {
          try {
            const snapshot = await pullCloudSnapshot();
            if (snapshot.status === "ok") {
              await applyRemoteSnapshot(snapshot);
            }
          } catch (cloudError) {
            console.warn("Failed to sync remote snapshot", cloudError);
            showToast("Cloud sync unavailable. Using local data only.", "warning");
          }
        }

        await refreshData();
      } catch (error) {
        console.error("Failed to init IndexedDB", error);
        showToast("IndexedDB unavailable. Data will not persist.", "warning");
      }
    }

    bootstrap();
  }, [showToast]);

  async function refreshData() {
    const bookList = await getBooks();
    setBooks(bookList);
  }

  // Handlers
  const handleSearch = async (query) => {
    setSearching(true);
    setSearchError("");
    try {
      // Use the new LibGen search
      const results = await searchLibgen(query);
      setSearchResults(results);

      // Also scroll to results
      window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
    } catch (err) {
      setSearchError("Failed to search. Please try again.");
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleAddBook = async (bookData) => {
    try {
      await addBook({
        ...bookData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await refreshData();
      showToast("Book added to library!", "success");
      setSearchResults([]); // Clear search results
    } catch (err) {
      console.error(err);
      showToast("Failed to add book", "error");
    }
  };

  const handleEditBook = (book) => {
    showToast(`Edit coming soon for "${book.title}"`, "info");
  };

  const handleDeleteBook = async (book) => {
    if (window.confirm(`Are you sure you want to delete "${book.title}"?`)) {
      try {
        await deleteBook(book.id);
        await refreshData();
        showToast("Book deleted", "info");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete book", "error");
      }
    }
  };

  return (
    <Layout>
      <HeroSection onSearch={handleSearch} />

      {/* Search Results Section */}
      {searching && (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-sage-500">Searching the archives...</p>
        </div>
      )}

      {searchError && (
        <div className="mb-10 mx-4 md:mx-0 rounded-2xl border border-rose-200 bg-rose-50/70 px-4 py-3 text-rose-700 shadow-soft animate-slide-up">
          {searchError}
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mb-16 animate-fade-in">
          <h3 className="text-2xl font-serif font-bold text-sage-700 mb-6 px-4">Search Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result) => (
              <div key={result.md5} className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100 flex flex-col">
                <h4 className="font-bold text-lg text-sage-800 mb-2">{result.title}</h4>
                <p className="text-sage-500 mb-4">{result.author}</p>
                <div className="mt-auto flex gap-3">
                  <button
                    onClick={() => handleAddBook({ ...result, status: 'wishlist' })}
                    className="flex-1 bg-rose-100 text-rose-600 py-2 rounded-full font-medium hover:bg-rose-200 transition-colors"
                  >
                    Add to Wishlist
                  </button>
                  <button
                    onClick={() => handleAddBook({ ...result, status: 'reading' })}
                    className="flex-1 bg-sage-100 text-sage-600 py-2 rounded-full font-medium hover:bg-sage-200 transition-colors"
                  >
                    Start Reading
                  </button>
                </div>
                {/* LibGen Widget for direct downloads */}
                <div className="mt-4 pt-4 border-t border-stone-100">
                  <LibGenWidget book={{ libgenMetadata: result.libgenMetadata }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Library Grid */}
      <div className="mb-8 flex items-center justify-between px-4">
        <h3 className="text-2xl font-serif font-bold text-sage-700">Your Library</h3>
        <div className="text-sm text-sage-400 font-medium">
          {books.length} books • {libraryStats.totalSize}
        </div>
      </div>

      <BookGrid
        books={books}
        onEdit={handleEditBook}
        onDelete={handleDeleteBook}
      />

      {toast && (
        <ToastOverlay
          toast={toast}
          onDismiss={clearToast}
        />
      )}
    </Layout>
  );
}
