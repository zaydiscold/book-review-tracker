import { useCallback, useEffect, useMemo, useState } from "react";
import {
  initDB,
  addBook,
  updateBook,
  getBooks,
  getReviews,
  saveReview,
  deleteReviewByBookId,
  deleteReviewById,
  deleteBook,
  applyRemoteSnapshot
} from "../data/db";
import { postReviewToDiscord } from "../utils/discord";
import { downloadLibraryJson } from "../utils/export";
import { searchOpenLibrary } from "../data/openLibrary";
import {
  searchLibgen,
  searchByTitleAndAuthor,
  getLibGenMirrorUrl,
  getNextLibGenResult,
  batchSearchBooks,
  calculateLibraryStats
} from "../data/libgen";
import { getCoverUrl, hasCover } from "../utils/covers";
import { isCloudSyncEnabled, pullCloudSnapshot } from "../data/cloudSync";

/**
 * === MODULAR ARCHITECTURE ===
 * This file has been refactored to use a modular structure:
 * - constants/: Theme, book statuses, availability, defaults
 * - utils/: Ratings, formatting, book matching utilities
 * - components/: Logo, Toast, StarRating, LibGen widgets
 * - styles/: Centralized style definitions
 */

// Import constants
import {
  THEME,
  STAR_SYMBOL,
  STAR_COUNT,
  PST_TIME_ZONE,
  DEFAULT_STATUS,
  DISCORD_STORAGE_KEY,
  DISCORD_SHARE_MODE_KEY
} from "./constants/theme";
import {
  BOOK_STATUS_SECTIONS,
  REVIEW_DISABLED_STATUSES,
  STATUS_LABELS,
  isUnreadStatus
} from "./constants/bookStatus";
import {
  describeAvailability,
  buildAvailabilityActions,
  shouldShowOpenLibraryLink
} from "./constants/availability";
import {
  emptyBookForm,
  emptyReviewForm,
  emptyReviewDraft,
  createReviewDraft
} from "./constants/defaults";

// Import utilities
import {
  toFiveScale,
  fromFiveScale,
  formatFiveScaleDisplay
} from "./utils/ratings";
import { formatTimestampForDisplay, normalizeForMatch } from "./utils/formatting";
import { autoPopulateCoverIfNeeded, applyBookUpdateToList } from "./utils/bookMatching";

// Import components
import {
  Logo,
  ToastOverlay,
  StarRatingInput,
  renderStarRating,
  LibGenWidget,
  LibGenAnalyticsDashboard,
  Layout,
  HeroSection,
  BookGrid,
  BookCard
} from "./components";

// Import styles
import { styles } from "./styles/appStyles";

const SAMPLE_LIBRARY = [
  {
    book: {
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      status: "reading",
      cover: { type: "id", value: "10521270" },
      openLibraryUrl: "https://openlibrary.org/works/OL82563W",
      openLibraryIdentifiers: {
        id: "10521270",
        isbn: ["9780747532699", "0747532699"],
        olid: ["OL22856696M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "borrow_available",
        isReadAvailable: false,
        isBorrowAvailable: true,
        previewUrl: "https://openlibrary.org/works/OL82563W",
        borrowUrl: "https://openlibrary.org/books/OL22856696M",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL82563W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL22856696M",
        hasDownload: false,
        identifier: null,
        identifierType: null
      }
    }
  },
  {
    book: {
      title: "Dune",
      author: "Frank Herbert",
      status: "re-reading",
      cover: { type: "id", value: "11481354" },
      openLibraryUrl: "https://openlibrary.org/works/OL893415W",
      openLibraryIdentifiers: {
        id: "11481354",
        isbn: ["9780441172719", "0441172717"],
        olid: ["OL32848840M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "borrow_available",
        isReadAvailable: false,
        isBorrowAvailable: true,
        previewUrl: "https://openlibrary.org/works/OL893415W",
        borrowUrl: "https://openlibrary.org/books/OL32848840M",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL893415W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL32848840M",
        hasDownload: false,
        identifier: null,
        identifierType: null
      }
    },
    review: {
      rating: 9.2,
      text: "Second journey through Arrakis still hits hard—annotated politics and spice routes all over the margins."
    }
  },
  {
    book: {
      title: "The Lord of the Rings",
      author: "J.R.R. Tolkien",
      status: "finished",
      cover: { type: "id", value: "14625765" },
      openLibraryUrl: "https://openlibrary.org/works/OL27448W",
      openLibraryIdentifiers: {
        id: "14625765",
        isbn: ["9780618640157", "0618640150"],
        olid: ["OL51694024M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "borrow_available",
        isReadAvailable: false,
        isBorrowAvailable: true,
        previewUrl: "https://openlibrary.org/works/OL27448W",
        borrowUrl: "https://openlibrary.org/books/OL51694024M",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL27448W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL51694024M",
        hasDownload: false,
        identifier: null,
        identifierType: null
      }
    },
    review: {
      rating: 9.8,
      text: "Extended-edition weekends paid off—every chapter still feels like the gold standard for epic fantasy."
    }
  },
  {
    book: {
      title: "Nineteen Eighty-Four",
      author: "George Orwell",
      status: "did-not-finish",
      cover: { type: "id", value: "9267242" },
      openLibraryUrl: "https://openlibrary.org/works/OL1168083W",
      openLibraryIdentifiers: {
        id: "9267242",
        isbn: ["9780451524935", "0451524934"],
        olid: ["OL21733390M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "borrow_available",
        isReadAvailable: false,
        isBorrowAvailable: true,
        previewUrl: "https://openlibrary.org/works/OL1168083W",
        borrowUrl: "https://openlibrary.org/books/OL21733390M",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL1168083W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL21733390M",
        hasDownload: false,
        identifier: null,
        identifierType: null
      }
    },
    review: {
      rating: 6,
      text: "Dystopian dread overload this pass—tapped out at Room 101 and logged it as a pause point."
    }
  },
  {
    book: {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      status: "library",
      cover: { type: "id", value: "12606502" },
      openLibraryUrl: "https://openlibrary.org/works/OL3140822W",
      openLibraryIdentifiers: {
        id: "12606502",
        isbn: ["9780061120084", "0061120081"],
        olid: ["OL37027359M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "borrow_available",
        isReadAvailable: false,
        isBorrowAvailable: true,
        previewUrl: "https://openlibrary.org/works/OL3140822W",
        borrowUrl: "https://openlibrary.org/books/OL37027359M",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL3140822W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL37027359M",
        hasDownload: false,
        identifier: null,
        identifierType: null
      }
    }
  },
  {
    book: {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      status: "wishlist",
      cover: null,
      openLibraryUrl: "https://openlibrary.org/works/OL66554W",
      openLibraryIdentifiers: {
        id: "14348537",
        isbn: ["9780141040349", "0141040343"],
        olid: ["OL47044678M"],
        lccn: [],
        oclc: []
      },
      availability: null
    }
  },
  {
    book: {
      title: "Moby Dick",
      author: "Herman Melville",
      status: "on-hold",
      cover: { type: "id", value: "10544254" },
      openLibraryUrl: "https://openlibrary.org/works/OL102749W",
      openLibraryIdentifiers: {
        id: "10544254",
        isbn: ["9780142437247", "0142437247"],
        olid: ["OL31857229M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "open",
        isReadAvailable: true,
        isBorrowAvailable: false,
        previewUrl: "https://openlibrary.org/works/OL102749W",
        borrowUrl: "https://openlibrary.org/works/OL102749W",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL102749W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL31857229M",
        hasDownload: true,
        identifier: null,
        identifierType: null
      }
    }
  },
  {
    book: {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      status: "finished",
      cover: { type: "id", value: "10590366" },
      openLibraryUrl: "https://openlibrary.org/works/OL468431W",
      openLibraryIdentifiers: {
        id: "10590366",
        isbn: ["9780743273565", "0743273567"],
        olid: ["OL22570129M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "borrow_available",
        isReadAvailable: false,
        isBorrowAvailable: true,
        previewUrl: "https://openlibrary.org/works/OL468431W",
        borrowUrl: "https://openlibrary.org/books/OL22570129M",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL468431W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL22570129M",
        hasDownload: false,
        identifier: null,
        identifierType: null
      }
    },
    review: {
      rating: 8.4,
      text: "Jazz-age melancholy logged with a fresh read—Daisy notes and highlighted symbolism everywhere."
    }
  },
  {
    book: {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      status: "reading",
      cover: { type: "id", value: "9273490" },
      openLibraryUrl: "https://openlibrary.org/works/OL3335245W",
      openLibraryIdentifiers: {
        id: "9273490",
        isbn: ["9780316769488", "0316769487"],
        olid: ["OL6089177M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "borrow_available",
        isReadAvailable: false,
        isBorrowAvailable: true,
        previewUrl: "https://openlibrary.org/works/OL3335245W",
        borrowUrl: "https://openlibrary.org/books/OL6089177M",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL3335245W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL6089177M",
        hasDownload: false,
        identifier: null,
        identifierType: null
      }
    }
  },
  {
    book: {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      status: "finished",
      cover: { type: "id", value: "14627509" },
      openLibraryUrl: "https://openlibrary.org/works/OL27482W",
      openLibraryIdentifiers: {
        id: "14627509",
        isbn: ["9780547928227", "054792822X"],
        olid: ["OL51711263M"],
        lccn: [],
        oclc: []
      },
      availability: {
        status: "borrow_available",
        isReadAvailable: false,
        isBorrowAvailable: true,
        previewUrl: "https://openlibrary.org/works/OL27482W",
        borrowUrl: "https://openlibrary.org/books/OL51711263M",
        openLibraryWorkUrl: "https://openlibrary.org/works/OL27482W",
        openLibraryEditionUrl: "https://openlibrary.org/books/OL51711263M",
        hasDownload: false,
        identifier: null,
        identifierType: null
      }
    },
    review: {
      rating: 8.8,
      text: "Comfort re-read logged with tea stains on the map foldout—perfect warm-up before another LOTR marathon."
    }
  }
];

/**
 * Future library tools - placeholder for upcoming features
 * These will be gradually implemented in future iterations
 */
const FUTURE_LIBRARY_TOOLS = [
  { label: "Bulk Import (Coming Soon)" },
  { label: "Sync with eReader" },
  {
    label: "Photo Stack Capture",
    helper: "Snap a stack, auto-match via Open Library"
  },
  { label: "Shelf Snapshot PDF" },
  { label: "Reading Stats Dashboard" }
];

async function mergeSampleLibrary() {
  const existing = await getBooks();
  const existingByKey = new Map();

  existing.forEach((book) => {
    const key =
      (book.openLibraryUrl ? book.openLibraryUrl.toLowerCase() : null) ??
      (book.title ? book.title.toLowerCase() : null);
    if (key) {
      existingByKey.set(key, book);
    }
  });

  const now = Date.now();

  for (let index = 0; index < SAMPLE_LIBRARY.length; index += 1) {
    const entry = SAMPLE_LIBRARY[index];
    const baseKey =
      (entry.book.openLibraryUrl ? entry.book.openLibraryUrl.toLowerCase() : null) ??
      entry.book.title.toLowerCase();
    const timestamp = new Date(now - index * 60000).toISOString();
    const authorLower = entry.book.author ? entry.book.author.toLowerCase() : null;
    const bookPayload = {
      ...entry.book,
      cover: entry.book.cover ? { ...entry.book.cover } : null,
      openLibraryIdentifiers: entry.book.openLibraryIdentifiers
        ? { ...entry.book.openLibraryIdentifiers }
        : null,
      availability: entry.book.availability ? { ...entry.book.availability } : null,
      titleLower: entry.book.title.toLowerCase(),
      authorLower,
      updatedAt: timestamp
    };

    const existingBook = baseKey ? existingByKey.get(baseKey) : null;
    let bookId;

    if (existingBook) {
      const mergedBook = {
        ...existingBook,
        ...bookPayload,
        id: existingBook.id,
        createdAt: existingBook.createdAt ?? timestamp
      };
      await updateBook(mergedBook);
      existingByKey.set(baseKey, mergedBook);
      bookId = mergedBook.id;
    } else {
      const createdAt = timestamp;
      const bookWithTimestamps = {
        ...bookPayload,
        createdAt
      };
      bookId = await addBook(bookWithTimestamps);
      if (baseKey) {
        existingByKey.set(baseKey, { ...bookWithTimestamps, id: bookId });
      }
    }

    if (entry.review && bookId) {
      const reviewStatus = entry.review.status ?? entry.book.status ?? DEFAULT_STATUS;
      await saveReview({
        bookId,
        rating: entry.review.rating,
        text: entry.review.text,
        status: reviewStatus,
        unread: isUnreadStatus(reviewStatus)
      });
    }
  }
}
export default function App() {
  const [initialized, setInitialized] = useState(false);
  const [books, setBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [bookForm, setBookForm] = useState(() => ({ ...emptyBookForm }));
  const [toast, setToast] = useState(null);
  const [discordWebhook, setDiscordWebhook] = useState("");
  const [editingBookFormId, setEditingBookFormId] = useState(null);
  const [editingBookOriginal, setEditingBookOriginal] = useState(null);
  const [discordShareFull, setDiscordShareFull] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [libgenResults, setLibgenResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [searchTab, setSearchTab] = useState("openlibrary"); // "openlibrary" or "libgen" or "all"
  const [addReviewWithBook, setAddReviewWithBook] = useState(
    !REVIEW_DISABLED_STATUSES.has(emptyBookForm.status)
  );
  const [bookReviewDraft, setBookReviewDraft] = useState(() =>
    createReviewDraft(emptyBookForm.status)
  );
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    bookId: null,
    book: null,
    existingReview: null
  });
  const [modalReviewForm, setModalReviewForm] = useState(() =>
    createReviewDraft(emptyBookForm.status)
  );
  const [coverRefreshing, setCoverRefreshing] = useState(false);
  const [libgenSearching, setLibgenSearching] = useState(new Set());
  const [batchSearching, setBatchSearching] = useState(false);
  const [showBookForm, setShowBookForm] = useState(false);
  const isEditingBook = Boolean(editingBookFormId);

  // Calculate library statistics
  const libraryStats = useMemo(() => calculateLibraryStats(books), [books]);

  const applyBookPatch = useCallback((updatedBook) => {
    if (!updatedBook?.id) {
      return;
    }
    setBooks((prev) => applyBookUpdateToList(prev, updatedBook));
  }, []);

  const showToast = useCallback((text, tone = "info") => {
    setToast({ id: Date.now(), text, tone });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        await initDB();
        let skipSampleLibrary = false;

        if (isCloudSyncEnabled()) {
          try {
            const snapshot = await pullCloudSnapshot();
            if (snapshot.status === "ok") {
              const applied = await applyRemoteSnapshot(snapshot);
              if ((applied.books ?? 0) > 0 || (applied.reviews ?? 0) > 0) {
                skipSampleLibrary = true;
              }
            }
          } catch (cloudError) {
            console.warn("Failed to sync remote snapshot", cloudError);
            showToast("Cloud sync unavailable. Using local data only.", "warning");
          }
        }

        if (!skipSampleLibrary) {
          await mergeSampleLibrary();
        }
        await mergeDuplicateBooks({ maxReviewsPerBook: 5 });
        await refreshData();
        setInitialized(true);
      } catch (error) {
        console.error("Failed to init IndexedDB", error);
        showToast("IndexedDB unavailable. Data will not persist.", "warning");
      }
    }

    bootstrap();
  }, [showToast]);

  useEffect(() => {
    if (typeof localStorage === "undefined") {
      return;
    }

    const storedWebhook = localStorage.getItem(DISCORD_STORAGE_KEY);
    if (storedWebhook) {
      setDiscordWebhook(storedWebhook);
    }

    const storedSharePref = localStorage.getItem(DISCORD_SHARE_MODE_KEY);
    if (storedSharePref !== null) {
      setDiscordShareFull(storedSharePref === "true");
    }
  }, []);

  useEffect(() => {
    if (typeof localStorage === "undefined") {
      return;
    }

    if (discordWebhook) {
      localStorage.setItem(DISCORD_STORAGE_KEY, discordWebhook);
    } else {
      localStorage.removeItem(DISCORD_STORAGE_KEY);
    }
  }, [discordWebhook]);

  useEffect(() => {
    if (typeof localStorage === "undefined") {
      return;
    }

    localStorage.setItem(DISCORD_SHARE_MODE_KEY, String(discordShareFull));
  }, [discordShareFull]);


  const reviewsByBook = useMemo(() => {
    return reviews.reduce((acc, review) => {
      const list = acc[review.bookId] ?? [];
      list.push(review);
      list.sort((a, b) => {
        const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return bTime - aTime;
      });
      acc[review.bookId] = list;
      return acc;
    }, {});
  }, [reviews]);

  async function refreshData() {
    const [bookList, reviewList] = await Promise.all([getBooks(), getReviews()]);
    setBooks(bookList);
    setReviews(reviewList);
  }

  async function mergeDuplicateBooks({ maxReviewsPerBook = 5 } = {}) {
    const latestBooks = await getBooks();
    const latestReviews = await getReviews();

    if (!Array.isArray(latestBooks) || latestBooks.length === 0) {
      return {
        mergedBooks: 0,
        reassignedReviews: 0,
        removedDuplicateReviews: 0,
        trimmedOverflowReviews: 0
      };
    }

    const booksById = new Map(latestBooks.map((book) => [book.id, { ...book }]));
    const reviewsByBookId = new Map();
    latestReviews.forEach((review) => {
      if (!review?.bookId) {
        return;
      }
      const list = reviewsByBookId.get(review.bookId) ?? [];
      list.push({ ...review });
      reviewsByBookId.set(review.bookId, list);
    });

    const groups = new Map();
    booksById.forEach((book) => {
      const normalizedTitle =
        normalizeForMatch(book.title) || (book.title ?? "").trim().toLowerCase();
      const normalizedAuthor =
        normalizeForMatch(book.author) || (book.author ?? "").trim().toLowerCase();

      const keyCandidates = new Set();
      if (book.openLibraryUrl) {
        keyCandidates.add(book.openLibraryUrl.trim().toLowerCase());
      }

      if (normalizedTitle) {
        keyCandidates.add(`${normalizedTitle}::${normalizedAuthor || "unknown"}`);
        if (!normalizedAuthor) {
          keyCandidates.add(`title-only::${normalizedTitle}`);
        }
      }

      if (keyCandidates.size === 0) {
        keyCandidates.add(`book-id::${book.id}`);
      }

      keyCandidates.forEach((key) => {
        const list = groups.get(key) ?? [];
        list.push(book);
        groups.set(key, list);
      });
    });

    let mergedBooks = 0;
    let reassignedReviews = 0;
    let removedDuplicateReviews = 0;
    let trimmedOverflowReviews = 0;
    const processedBooks = new Set();

    function dedupeReviewList(reviewList) {
      if (!Array.isArray(reviewList) || reviewList.length === 0) {
        return { keep: [], duplicates: [], overflow: [] };
      }

      const sorted = [...reviewList].sort((a, b) => {
        const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
        const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
        return timeB - timeA;
      });

      const seen = new Set();
      const unique = [];
      const duplicates = [];

      for (const review of sorted) {
        const key = `${review.rating ?? "?"}::${normalizeForMatch(review.text)}`;
        if (seen.has(key)) {
          duplicates.push(review);
        } else {
          seen.add(key);
          unique.push(review);
        }
      }

      const overflow = unique.slice(maxReviewsPerBook);
      const keep = unique.slice(0, maxReviewsPerBook);
      return { keep, duplicates, overflow };
    }

    async function cleanupBook(book) {
      if (!book || processedBooks.has(book.id)) {
        return;
      }

      const reviewList = reviewsByBookId.get(book.id) ?? [];
      const { keep, duplicates, overflow } = dedupeReviewList(reviewList);

      for (const review of duplicates) {
        await deleteReviewById(review.id);
        removedDuplicateReviews += 1;
      }

      for (const review of overflow) {
        await deleteReviewById(review.id);
        trimmedOverflowReviews += 1;
      }

      const keptReviews = keep.map((review) => ({ ...review }));
      reviewsByBookId.set(book.id, keptReviews);

      let changed = false;
      if (keptReviews.length > 0) {
        const leadReview = keptReviews[0];
        if (leadReview?.status && leadReview.status !== book.status) {
          book.status = leadReview.status;
          changed = true;
        }
        const hasUnreadReview = keptReviews.some((review) => isUnreadStatus(review.status));
        if (book.unread !== hasUnreadReview) {
          book.unread = hasUnreadReview;
          changed = true;
        }
      } else {
        const unreadFlag = isUnreadStatus(book.status);
        if (book.unread !== unreadFlag) {
          book.unread = unreadFlag;
          changed = true;
        }
      }

      if (changed) {
        book.titleLower = book.title ? book.title.toLowerCase() : null;
        book.authorLower = book.author ? book.author.toLowerCase() : null;
        book.updatedAt = new Date().toISOString();
        await updateBook(book);
        booksById.set(book.id, book);
      }

      processedBooks.add(book.id);
    }

    for (const group of groups.values()) {
      if (!Array.isArray(group) || group.length === 0) {
        continue;
      }

      const activeGroup = group.filter((candidate) => booksById.has(candidate.id));
      if (activeGroup.length === 0) {
        continue;
      }

      activeGroup.sort((a, b) => {
        const urlScore = Number(Boolean(b.openLibraryUrl)) - Number(Boolean(a.openLibraryUrl));
        if (urlScore !== 0) {
          return urlScore;
        }
        const coverScore = Number(hasCover(b.cover)) - Number(hasCover(a.cover));
        if (coverScore !== 0) {
          return coverScore;
        }
        const dateA = new Date(a.createdAt ?? a.updatedAt ?? 0).getTime();
        const dateB = new Date(b.createdAt ?? b.updatedAt ?? 0).getTime();
        if (dateA !== dateB) {
          return dateA - dateB;
        }
        return (a.id ?? 0) - (b.id ?? 0);
      });

      const primary = activeGroup[0];
      const duplicates = activeGroup.slice(1);

      if (duplicates.length > 0) {
        for (const duplicate of duplicates) {
          if (!booksById.has(duplicate.id)) {
            continue;
          }

          const duplicateReviews = reviewsByBookId.get(duplicate.id) ?? [];
          for (const review of duplicateReviews) {
            const updatedReview = await saveReview({
              ...review,
              id: review.id,
              bookId: primary.id
            });
            reassignedReviews += 1;

            const existingList = reviewsByBookId.get(primary.id) ?? [];
            const filteredList = existingList.filter((item) => item.id !== updatedReview.id);
            filteredList.push(updatedReview);
            reviewsByBookId.set(primary.id, filteredList);
          }

          reviewsByBookId.delete(duplicate.id);

          if (!hasCover(primary.cover) && hasCover(duplicate.cover)) {
            primary.cover = duplicate.cover;
          }

          if (!primary.openLibraryUrl && duplicate.openLibraryUrl) {
            primary.openLibraryUrl = duplicate.openLibraryUrl;
          }

          if (!primary.openLibraryIdentifiers && duplicate.openLibraryIdentifiers) {
            primary.openLibraryIdentifiers = duplicate.openLibraryIdentifiers;
          }

          if (!primary.availability && duplicate.availability) {
            primary.availability = duplicate.availability;
          }

          await deleteBook(duplicate.id);
          booksById.delete(duplicate.id);
          mergedBooks += 1;
        }

        primary.titleLower = primary.title ? primary.title.toLowerCase() : null;
        primary.authorLower = primary.author ? primary.author.toLowerCase() : null;
        primary.updatedAt = new Date().toISOString();
        await updateBook(primary);
        booksById.set(primary.id, primary);
      }

      await cleanupBook(primary);
    }

    for (const book of booksById.values()) {
      await cleanupBook(book);
    }

    return {
      mergedBooks,
      reassignedReviews,
      removedDuplicateReviews,
      trimmedOverflowReviews
    };
  }

  function formatCleanupSummary(result) {
    if (!result) {
      return "";
    }

    const segments = [];

    if (result.mergedBooks > 0) {
      segments.push(
        `${result.mergedBooks} duplicate book${result.mergedBooks === 1 ? "" : "s"} merged`
      );
    }

    if (result.reassignedReviews > 0) {
      segments.push(
        `${result.reassignedReviews} review${result.reassignedReviews === 1 ? "" : "s"} reassigned`
      );
    }

    if (result.removedDuplicateReviews > 0) {
      segments.push(
        `${result.removedDuplicateReviews} duplicate review${result.removedDuplicateReviews === 1 ? "" : "s"
        } removed`
      );
    }

    if (result.trimmedOverflowReviews > 0) {
      segments.push(
        `${result.trimmedOverflowReviews} extra review${result.trimmedOverflowReviews === 1 ? "" : "s"
        } trimmed (max 5 per book)`
      );
    }

    if (segments.length === 0) {
      return "";
    }

    return ` Cleanup: ${segments.join(", ")}.`;
  }

  async function handleRefreshCovers() {
    if (coverRefreshing) {
      return;
    }

    const missingCovers = books.filter((book) => book && !hasCover(book.cover));
    setCoverRefreshing(true);
    try {
      let updatedCount = 0;
      const stagedUpdates = new Map();

      if (missingCovers.length > 0) {
        for (const book of missingCovers) {
          // Process sequentially to stay within rate limits and avoid duplicate lookups.
          // eslint-disable-next-line no-await-in-loop
          const updatedBook = await autoPopulateCoverIfNeeded(book);
          if (updatedBook) {
            updatedCount += 1;
            stagedUpdates.set(updatedBook.id, updatedBook);
          }
        }
      }

      if (stagedUpdates.size > 0) {
        setBooks((prev) => prev.map((entry) => stagedUpdates.get(entry.id) ?? entry));
      }

      const dedupeResult = await mergeDuplicateBooks();
      if (
        updatedCount > 0 ||
        dedupeResult.mergedBooks > 0 ||
        dedupeResult.reassignedReviews > 0 ||
        dedupeResult.removedDuplicateReviews > 0 ||
        dedupeResult.trimmedOverflowReviews > 0
      ) {
        await refreshData();
      }

      const messageParts = [];
      let tone = "info";

      if (updatedCount > 0) {
        messageParts.push(
          `Added covers for ${updatedCount} book${updatedCount === 1 ? "" : "s"} via Open Library.`
        );
        tone = "success";
      } else if (missingCovers.length === 0) {
        messageParts.push("Covers already up to date.");
      } else {
        messageParts.push("No matching covers found via Open Library.");
        tone = "warning";
      }

      const cleanupSummary = formatCleanupSummary(dedupeResult);
      if (cleanupSummary) {
        messageParts.push(cleanupSummary.trim());
        tone = "success";
      } else {
        messageParts.push("No duplicate books or reviews detected.");
      }

      showToast(messageParts.join(" "), tone);
    } catch (error) {
      console.error("Cover refresh failed", error);
      showToast("Cover refresh failed. See console for details.", "error");
    } finally {
      setCoverRefreshing(false);
    }
  }

  function handleBookStatusChange(event) {
    const nextStatus = event.target.value;
    const previousStatus = bookForm.status;

    setBookForm((prev) => ({ ...prev, status: nextStatus }));

    if (REVIEW_DISABLED_STATUSES.has(nextStatus)) {
      setAddReviewWithBook(false);
      setBookReviewDraft(createReviewDraft(nextStatus));
    } else {
      setAddReviewWithBook((prevValue) => {
        if (REVIEW_DISABLED_STATUSES.has(previousStatus)) {
          return true;
        }
        return prevValue;
      });
      setBookReviewDraft((prev) => ({
        ...prev,
        status: nextStatus
      }));
    }
  }

  function openReviewModal(book, existingReview = null) {
    setReviewModal({
      isOpen: true,
      bookId: book.id,
      book: book,
      existingReview: existingReview
    });

    if (existingReview) {
      const baseDraft = createReviewDraft(existingReview.status ?? book?.status ?? DEFAULT_STATUS);
      setModalReviewForm({
        ...baseDraft,
        rating: toFiveScale(existingReview.rating ?? null),
        text: existingReview.text ?? ""
      });
    } else {
      setModalReviewForm(createReviewDraft(book?.status ?? DEFAULT_STATUS));
    }
  }

  function closeReviewModal() {
    setReviewModal({
      isOpen: false,
      bookId: null,
      book: null,
      existingReview: null
    });
    setModalReviewForm(createReviewDraft());
  }

  async function handleModalReviewSubmit(event) {
    event.preventDefault();
    if (!reviewModal.bookId) {
      showToast("No book selected for review.", "error");
      return;
    }

    if (!modalReviewForm.status) {
      showToast("Select a reading status before saving your review.", "error");
      return;
    }

    const ratingValueFive = Number.parseFloat(modalReviewForm.rating);
    if (Number.isNaN(ratingValueFive)) {
      showToast("Rating is required (0-5, decimals allowed).", "error");
      return;
    }

    if (ratingValueFive < 0 || ratingValueFive > 5) {
      showToast("Rating must be between 0 and 5.", "error");
      return;
    }

    const cleanText = modalReviewForm.text;

    try {
      const reviewStatus = modalReviewForm.status;
      const storedReview = await saveReview({
        id: reviewModal.existingReview?.id ?? null,
        bookId: reviewModal.bookId,
        rating: fromFiveScale(ratingValueFive),
        text: cleanText,
        status: reviewStatus,
        unread: isUnreadStatus(reviewStatus)
      });

      let discordResult = null;
      if (discordWebhook && reviewModal.book) {
        const existingSet = reviewsByBook[reviewModal.bookId] ?? [];
        const recentTakes = [...existingSet, { rating: fromFiveScale(ratingValueFive), text: cleanText }].slice(-3);
        discordResult = await postReviewToDiscord({
          webhookUrl: discordWebhook,
          book: reviewModal.book,
          review: { ...storedReview, rating: fromFiveScale(ratingValueFive), text: cleanText },
          recentReviews: recentTakes,
          shareMode: discordShareFull ? "full" : "summary"
        });
      }

      let coverAdded = false;
      if (reviewModal.book) {
        const updatedBook = await autoPopulateCoverIfNeeded(reviewModal.book);
        if (updatedBook) {
          coverAdded = true;
          applyBookPatch(updatedBook);
        }

        const latestBook = books.find((item) => item.id === reviewModal.book.id) ?? {
          ...reviewModal.book,
          ...updatedBook
        };
        const syncedBook = {
          ...latestBook,
          status: reviewStatus,
          unread: isUnreadStatus(reviewStatus),
          updatedAt: new Date().toISOString()
        };
        await updateBook(syncedBook);
        applyBookPatch(syncedBook);
      }

      const cleanupResult = await mergeDuplicateBooks({ maxReviewsPerBook: 5 });
      await refreshData();
      closeReviewModal();

      const action = reviewModal.existingReview ? "updated" : "added";
      const coverNote = coverAdded ? " Cover art auto-added from Open Library." : "";
      const cleanupSummary = formatCleanupSummary(cleanupResult);
      const extraNotes = `${coverNote}${cleanupSummary}`;
      if (discordResult?.status === "error") {
        showToast(
          `Review ${action} locally; Discord webhook failed. Check console.${extraNotes}`,
          "warning"
        );
      } else if (discordResult?.status === "sent") {
        showToast(
          `Review ${action} locally and shared to Discord.${extraNotes}`,
          "success"
        );
      } else {
        showToast(`Review ${action} locally.${extraNotes}`, "success");
      }
    } catch (error) {
      console.error("Failed to save review", error);
      showToast("Could not save review. See console for details.", "error");
    }
  }

  function handleCoverTypeChange(event) {
    const nextType = event.target.value;
    if (!nextType) {
      setBookForm((prev) => ({ ...prev, cover: null }));
      return;
    }

    setBookForm((prev) => {
      const identifiers = prev.openLibraryIdentifiers;
      const defaultValue = getDefaultCoverValue(nextType, identifiers);
      const existingSameTypeValue =
        prev.cover && prev.cover.type === nextType ? prev.cover.value ?? "" : "";
      const nextValue = defaultValue || existingSameTypeValue || "";

      return {
        ...prev,
        cover: { type: nextType, value: nextValue }
      };
    });
  }

  function handleCoverValueChange(event) {
    const nextValue = event.target.value;
    setBookForm((prev) => ({
      ...prev,
      cover: prev.cover
        ? { ...prev.cover, value: nextValue }
        : { type: "url", value: nextValue }
    }));
  }
  function handleClearCover() {
    setBookForm((prev) => ({ ...prev, cover: null }));
  }

  async function handleSaveBook(formData, reviewData) {
    if (!formData.title.trim()) {
      showToast("Title is required.", "error");
      return;
    }

    const wantsReview = Boolean(reviewData);
    const reviewStatusSelection = reviewData?.status || formData.status || DEFAULT_STATUS;
    const effectiveStatus = wantsReview ? reviewStatusSelection : formData.status || DEFAULT_STATUS;

    if (wantsReview) {
      const ratingValueFive = Number.parseFloat(reviewData.rating);
      if (Number.isNaN(ratingValueFive)) {
        showToast("Rating is required (0-5, decimals allowed) when adding a review.", "error");
        return;
      }
      if (ratingValueFive < 0 || ratingValueFive > 5) {
        showToast("Rating must be between 0 and 5.", "error");
        return;
      }
    }

    const now = new Date().toISOString();
    let coverData = null;
    if (hasCover(formData.cover)) {
      const rawValue = String(formData.cover.value ?? "").trim();
      if (rawValue) {
        coverData = { ...formData.cover, value: rawValue };
      }
    }

    const newBookBase = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      status: effectiveStatus,
      unread: isUnreadStatus(effectiveStatus),
      cover: coverData,
      openLibraryUrl: formData.openLibraryUrl ? formData.openLibraryUrl : null,
      openLibraryIdentifiers: formData.openLibraryIdentifiers,
      availability: formData.availability,
      titleLower: formData.title.trim().toLowerCase(),
      authorLower: formData.author ? formData.author.trim().toLowerCase() : null,
      updatedAt: now
    };

    try {
      let targetBookId = editingBookFormId;
      let finalMessage = "Book saved locally.";
      let finalMessageTone = "success";

      if (editingBookFormId) {
        const original = editingBookOriginal ?? {};
        const updatedBook = {
          ...original,
          ...newBookBase,
          id: editingBookFormId,
          createdAt: original.createdAt ?? now
        };
        await updateBook(updatedBook);
        targetBookId = editingBookFormId;
        finalMessage = "Book details updated.";
        finalMessageTone = "success";
      } else {
        const normalizedTitle = newBookBase.titleLower;
        const normalizedAuthor = newBookBase.authorLower ?? "";
        const matchingBook = books.find((existing) => {
          const existingTitle =
            existing.titleLower ?? (existing.title ? existing.title.toLowerCase() : "");
          if (!normalizedTitle || existingTitle !== normalizedTitle) {
            return false;
          }

          const existingAuthor =
            existing.authorLower ?? (existing.author ? existing.author.toLowerCase() : "");
          if (normalizedAuthor && existingAuthor !== normalizedAuthor) {
            return false;
          }

          const existingUrl = existing.openLibraryUrl ?? null;
          if (existingUrl && newBookBase.openLibraryUrl && existingUrl !== newBookBase.openLibraryUrl) {
            return false;
          }

          const existingHasCover = hasCover(existing.cover);
          const newHasCover = hasCover(coverData);
          if (
            existingHasCover &&
            newHasCover &&
            (existing.cover.type !== coverData.type ||
              String(existing.cover.value) !== String(coverData.value))
          ) {
            return false;
          }

          return true;
        });

        if (matchingBook) {
          const updatedBook = {
            ...matchingBook,
            ...newBookBase,
            id: matchingBook.id,
            createdAt: matchingBook.createdAt ?? now
          };
          await updateBook(updatedBook);
          targetBookId = matchingBook.id;
          finalMessage = "Book details updated.";
          finalMessageTone = "success";
        } else {
          const createdBook = {
            ...newBookBase,
            createdAt: now
          };
          targetBookId = await addBook(createdBook);
          finalMessage = "Book saved locally.";
          finalMessageTone = "success";
        }
      }

      if (wantsReview) {
        try {
          const ratingFiveScale = Number.parseFloat(reviewData.rating);
          const ratingTenScale = fromFiveScale(ratingFiveScale);
          const cleanText = reviewData.text;

          const reviewStatus = reviewStatusSelection;
          const reviewPayload = {
            bookId: targetBookId,
            rating: ratingTenScale,
            text: cleanText,
            status: reviewStatus,
            unread: isUnreadStatus(reviewStatus)
          };
          const storedReview = await saveReview(reviewPayload);

          if (discordWebhook) {
            const targetBook = {
              ...(books.find((book) => book.id === targetBookId) ?? {}),
              ...newBookBase,
              id: targetBookId
            };
            const recentTakes = [
              {
                rating: ratingTenScale,
                text: cleanText
              }
            ];
            const discordResult = await postReviewToDiscord({
              webhookUrl: discordWebhook,
              book: targetBook,
              review: { ...storedReview, rating: ratingTenScale, text: cleanText },
              recentReviews: recentTakes,
              shareMode: discordShareFull ? "full" : "summary"
            });

            if (discordResult?.status === "error") {
              finalMessage =
                "Book saved locally; review saved but Discord webhook failed. Check console.";
              finalMessageTone = "warning";
            } else if (discordResult?.status === "sent") {
              finalMessage = "Book and review saved locally, and posted to Discord.";
              finalMessageTone = "success";
            } else {
              finalMessage = "Book and review saved locally.";
              finalMessageTone = "success";
            }
          } else {
            finalMessage = "Book and review saved locally.";
            finalMessageTone = "success";
          }
        } catch (reviewError) {
          console.error("Failed to save review while adding a new book", reviewError);
          finalMessage = "Book saved locally; review could not be saved. See console for details.";
          finalMessageTone = "warning";
        }
      }

      const cleanupResult = await mergeDuplicateBooks({ maxReviewsPerBook: 5 });
      await refreshData();
      const cleanupSummary = formatCleanupSummary(cleanupResult);
      if (cleanupSummary) {
        finalMessage = `${finalMessage}${cleanupSummary}`;
        if (finalMessageTone !== "warning") {
          finalMessageTone = "success";
        }
      }
      setBookForm({ ...emptyBookForm });
      setBookReviewDraft(createReviewDraft(emptyBookForm.status));
      setAddReviewWithBook(!REVIEW_DISABLED_STATUSES.has(emptyBookForm.status));
      setSearchQuery("");
      setSearchResults([]);
      setEditingBookFormId(null);
      setEditingBookOriginal(null);
      showToast(finalMessage, finalMessageTone);
    } catch (error) {
      console.error("Failed to add book", error);
      showToast("Could not save book. See console for details.", "error");
    }
  }

  async function handleAddReview(event) {
    event.preventDefault();
    if (!reviewForm.bookId) {
      showToast("Select a book before adding a review.", "error");
      return;
    }

    const ratingValueFive = Number.parseFloat(reviewForm.rating);
    if (Number.isNaN(ratingValueFive)) {
      showToast("Rating is required (0-5, decimals allowed).", "error");
      return;
    }

    if (ratingValueFive < 0 || ratingValueFive > 5) {
      showToast("Rating must be between 0 and 5.", "error");
      return;
    }

    const cleanText = reviewForm.text;

    const targetBook = books.find((book) => book.id === Number(reviewForm.bookId));

    try {
      const storedReview = await saveReview({
        bookId: Number(reviewForm.bookId),
        rating: fromFiveScale(ratingValueFive),
        text: cleanText,
        unread: false
      });

      let discordResult = null;
      if (discordWebhook && targetBook) {
        const existingSet = reviewsByBook[targetBook.id] ?? [];
        const recentTakes = [...existingSet, { rating: fromFiveScale(ratingValueFive), text: cleanText }].slice(-3);
        discordResult = await postReviewToDiscord({
          webhookUrl: discordWebhook,
          book: targetBook,
          review: { ...storedReview, rating: fromFiveScale(ratingValueFive), text: cleanText },
          recentReviews: recentTakes,
          shareMode: discordShareFull ? "full" : "summary"
        });
      }

      let coverAdded = false;
      if (targetBook) {
        const updatedBook = await autoPopulateCoverIfNeeded(targetBook);
        if (updatedBook) {
          coverAdded = true;
          applyBookPatch(updatedBook);
        }
      }

      const cleanupResult = await mergeDuplicateBooks({ maxReviewsPerBook: 5 });
      await refreshData();
      setReviewForm({ ...emptyReviewForm });
      setEditingBookId(null);

      const coverNote = coverAdded ? " Cover art auto-added from Open Library." : "";
      const cleanupSummary = formatCleanupSummary(cleanupResult);
      const extraNotes = `${coverNote}${cleanupSummary}`;
      if (discordResult?.status === "error") {
        showToast(
          `Review saved locally; Discord webhook failed. Check console.${extraNotes}`,
          "warning"
        );
      } else if (discordResult?.status === "sent") {
        showToast(
          `Review saved locally and shared to Discord.${extraNotes}`,
          "success"
        );
      } else {
        showToast(`Review saved locally.${extraNotes}`, "success");
      }
    } catch (error) {
      console.error("Failed to save review", error);
      showToast("Could not save review. See console for details.", "error");
    }
  }



  async function handleDeleteReview(targetBook, targetReview) {
    if (!targetReview?.id) {
      showToast("Unable to locate this review.", "error");
      return;
    }

    const bookTitle = targetBook?.title ?? "this book";
    if (!window.confirm(`Delete this review for "${bookTitle}"?`)) {
      return;
    }

    try {
      await deleteReviewById(targetReview.id);

      const remainingReviews =
        (reviewsByBook[targetBook?.id] ?? []).filter((item) => item.id !== targetReview.id) ?? [];

      if (targetBook?.id) {
        const updatedBook = {
          ...targetBook,
          updatedAt: new Date().toISOString()
        };

        if (remainingReviews.length > 0) {
          const sorted = [...remainingReviews].sort((a, b) => {
            const timeA = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
            const timeB = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
            return timeB - timeA;
          });
          const lead = sorted[0];
          if (lead?.status) {
            updatedBook.status = lead.status;
          }
          updatedBook.unread = remainingReviews.some((review) => isUnreadStatus(review.status));
        } else {
          updatedBook.unread = isUnreadStatus(updatedBook.status);
        }

        updatedBook.titleLower = updatedBook.title ? updatedBook.title.toLowerCase() : null;
        updatedBook.authorLower = updatedBook.author ? updatedBook.author.toLowerCase() : null;
        await updateBook(updatedBook);
      }

      const shouldCloseModal =
        reviewModal.isOpen &&
        reviewModal.bookId === targetBook?.id &&
        reviewModal.existingReview?.id === targetReview.id;
      if (shouldCloseModal) {
        closeReviewModal();
      }

      await refreshData();
      showToast("Review removed.", "danger");
    } catch (error) {
      console.error("Failed to delete review", error);
      showToast("Could not delete review. See console for details.", "error");
    }
  }

  async function handleExportLibrary() {
    try {
      setExporting(true);
      const payload = {
        exportedAt: new Date().toISOString(),
        books,
        reviews
      };
      downloadLibraryJson(payload);
      showToast("Library exported as JSON.", "success");
    } catch (error) {
      console.error("Failed to export library", error);
      showToast("Export failed. See console for details.", "error");
    } finally {
      setExporting(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      setSearchError("Enter a search term first.");
      setSearchResults([]);
      setLibgenResults([]);
      return;
    }

    try {
      setSearching(true);
      setSearchError("");

      // Search both OpenLibrary and Libgen in parallel
      const [openLibraryResults, libgenSearchResults] = await Promise.allSettled([
        searchOpenLibrary(query),
        searchLibgen(query, { count: 10 })
      ]);

      // Handle OpenLibrary results
      if (openLibraryResults.status === "fulfilled") {
        setSearchResults(openLibraryResults.value);
      } else {
        console.error("OpenLibrary search failed:", openLibraryResults.reason);
        setSearchResults([]);
      }

      // Handle Libgen results
      if (libgenSearchResults.status === "fulfilled") {
        setLibgenResults(libgenSearchResults.value);
      } else {
        console.error("Libgen search failed:", libgenSearchResults.reason);
        setLibgenResults([]);
      }

      // Show error only if both searches failed or returned no results
      const openLibraryCount = openLibraryResults.status === "fulfilled" ? openLibraryResults.value.length : 0;
      const libgenCount = libgenSearchResults.status === "fulfilled" ? libgenSearchResults.value.length : 0;
      const totalResults = openLibraryCount + libgenCount;

      // Auto-switch to the tab that has results
      if (openLibraryCount > 0 && libgenCount === 0) {
        setSearchTab("openlibrary");
      } else if (libgenCount > 0 && openLibraryCount === 0) {
        setSearchTab("libgen");
      } else if (libgenCount > 0) {
        // If both have results, prefer libgen (or keep current tab)
        setSearchTab("libgen");
      }

      if (totalResults === 0) {
        if (openLibraryResults.status === "rejected" && libgenSearchResults.status === "rejected") {
          setSearchError("Could not reach book databases. Please try again later.");
        } else {
          setSearchError("No matches found. Try another search term.");
        }
      }
    } catch (error) {
      console.error("Search failed", error);
      setSearchError("Search failed. Please try again later.");
      setSearchResults([]);
      setLibgenResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleApplySearchResult(result) {
    const cover = result.cover
      ? { ...result.cover, value: String(result.cover.value ?? "") }
      : null;

    const sourceName = result.source === "libgen" ? "Library Genesis" : "OpenLibrary";

    setBookForm((prev) => ({
      ...prev,
      title: result.title ?? prev.title ?? "",
      author: result.author ?? prev.author ?? "",
      cover: cover ?? prev.cover ?? null,
      openLibraryUrl: result.openLibraryUrl ?? prev.openLibraryUrl ?? "",
      openLibraryIdentifiers: result.identifiers ?? prev.openLibraryIdentifiers ?? null,
      availability: result.availability ?? prev.availability ?? null,
      libgenMetadata: result.libgenMetadata ?? prev.libgenMetadata ?? null,
      status: prev.status
    }));
    setSearchQuery(result.title ?? "");
    setSearchResults([]);
    setLibgenResults([]);
    showToast(`Loaded "${result.title ?? "Book"}" from ${sourceName}.`, "info");
  }

  function beginEditBookFromLibrary(book) {
    if (!book) {
      return;
    }

    setBookForm({
      title: book.title ?? "",
      author: book.author ?? "",
      status: book.status ?? emptyBookForm.status,
      cover: book.cover ?? null,
      openLibraryUrl: book.openLibraryUrl ?? "",
      openLibraryIdentifiers: book.openLibraryIdentifiers ?? null,
      availability: book.availability ?? null
    });
    setBookReviewDraft(createReviewDraft(book.status ?? emptyBookForm.status));
    setAddReviewWithBook(false);
    setEditingBookFormId(book.id ?? null);
    setEditingBookOriginal(book);
    showToast(`Editing "${book.title}" details.`, "success");
    setSearchQuery(book.title ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeleteBook(book) {
    if (!book?.id) {
      return;
    }

    const confirmed = window.confirm(
      `Remove "${book.title ?? "this book"}" from your library? This will also delete any reviews.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteBook(book.id);
      await deleteReviewByBookId(book.id);
      await refreshData();
      if (editingBookFormId === book.id) {
        setBookForm({ ...emptyBookForm });
        setBookReviewDraft(createReviewDraft(emptyBookForm.status));
        setEditingBookFormId(null);
        setEditingBookOriginal(null);
      }
      if (reviewModal.bookId === book.id) {
        closeReviewModal();
      }
      showToast("Book removed from library.", "danger");
    } catch (error) {
      console.error("Failed to delete book", error);
      showToast("Could not delete book. See console for details.", "error");
    }
  }

  // LibGen retroactive search for individual book
  async function handleFindOnLibGen(book) {
    if (!book?.id || !book?.title) {
      return;
    }

    setLibgenSearching(prev => new Set(prev).add(book.id));

    try {
      const results = await searchByTitleAndAuthor(book.title, book.author || "", { count: 3 });

      if (results.length === 0) {
        showToast(`No LibGen results found for "${book.title}".`, "warning");
        return;
      }

      // Take the first (best) result
      const bestMatch = results[0];

      // Update the book with LibGen metadata
      const updatedBook = {
        ...book,
        libgenMetadata: bestMatch.libgenMetadata
      };

      await updateBook(updatedBook);
      await refreshData();
      showToast(`Found "${book.title}" on LibGen!`, "success");
    } catch (error) {
      console.error("Failed to search LibGen for book:", error);
      showToast(`Could not search LibGen for "${book.title}".`, "error");
    } finally {
      setLibgenSearching(prev => {
        const next = new Set(prev);
        next.delete(book.id);
        return next;
      });
    }
  }

  // Batch search all books without LibGen data
  async function handleBatchSearchLibGen() {
    const booksWithoutLibgen = books.filter(book => !book.libgenMetadata?.md5);

    if (booksWithoutLibgen.length === 0) {
      showToast("All books already have LibGen data!", "info");
      return;
    }

    const confirmed = window.confirm(
      `Search LibGen for ${booksWithoutLibgen.length} books? This may take a few minutes.`
    );

    if (!confirmed) {
      return;
    }

    setBatchSearching(true);
    showToast(`Searching for ${booksWithoutLibgen.length} books...`, "info");

    try {
      const results = await batchSearchBooks(booksWithoutLibgen);
      const foundCount = Object.keys(results).length;

      // Update books with LibGen data
      for (const [bookId, libgenData] of Object.entries(results)) {
        const book = books.find(b => b.id === parseInt(bookId, 10));
        if (book) {
          const updatedBook = {
            ...book,
            libgenMetadata: libgenData.libgenMetadata
          };
          await updateBook(updatedBook);
        }
      }

      await refreshData();
      showToast(
        `Found ${foundCount} of ${booksWithoutLibgen.length} books on LibGen!`,
        "success"
      );
    } catch (error) {
      console.error("Batch search failed:", error);
      showToast("Batch search failed. See console for details.", "error");
    } finally {
      setBatchSearching(false);
    }
  }

  // Try next LibGen search result for a book
  async function handleTryNextVersion(book) {
    if (!book?.id || !book?.libgenMetadata) {
      return;
    }

    const nextMetadata = getNextLibGenResult(book);

    if (!nextMetadata) {
      showToast("No more versions available.", "info");
      return;
    }

    try {
      const updatedBook = {
        ...book,
        libgenMetadata: nextMetadata
      };

      await updateBook(updatedBook);
      await refreshData();
      showToast(
        `Switched to version ${nextMetadata.currentIndex + 1} of ${nextMetadata.totalResults}`,
        "success"
      );
    } catch (error) {
      console.error("Failed to switch LibGen version:", error);
      showToast("Could not switch version.", "error");
    }
  }

  const coverPreviewUrl = getCoverUrl(bookForm.cover, "M");
  const coverTypeValue = bookForm.cover?.type ?? "";
  const coverValueInput = bookForm.cover?.value ?? "";

  // Get context-aware LibGen CTA based on book status
  function getLibGenCTA(status) {
    const ctas = {
      wishlist: "Download now to start reading!",
      library: "Get your digital copy",
      reading: "Download to read anywhere",
      "re-reading": "Download to revisit this classic",
      "on-hold": "Download when you're ready to continue",
      finished: "Download to re-read or share",
      "did-not-finish": "Try the digital version"
    };
    return ctas[status] || "Get this book";
  }

  function getDefaultCoverValue(type, identifiers) {
    if (!type || !identifiers) {
      return "";
    }

    switch (type) {
      case "id":
        return identifiers.id ?? "";
      case "isbn":
        return identifiers.isbn?.[0] ?? "";
      case "olid":
        return identifiers.olid?.[0] ?? "";
      case "lccn":
        return identifiers.lccn?.[0] ?? "";
      case "oclc":
        return identifiers.oclc?.[0] ?? "";
      case "url":
        return "";
      default:
        return "";
    }
  }

  return (
    <div className="App" style={styles.wrapper}>
      <ToastOverlay toast={toast} onDismiss={clearToast} />
      <header style={styles.header}>
        <Logo />
        <p>Local-first proof of concept. Data persists in your browser via IndexedDB.</p>
        <div style={styles.headerActions}>
          <button
            type="button"
            style={{
              ...styles.coverRefreshButton,
              ...(coverRefreshing ? styles.coverRefreshButtonDisabled : null)
            }}
            onClick={handleRefreshCovers}
            disabled={coverRefreshing}
          >
            {coverRefreshing ? "Refreshing covers…" : "Refresh library covers"}
          </button>
        </div>
        {!initialized && <p style={styles.warning}>Initializing storage&hellip;</p>}
      </header>

      {initialized && books.length > 0 && (
        <LibGenAnalyticsDashboard
          stats={libraryStats}
          onBatchSearch={handleBatchSearchLibGen}
          batchSearching={batchSearching}
        />
      )}

      <main style={styles.main}>
        <section style={styles.card}>
          <h2>Add Book</h2>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              style={styles.input}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search OpenLibrary & Library Genesis"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <button style={styles.searchButton} type="submit" disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </button>
          </form>
          {searchError && <p style={styles.error}>{searchError}</p>}
          {(searchResults.length > 0 || libgenResults.length > 0) && (
            <>
              <div style={styles.searchTabs}>
                <button
                  type="button"
                  style={{
                    ...styles.searchTab,
                    ...(searchTab === "openlibrary" ? styles.searchTabActive : {})
                  }}
                  onClick={() => setSearchTab("openlibrary")}
                >
                  OpenLibrary
                  {searchResults.length > 0 && (
                    <span style={styles.searchTabCount}>{searchResults.length}</span>
                  )}
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.searchTab,
                    ...(searchTab === "libgen" ? styles.searchTabActive : {})
                  }}
                  onClick={() => setSearchTab("libgen")}
                >
                  Library Genesis
                  {libgenResults.length > 0 && (
                    <span style={styles.searchTabCount}>{libgenResults.length}</span>
                  )}
                </button>
              </div>
            </>
          )}
          {searchTab === "openlibrary" && searchResults.length > 0 && (
            <ul style={styles.searchResults}>
              {searchResults.map((result) => {
                const coverUrl = getCoverUrl(result.cover, "S");
                const availabilityLabel = describeAvailability(result.availability);
                const availabilityActions = buildAvailabilityActions(result.availability);
                const showOpenLibraryLink = shouldShowOpenLibraryLink(
                  result.openLibraryUrl,
                  availabilityActions
                );
                const showDownloadTag = Boolean(result.availability?.hasDownload);
                return (
                  <li key={result.key} style={styles.searchResultItem}>
                    <div style={styles.searchResultContent}>
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={`Cover preview for ${result.title}`}
                          style={styles.searchResultCover}
                        />
                      ) : (
                        <div style={styles.searchResultCoverPlaceholder}>No cover</div>
                      )}
                      <div>
                        <strong>{result.title}</strong>
                        {result.author && <span> &middot; {result.author}</span>}
                        {result.year && <span style={styles.meta}> &middot; {result.year}</span>}
                        {showOpenLibraryLink && (
                          <div>
                            <a
                              href={result.openLibraryUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={styles.coverLink}
                            >
                              Open Library page
                            </a>
                          </div>
                        )}
                        {(availabilityLabel || showDownloadTag) && (
                          <div style={styles.availability}>
                            {availabilityLabel && (
                              <span style={styles.availabilityBadge}>{availabilityLabel}</span>
                            )}
                            {showDownloadTag && (
                              <span style={styles.downloadBadge}>Downloads available</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.searchResultActions}>
                      {availabilityActions.map((action) => (
                        <a
                          key={action.type}
                          href={action.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            ...styles.availabilityAction,
                            ...(action.type === "read"
                              ? styles.availabilityActionRead
                              : action.type === "borrow"
                                ? styles.availabilityActionBorrow
                                : action.type === "waitlist"
                                  ? styles.availabilityActionWaitlist
                                  : action.type === "download"
                                    ? styles.availabilityActionDownload
                                    : null)
                          }}
                        >
                          {action.label}
                        </a>
                      ))}
                      <button
                        type="button"
                        style={styles.smallButton}
                        onClick={() => handleApplySearchResult(result)}
                      >
                        Use
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {searchTab === "libgen" && libgenResults.length > 0 && (
            <ul style={styles.searchResults}>
              {libgenResults.map((result) => {
                const coverUrl = getCoverUrl(result.cover, "S");
                const hasMetadata = result.libgenMetadata;
                return (
                  <li key={result.key} style={styles.searchResultItem}>
                    <div style={styles.searchResultContent}>
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={`Cover preview for ${result.title}`}
                          style={styles.searchResultCover}
                        />
                      ) : (
                        <div style={styles.searchResultCoverPlaceholder}>No cover</div>
                      )}
                      <div>
                        <strong>{result.title}</strong>
                        {result.author && <span> &middot; {result.author}</span>}
                        {result.year && <span style={styles.meta}> &middot; {result.year}</span>}
                        <div>
                          <span style={styles.libgenBadge}>Library Genesis</span>
                          {hasMetadata?.extension && (
                            <span style={{ ...styles.libgenMetadataItem, marginLeft: "0.5rem" }}>
                              {hasMetadata.extension.toUpperCase()}
                            </span>
                          )}
                          {hasMetadata?.filesize && (
                            <span style={{ ...styles.libgenMetadataItem, marginLeft: "0.3rem" }}>
                              {hasMetadata.filesize}
                            </span>
                          )}
                        </div>
                        {hasMetadata?.downloadUrl && (
                          <div style={{ marginTop: "0.5rem" }}>
                            <a
                              href={hasMetadata.downloadUrl}
                              target="_blank"
                              rel="noreferrer"
                              style={{ ...styles.coverLink, color: "#5f40c4" }}
                            >
                              Download
                            </a>
                            {hasMetadata.totalResults > 1 && (
                              <span style={styles.meta}> &middot; {hasMetadata.totalResults} versions available</span>
                            )}
                          </div>
                        )}
                        {hasMetadata && (
                          <div style={styles.libgenMetadata}>
                            {hasMetadata.pages && (
                              <span style={styles.libgenMetadataItem}>{hasMetadata.pages} pages</span>
                            )}
                            {hasMetadata.language && (
                              <span style={styles.libgenMetadataItem}>{hasMetadata.language}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div style={styles.searchResultActions}>
                      <button
                        type="button"
                        style={styles.smallButton}
                        onClick={() => handleApplySearchResult(result)}
                      >
                        Use
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {showBookForm && (
            <div className="mb-8 animate-fadeIn">
              <BookForm
                initialData={bookForm}
                onSubmit={handleSaveBook}
                onCancel={() => {
                  setShowBookForm(false);
                  setEditingBookFormId(null);
                  setBookForm({ ...emptyBookForm });
                }}
                isEditing={isEditingBook}
                coverPreviewUrl={coverPreviewUrl}
                onClearCover={handleClearCover}
              />
            </div>
          )}
        </section>


      </main>

      <section style={styles.listSection}>
        <h2>Library</h2>
        {books.length === 0 && <p>No books saved yet.</p>}
        <ul style={styles.list}>
          {books.map((book) => {
            const bookCoverUrl = getCoverUrl(book.cover, "M");
            const availabilityLabel = describeAvailability(book.availability);
            const availabilityActions = buildAvailabilityActions(book.availability);
            const showOpenLibraryLink = shouldShowOpenLibraryLink(
              book.openLibraryUrl,
              availabilityActions
            );
            const showDownloadTag = Boolean(book.availability?.hasDownload);
            const reviewList = reviewsByBook[book.id] ?? [];
            const latestReview = reviewList[0] ?? null;
            const statusSource = latestReview?.status ?? book.status ?? null;
            const statusLabel = statusSource ? STATUS_LABELS[statusSource] ?? statusSource : "—";
            const unreadBadge = isUnreadStatus(statusSource) || Boolean(book.unread);
            return (
              <li key={book.id} style={styles.listItem}>
                {bookCoverUrl ? (
                  <img
                    src={bookCoverUrl}
                    alt={`Cover of ${book.title}`}
                    style={styles.libraryCover}
                  />
                ) : (
                  <div style={styles.libraryCoverPlaceholder}>No cover</div>
                )}
                <div style={styles.bookContent}>
                  <div>
                    <strong>{book.title}</strong>
                    {book.author && <span> &middot; {book.author}</span>}
                    <div style={styles.meta}>
                      Status: {statusLabel}
                      {unreadBadge && <span style={styles.badgeSecondary}>Unread</span>}
                    </div>
                    {showOpenLibraryLink && (
                      <a
                        href={book.openLibraryUrl}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.coverLink}
                      >
                        View on Open Library
                      </a>
                    )}
                    {(availabilityLabel || showDownloadTag) && (
                      <div style={styles.availability}>
                        {availabilityLabel && (
                          <span style={styles.availabilityBadge}>{availabilityLabel}</span>
                        )}
                        {showDownloadTag && (
                          <span style={styles.downloadBadge}>Downloads available</span>
                        )}
                      </div>
                    )}
                    <div style={styles.bookActions}>
                      <button
                        type="button"
                        style={styles.smallButton}
                        onClick={() => beginEditBookFromLibrary(book)}
                      >
                        Edit details
                      </button>
                      {!book.libgenMetadata?.md5 && (
                        <button
                          type="button"
                          style={{
                            ...styles.findLibgenButton,
                            ...(libgenSearching.has(book.id) ? styles.findLibgenButtonSearching : {})
                          }}
                          onClick={() => handleFindOnLibGen(book)}
                          disabled={libgenSearching.has(book.id)}
                        >
                          {libgenSearching.has(book.id) ? "Searching..." : "📥 Find on LibGen"}
                        </button>
                      )}
                      <button
                        type="button"
                        style={styles.dangerButton}
                        onClick={() => handleDeleteBook(book)}
                      >
                        Remove
                      </button>
                    </div>
                    {availabilityActions.length > 0 && (
                      <div style={styles.availabilityActionsList}>
                        {availabilityActions.map((action) => (
                          <a
                            key={`${book.id}-${action.type}`}
                            href={action.url}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              ...styles.availabilityAction,
                              ...(action.type === "read"
                                ? styles.availabilityActionRead
                                : action.type === "borrow"
                                  ? styles.availabilityActionBorrow
                                  : action.type === "waitlist"
                                    ? styles.availabilityActionWaitlist
                                    : action.type === "download"
                                      ? styles.availabilityActionDownload
                                      : null)
                            }}
                          >
                            {action.label}
                          </a>
                        ))}
                      </div>
                    )}
                    <LibGenWidget
                      book={book}
                      onTryNextVersion={handleTryNextVersion}
                      ctaMessage={getLibGenCTA(statusSource)}
                    />
                  </div>
                  <div>
                    {(reviewsByBook[book.id] ?? []).length === 0 ? (
                      <em>No reviews yet.</em>
                    ) : (
                      <ul style={styles.reviewList}>
                        {reviewsByBook[book.id].map((review) => {
                          const timestamp = formatTimestampForDisplay(
                            review.updatedAt ?? review.createdAt
                          );
                          const ratingTenDisplay =
                            typeof review.rating === "number"
                              ? review.rating.toFixed(
                                review.rating % 1 === 0 ? 0 : 1
                              )
                              : "—";
                          const ratingFiveDisplay = formatFiveScaleDisplay(review.rating);
                          const starNodes = renderStarRating(Number(review.rating ?? 0));
                          const reviewStatusLabel =
                            review.status && STATUS_LABELS[review.status]
                              ? STATUS_LABELS[review.status]
                              : review.status ?? null;
                          return (
                            <li key={review.id}>
                              <div style={styles.reviewHeader}>
                                <div style={styles.starRow}>{starNodes}</div>
                                <span style={styles.reviewScore}>{ratingFiveDisplay}</span>
                                <span style={styles.reviewScoreSmall}>{ratingTenDisplay}/10</span>
                                {reviewStatusLabel && (
                                  <span style={styles.reviewStatusBadge}>{reviewStatusLabel}</span>
                                )}
                                {timestamp && (
                                  <span style={styles.reviewTimestamp}>{timestamp}</span>
                                )}
                              </div>
                              {review.text && <div>{review.text}</div>}
                              <div style={styles.reviewActions}>
                                <button
                                  type="button"
                                  style={styles.smallButton}
                                  onClick={() => openReviewModal(book, review)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  style={styles.dangerButton}
                                  onClick={() => handleDeleteReview(book, review)}
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div style={styles.utilityGrid}>
        <section style={styles.discordSection}>
          <h2>Discord Sharing</h2>
          <p style={styles.helperText}>
            Drop in a Discord webhook so friends can react. Toggle full sharing when you want to
            include detailed reviews.
          </p>
          <label style={styles.switchLabel}>
            <input
              type="checkbox"
              style={styles.switchInput}
              checked={discordShareFull}
              onChange={(event) => setDiscordShareFull(event.target.checked)}
            />
            <span
              style={{
                ...styles.switchTrack,
                background: discordShareFull
                  ? "rgba(217, 130, 43, 0.6)"
                  : "rgba(0, 0, 0, 0.18)"
              }}
              aria-hidden="true"
            >
              <span
                style={{
                  ...styles.switchThumb,
                  transform: discordShareFull ? "translateX(20px)" : "translateX(0)"
                }}
              />
            </span>
            <span style={styles.switchCopy}>Share full review content</span>
          </label>
          <p style={styles.helperTextSmall}>
            When off, we only post the title and rating so the crew can vote with reactions.
          </p>
          <div style={styles.discordRow}>
            <input
              style={{ ...styles.input, ...styles.discordInput }}
              value={discordWebhook}
              onChange={(event) => setDiscordWebhook(event.target.value.trim())}
              placeholder="https://discord.com/api/webhooks/..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {discordWebhook && (
              <button
                type="button"
                style={styles.discordButton}
                onClick={() => setDiscordWebhook("")}
              >
                Clear
              </button>
            )}
          </div>
        </section>

        <section style={styles.utilitySection}>
          <h2>Library Tools</h2>
          <button
            style={{
              ...styles.primaryButton,
              opacity: exporting || (books.length === 0 && reviews.length === 0) ? 0.6 : 1,
              cursor:
                exporting || (books.length === 0 && reviews.length === 0)
                  ? "not-allowed"
                  : "pointer"
            }}
            type="button"
            onClick={handleExportLibrary}
            disabled={exporting || (books.length === 0 && reviews.length === 0)}
          >
            {exporting ? "Preparing Export…" : "Export Library JSON"}
          </button>
          <div style={styles.libraryToolIdeas}>
            {FUTURE_LIBRARY_TOOLS.map((tool) => (
              <button
                key={tool.label}
                type="button"
                style={styles.fakeToolButton}
                disabled
                aria-disabled="true"
                title={tool.helper ?? undefined}
              >
                <span>{tool.label}</span>
                {tool.helper ? (
                  <span style={styles.fakeToolHelper}>{tool.helper}</span>
                ) : null}
              </button>
            ))}
          </div>
        </section>
      </div>

      <footer style={styles.footer}>made with love by zayd / cold</footer>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div style={styles.modalOverlay} onClick={closeReviewModal}>
          <div style={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2>
                {reviewModal.existingReview ? "Edit Review" : "Add Review"}
                {reviewModal.book && (
                  <span style={styles.modalBookTitle}>
                    {" "}for "{reviewModal.book.title}"
                    {reviewModal.book.author && ` by ${reviewModal.book.author}`}
                  </span>
                )}
              </h2>
              <button
                type="button"
                style={styles.modalCloseButton}
                onClick={closeReviewModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleModalReviewSubmit} style={styles.modalBody}>
              <label style={styles.label}>
                Reading Status
                <div style={styles.selectContainer}>
                  <select
                    style={{ ...styles.input, ...styles.select }}
                    value={modalReviewForm.status}
                    onChange={(event) =>
                      setModalReviewForm({ ...modalReviewForm, status: event.target.value })
                    }
                    required
                  >
                    {BOOK_STATUS_SECTIONS.map((section) => (
                      <optgroup key={section.label} label={section.label}>
                        {section.options.map((statusOption) => (
                          <option key={statusOption.value} value={statusOption.value}>
                            {statusOption.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <span style={styles.selectArrow} aria-hidden="true">
                    ▾
                  </span>
                </div>
              </label>
              <label style={styles.label}>
                Rating (0-5 stars, decimals allowed)
                <div style={styles.ratingGroup}>
                  <StarRatingInput
                    value={modalReviewForm.rating}
                    onChange={(nextValue) =>
                      setModalReviewForm({ ...modalReviewForm, rating: nextValue })
                    }
                    ariaLabel="Set rating for review"
                  />
                  <div style={styles.ratingInputs}>
                    <div style={{ ...styles.ratingDisplay, ...styles.ratingDisplayInput }}>
                      <input
                        style={styles.ratingDisplayInputField}
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        placeholder="0"
                        inputMode="decimal"
                        value={modalReviewForm.rating}
                        onChange={(event) =>
                          setModalReviewForm({ ...modalReviewForm, rating: event.target.value })
                        }
                        required
                        onBlur={(event) =>
                          setModalReviewForm({
                            ...modalReviewForm,
                            rating: normalizeFiveValue(
                              Number.parseFloat(event.target.value || "0")
                            )
                          })
                        }
                        aria-label="Manually enter rating out of five"
                      />
                      <span style={styles.ratingDisplaySuffix}>/5</span>
                    </div>
                  </div>
                </div>
              </label>
              <label style={styles.label}>
                Review Text
                <textarea
                  style={{ ...styles.input, ...styles.textarea }}
                  value={modalReviewForm.text}
                  onChange={(event) =>
                    setModalReviewForm({ ...modalReviewForm, text: event.target.value })
                  }
                  placeholder="Share your thoughts about this book..."
                  rows={6}
                  autoComplete="off"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </label>
              {reviewModal.book && (
                <LibGenWidget
                  book={reviewModal.book}
                  onTryNextVersion={handleTryNextVersion}
                  ctaMessage={getLibGenCTA(modalReviewForm.status)}
                />
              )}
              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.secondaryButtonMuted}
                  onClick={closeReviewModal}
                >
                  Cancel
                </button>
                <button style={styles.primaryButton} type="submit">
                  {reviewModal.existingReview ? "Update Review" : "Add Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

