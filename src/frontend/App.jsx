import { useCallback, useEffect, useState } from "react";
import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import { Navbar } from "./components/Navbar";
import { ToastOverlay } from "./components/ToastOverlay";

import { SettingsModal } from "./components/SettingsModal";

// Pages
import { Home } from "./pages/Home";
import { MyLibrary } from "./pages/MyLibrary";

export default function App() {
  const [books, setBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [toast, setToast] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // Stats
  const libraryStats = calculateLibraryStats(books);

  // Toast helper
  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const clearToast = () => setToast(null);

  // Bootstrap
  useEffect(() => {
    async function bootstrap() {
      try {
        await initDB();

        // Check for cloud sync
        if (isCloudSyncEnabled()) {
          try {
            const snapshot = await pullCloudSnapshot();
            if (snapshot) {
              await applyRemoteSnapshot(snapshot);
              showToast("Synced with cloud!", "success");
            }
          } catch (err) {
            console.error("Sync failed:", err);
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
    <Router>
      <Layout>
        <Navbar onOpenSettings={() => setShowSettings(true)} />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                onSearch={handleSearch}
                searchResults={searchResults}
                searching={searching}
                searchError={searchError}
                onAddBook={handleAddBook}
              />
            }
          />
          <Route
            path="/library"
            element={
              <MyLibrary
                books={books}
                libraryStats={libraryStats}
                onEdit={handleEditBook}
                onDelete={handleDeleteBook}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {toast && (
          <ToastOverlay
            toast={toast}
            onDismiss={clearToast}
          />
        )}

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />
      </Layout>
    </Router>
  );
}
