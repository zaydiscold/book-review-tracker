import { useCallback, useEffect, useMemo, useState } from "react";
import {
  initDB,
  addBook,
  updateBook,
  getBooks,
  deleteBook,
  applyRemoteSnapshot
} from "../data/db";
import { isCloudSyncEnabled, pullCloudSnapshot, checkSupabaseConnection } from "../data/cloudSync";
import { calculateLibraryStats } from "../data/libgen";
import { searchOpenLibrary } from "../data/openLibrary";

// Import new Cozy components
import { ExternalLink, BookOpen } from "lucide-react";
import { Layout } from "./components/Layout";
import { HeroSection } from "./components/HeroSection";
import { BookGrid } from "./components/BookGrid";
import { ToastOverlay } from "./components/ToastOverlay";
import { StatsView } from "./components/StatsView";
import { LibGenView } from "./components/LibGenView";
import { ensureCover, getCoverUrl } from "./utils/covers";
import { AddBookModal } from "./components/AddBookModal";

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
  const [showAddModal, setShowAddModal] = useState(false);

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

  const handleRefreshCovers = async () => {
    const missing = books.filter((b) => !ensureCover(b));
    if (missing.length === 0) {
      showToast("All books already have covers", "info");
      return;
    }

    const updated = [];
    for (const book of missing) {
      const query = [book.title, book.author].filter(Boolean).join(" ");
      if (!query) continue;

      try {
        const [ol] = await searchOpenLibrary(query, { limit: 1 });
        if (!ol) continue;
        const cover = ensureCover(ol);
        if (!cover) continue;

        await updateBook({
          id: book.id,
          cover,
          openLibraryUrl: ol.openLibraryUrl ?? book.openLibraryUrl,
          openLibraryIdentifiers: ol.identifiers ?? book.openLibraryIdentifiers
        });
        updated.push(book.id);
      } catch (err) {
        console.warn("Cover refresh failed for", book.id, err);
      }
    }

    if (updated.length > 0) {
      await refreshData();
      showToast(`Updated covers for ${updated.length} book(s)`, "success");
    } else {
      showToast("No new covers found", "info");
    }
  };

  return (
    <Layout
      currentView={currentView}
      onNavigate={setCurrentView}
      cloudStatus={cloudStatus}
      onAddBook={() => setShowAddModal(true)}
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {searchResults.map((result, idx) => (
              <div
                key={result.key || result.md5 || idx}
                className="bg-white p-3 rounded-2xl shadow-sm border border-stone-100 flex flex-col h-full hover:shadow-md transition-shadow"
              >
                <div className="relative mb-3 overflow-hidden rounded-xl aspect-[3/4] bg-stone-100 group">
                  {getCoverUrl(ensureCover(result), 'L') ? (
                    <img
                      src={getCoverUrl(ensureCover(result), 'L')}
                      alt={result.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sage-300 bg-stone-50">
                      <BookOpen className="w-8 h-8 animate-spin opacity-50" />
                    </div>
                  )}

                  {/* Availability Badge */}
                  {result.availability?.isReadAvailable && (
                    <div className="absolute top-2 right-2 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                      READ ONLINE
                    </div>
                  )}
                </div>

                <div className="flex-1 min-h-0 flex flex-col">
                  <h4 className="font-bold text-base text-sage-800 mb-1 line-clamp-2 leading-tight" title={result.title}>
                    {result.title}
                  </h4>
                  <p className="text-xs text-sage-500 mb-0.5 line-clamp-1">{result.author}</p>
                  {result.year && (
                    <p className="text-[10px] text-sage-400 font-medium mb-3">{result.year}</p>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleAddBook({ ...result, status: 'wishlist' })}
                    className="flex-1 bg-rose-50 text-rose-600 border border-rose-100 py-1.5 rounded-lg font-medium text-xs hover:bg-rose-100 transition-colors"
                  >
                    Wishlist
                  </button>
                  <button
                    onClick={() => handleAddBook({ ...result, status: 'reading' })}
                    className="flex-1 bg-sage-50 text-sage-700 border border-sage-200 py-1.5 rounded-lg font-medium text-xs hover:bg-sage-100 transition-colors"
                  >
                    Read
                  </button>
                </div>

                {result.openLibraryUrl && (
                  <div className="mt-3 pt-2 border-t border-stone-50 text-center">
                    <a
                      className="text-[10px] text-stone-400 hover:text-rose-500 font-medium transition-colors flex items-center justify-center gap-1"
                      href={result.openLibraryUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View on Open Library
                      <ExternalLink className="w-3 h-3" />
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
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshCovers}
                className="text-xs px-3 py-2 rounded-full border border-stone-200 text-sage-600 hover:border-rose-200 hover:text-rose-600 transition-colors"
              >
                Refresh covers
              </button>
              <div className="text-sm text-sage-400 font-medium">
                {books.length} books
              </div>
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

      <AddBookModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={(book) => {
          handleAddBook(book);
          setShowAddModal(false);
        }}
      />
    </Layout>
  );
}
