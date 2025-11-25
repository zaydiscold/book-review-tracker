import { useCallback, useEffect, useMemo, useState } from "react";
import {
  initDB,
  addBook,
  getBooks,
  deleteBook,
  applyRemoteSnapshot
} from "../data/db";
import { isCloudSyncEnabled, pullCloudSnapshot, checkSupabaseConnection } from "../data/cloudSync";
import { calculateLibraryStats } from "../data/libgen";
import { searchOpenLibrary } from "../data/openLibrary";

// Import new Cozy components
import { Layout } from "./components/Layout";
import { HeroSection } from "./components/HeroSection";
import { BookGrid } from "./components/BookGrid";
import { ToastOverlay } from "./components/ToastOverlay";
import { StatsView } from "./components/StatsView";
import { LibGenView } from "./components/LibGenView";
import { ensureCover, getCoverUrl } from "./utils/covers";

export default function App() {
  const [cloudStatus, setCloudStatus] = useState(() => ({
    enabled: isCloudSyncEnabled(),
    status: isCloudSyncEnabled() ? "checking" : "disabled",
    message: ""
  }));
  const [books, setBooks] = useState([]);
  const [toast, setToast] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [currentView, setCurrentView] = useState("home"); // home, readlist, stats, libgen

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

        if (cloudStatus.enabled) {
          setCloudStatus((prev) => ({ ...prev, status: "checking", message: "" }));

          const probe = await checkSupabaseConnection();
          if (probe.status !== "online") {
            setCloudStatus({
              enabled: true,
              status: "offline",
              message: probe.message ?? "Supabase not reachable"
            });
            showToast("Supabase offline, using local data only.", "warning");
          } else {
            try {
              const snapshot = await pullCloudSnapshot();
              if (snapshot.status === "ok") {
                const result = await applyRemoteSnapshot(snapshot);
                setCloudStatus({
                  enabled: true,
                  status: "online",
                  message: `Synced ${result.books} books${result.reviews ? `, ${result.reviews} reviews` : ""}`
                });
              } else {
                setCloudStatus({
                  enabled: true,
                  status: "offline",
                  message: "Supabase snapshot unavailable"
                });
                showToast("Supabase offline, using local data only.", "warning");
              }
            } catch (cloudError) {
              console.warn("Failed to sync remote snapshot", cloudError);
              setCloudStatus({
                enabled: true,
                status: "offline",
                message: cloudError?.message ?? "Supabase sync failed"
              });
              showToast("Supabase offline, using local data only.", "warning");
            }
          }
        }

        await refreshData();
        console.info("[app] Loaded books from local store:", (await getBooks())?.length ?? 0);
      } catch (error) {
        console.error("Failed to init IndexedDB", error);
        showToast("IndexedDB unavailable. Data will not persist.", "warning");
      }
    }

    bootstrap();
  }, [showToast, cloudStatus.enabled]);

  async function refreshData() {
    const bookList = await getBooks();
    setBooks(bookList);
  }

  // Handlers
  const handleSearch = async (query) => {
    setSearching(true);
    setSearchError("");
    try {
      const results = await searchOpenLibrary(query, { limit: 30 });
      setSearchResults(results);
    } catch (err) {
      setSearchError("Failed to search Open Library. Please try again.");
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
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      cloudStatus={cloudStatus}
    >
      {currentView === 'home' && <HeroSection onSearch={handleSearch} />}

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

      {currentView === 'home' && searchResults.length > 0 && (
        <div className="mb-16 animate-fade-in">
          <div className="px-4 mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-2xl font-serif font-bold text-sage-700">Search Results</h3>
            <div className="flex items-center gap-3 text-sm text-sage-500">
              <span>If you want a copy check out LibGen page</span>
              <button
                onClick={() => setCurrentView('libgen')}
                className="inline-flex items-center gap-2 rounded-full bg-rose-100 text-rose-700 px-4 py-2 font-medium hover:bg-rose-200 transition-colors"
              >
                Go to LibGen
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.map((result, idx) => (
              <div
                key={result.key || result.md5 || idx}
                className="bg-white p-6 rounded-3xl shadow-soft border border-stone-100 flex flex-col"
              >
                <div className="relative mb-4 overflow-hidden rounded-2xl aspect-[3/4] bg-stone-100">
                  {getCoverUrl(ensureCover(result), 'L') ? (
                    <img
                      src={getCoverUrl(ensureCover(result), 'L')}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sage-300 text-sm">No cover</div>
                  )}
                </div>
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
                {result.openLibraryUrl && (
                  <div className="mt-4 pt-4 border-t border-stone-100 text-sm">
                    <a
                      className="text-rose-600 hover:text-rose-700 font-medium"
                      href={result.openLibraryUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Open Library
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Area based on View */}
      {currentView === 'stats' && <StatsView stats={libraryStats} />}

      {currentView === 'libgen' && <LibGenView onAddBook={handleAddBook} />}

      {currentView === 'readlist' && (
        <>
          <div className="mb-8 flex items-center justify-between px-4">
            <h3 className="text-2xl font-serif font-bold text-sage-700">Your Read List</h3>
            <div className="text-sm text-sage-400 font-medium">
              {books.length} books
            </div>
          </div>

          <BookGrid
            books={books}
            onEdit={handleEditBook}
            onDelete={handleDeleteBook}
            emptyMessage={{
              title: "Your read list is empty",
              description: "Start searching for books on the Home page to add them here."
            }}
          />
        </>
      )}

      {toast && (
        <ToastOverlay
          toast={toast}
          onDismiss={clearToast}
        />
      )}
    </Layout>
  );
}
