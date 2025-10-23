import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  initDB,
  addBook,
  updateBook,
  getBooks,
  getReviews,
  saveReview,
  deleteReviewByBookId,
  deleteReviewById,
  deleteBook
} from "../data/db";
import { spellcheckText } from "../utils/spellcheck";
import { postReviewToDiscord } from "../utils/discord";
import { downloadLibraryJson } from "../utils/export";
import { searchOpenLibrary } from "../data/openLibrary";
import { getCoverUrl, hasCover } from "../utils/covers";

// Placeholder: future UI modules (filters, charts, sync indicators) will mount here.
const THEME = {
  background: "linear-gradient(155deg, var(--autumn-light) 0%, var(--autumn-peach) 28%, rgba(242, 193, 153, 0.88) 60%, rgba(217, 130, 43, 0.92) 100%)",
  backgroundSolid: "var(--espresso)",
  surface: "rgba(249, 223, 198, 0.85)",
  surfaceAlt: "rgba(242, 193, 153, 0.68)",
  border: "rgba(217, 130, 43, 0.42)",
  textPrimary: "var(--bark)",
  textMuted: "rgba(60, 47, 47, 0.72)",
  accent: "var(--burnt-orange)",
  accentHover: "var(--goldenrod)",
  accentSoft: "rgba(242, 193, 153, 0.28)",
  success: "#2F9F63",
  warning: "var(--goldenrod)",
  danger: "var(--cranberry)"
};

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
const BOOK_STATUS_SECTIONS = [
  {
    label: "Plan & Collect",
    options: [
      { value: "wishlist", label: "Wishlist · To discover" },
      { value: "library", label: "Library · Owned, unread" }
    ]
  },
  {
    label: "Reading Journey",
    options: [
      { value: "reading", label: "Currently reading" },
      { value: "re-reading", label: "Re-reading" }
    ]
  },
  {
    label: "Paused",
    options: [{ value: "on-hold", label: "On hold" }]
  },
  {
    label: "Finished & Wrap-up",
    options: [
      { value: "finished", label: "Finished" },
      { value: "did-not-finish", label: "Did not finish" }
    ]
  }
];

const BOOK_STATUSES = BOOK_STATUS_SECTIONS.flatMap((section) => section.options);

const REVIEW_DISABLED_STATUSES = new Set(["wishlist", "library"]);
const UNREAD_STATUSES = new Set(["wishlist", "library", "reading", "on-hold"]);
const STATUS_LABELS = BOOK_STATUSES.reduce((acc, status) => {
  acc[status.value] = status.label;
  return acc;
}, {});

function isUnreadStatus(status) {
  if (!status) {
    return false;
  }

  return UNREAD_STATUSES.has(String(status));
}

const AVAILABILITY_STATUS_COPY = {
  open: "Available to read online",
  borrow_available: "Available to borrow",
  borrow_unavailable: "All copies checked out",
  restricted: "Requires library login or waitlist",
  private: "Not available for digital lending",
  error: "Availability unavailable",
  unknown: "Availability unknown"
};

function describeAvailability(availability) {
  if (!availability) {
    return "";
  }

  let baseLabel = "";

  if (availability.isReadAvailable) {
    baseLabel = AVAILABILITY_STATUS_COPY.open;
  } else if (availability.isBorrowAvailable) {
    baseLabel = AVAILABILITY_STATUS_COPY.borrow_available;
  } else if (availability.status !== "unknown") {
    baseLabel = AVAILABILITY_STATUS_COPY[availability.status] ?? "";
  }

  if (availability.hasDownload) {
    return baseLabel || "Downloads available";
  }

  return baseLabel;
}

function buildAvailabilityActions(availability) {
  if (!availability) {
    return [];
  }

  const actions = [];
  const readUrl = availability.previewUrl ?? availability.openLibraryEditionUrl ?? availability.openLibraryWorkUrl;
  const borrowUrl = availability.borrowUrl ?? availability.openLibraryEditionUrl ?? availability.openLibraryWorkUrl;

  if (availability.isReadAvailable && readUrl) {
    actions.push({
      type: availability.hasDownload ? "download" : "read",
      label: availability.hasDownload ? "Read / Download" : "Read online",
      url: readUrl
    });
  } else if (readUrl) {
    actions.push({ type: "preview", label: "View details", url: readUrl });
  }

  if (availability.isBorrowAvailable && borrowUrl) {
    actions.push({ type: "borrow", label: "Borrow from Open Library", url: borrowUrl });
  } else if (availability.status === "borrow_unavailable" && borrowUrl) {
    actions.push({ type: "waitlist", label: "Join waitlist", url: borrowUrl });
  }

  return actions.filter((action, index, list) => {
    if (!action.url) {
      return false;
    }
    return list.findIndex((item) => item.url === action.url) === index;
  });
}

const STAR_SYMBOL = "★";
const STAR_COUNT = 5;
const PST_TIME_ZONE = "America/Los_Angeles";
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

function normalizeFiveValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  const clamped = Math.min(STAR_COUNT, Math.max(0, value));
  const rounded = Math.round(clamped * 10) / 10;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(/\.0$/, "");
}

function toFiveScale(rating10) {
  if (typeof rating10 !== "number" || Number.isNaN(rating10)) {
    return "";
  }
  return normalizeFiveValue(rating10 / 2);
}

function fromFiveScale(value) {
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return numeric * 2;
}

function formatFiveScaleDisplay(rating10) {
  if (typeof rating10 !== "number" || Number.isNaN(rating10)) {
    return "—";
  }
  const fiveScale = rating10 / 2;
  return `${fiveScale.toFixed(fiveScale % 1 === 0 ? 0 : 1)}/5`;
}

function renderStarRating(rating10) {
  if (typeof rating10 !== "number" || Number.isNaN(rating10)) {
    return null;
  }

  const ratingFive = rating10 / 2;
  const stars = [];

  for (let idx = 1; idx <= STAR_COUNT; idx += 1) {
    if (ratingFive >= idx) {
      stars.push(
        <span key={`star-${idx}`} style={styles.starFull}>
          {STAR_SYMBOL}
        </span>
      );
    } else if (ratingFive >= idx - 0.5) {
      stars.push(
        <span key={`star-${idx}`} style={styles.starHalf}>
          {STAR_SYMBOL}
        </span>
      );
    } else {
      stars.push(
        <span key={`star-${idx}`} style={styles.starEmpty}>
          {STAR_SYMBOL}
        </span>
      );
    }
  }

  return stars;
}

function formatTimestampForDisplay(isoString) {
  if (!isoString) {
    return "";
  }

  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("en-US", {
    timeZone: PST_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short"
  });
}

function StarRatingInput({ value, onChange, ariaLabel }) {
  const [hoverValue, setHoverValue] = useState(null);

  const numericValue = Number.parseFloat(value ?? "0");
  const safeValue = Number.isNaN(numericValue)
    ? 0
    : Math.min(STAR_COUNT, Math.max(0, numericValue));
  const displayValue = hoverValue ?? safeValue;

  function computeValueFromEvent(event, starIndex) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX =
      event.clientX ?? event.nativeEvent?.clientX ?? event.nativeEvent?.touches?.[0]?.clientX;
    if (typeof clientX !== "number") {
      return safeValue;
    }

    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    let computed;

    // Simple 50/50 split: left half = half star, right half = full star
    if (ratio < 0.5) {
      computed = starIndex - 0.5;
    } else {
      computed = starIndex;
    }

    return Math.min(STAR_COUNT, Math.max(0, Number((Math.round(computed * 2) / 2).toFixed(1))));
  }

  function handleHover(event, starIndex) {
    const nextValue = computeValueFromEvent(event, starIndex);
    setHoverValue(nextValue);
  }

  function handleSelect(event, starIndex) {
    const nextValue = computeValueFromEvent(event, starIndex);
    onChange(normalizeFiveValue(nextValue));
    setHoverValue(null);
  }

  function adjustBy(delta) {
    const nextValue = Math.min(STAR_COUNT, Math.max(0, safeValue + delta));
    onChange(normalizeFiveValue(nextValue));
  }

  return (
    <div
      style={styles.starInputWrapper}
      role="radiogroup"
      aria-label={ariaLabel}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const starIndex = index + 1;
        const fill =
          displayValue >= starIndex
            ? "full"
            : displayValue >= starIndex - 0.5
            ? "half"
            : "empty";
        const colourStyle =
          fill === "full"
            ? styles.starFull
            : fill === "half"
            ? styles.starHalf
            : styles.starEmpty;

        return (
          <button
            key={`star-input-${starIndex}`}
            type="button"
            style={{ ...styles.starButton, ...colourStyle }}
            onMouseMove={(event) => handleHover(event, starIndex)}
            onClick={(event) => handleSelect(event, starIndex)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                event.preventDefault();
                adjustBy(-0.5);
              } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                event.preventDefault();
                adjustBy(0.5);
              } else if (event.key === "Home") {
                event.preventDefault();
                onChange("0");
              } else if (event.key === "End") {
                event.preventDefault();
                onChange(String(STAR_COUNT));
              }
            }}
            aria-label={`${starIndex} ${STAR_SYMBOL}`}
            aria-pressed={
              displayValue >= starIndex
                ? "true"
                : displayValue >= starIndex - 0.5
                ? "mixed"
                : "false"
            }
          >
            {STAR_SYMBOL}
          </button>
        );
      })}
    </div>
  );
}

function shouldShowOpenLibraryLink(openLibraryUrl, availabilityActions) {
  if (!openLibraryUrl) {
    return false;
  }

  if (!Array.isArray(availabilityActions) || availabilityActions.length === 0) {
    return true;
  }

  return !availabilityActions.some((action) => action.url === openLibraryUrl);
}

function normalizeForMatch(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function compactForComparison(value) {
  return normalizeForMatch(value).replace(/[\s']/g, "");
}

function extractAuthorCandidates(authorText) {
  if (!authorText) {
    return [];
  }

  return authorText
    .replace(/&/g, ",")
    .replace(/\band\b/gi, ",")
    .split(",")
    .map((part) => normalizeForMatch(part))
    .filter(Boolean);
}

function authorsIntersect(bookAuthors, candidateAuthors) {
  if (!Array.isArray(bookAuthors) || !Array.isArray(candidateAuthors)) {
    return false;
  }

  return bookAuthors.some((author) => {
    if (!author) {
      return false;
    }
    const authorCompact = compactForComparison(author);
    return candidateAuthors.some((candidate) => {
      if (!candidate) {
        return false;
      }

      if (candidate === author) {
        return true;
      }

      const candidateCompact = compactForComparison(candidate);
      if (!candidateCompact || !authorCompact) {
        return false;
      }

      return (
        candidateCompact === authorCompact ||
        candidateCompact.includes(authorCompact) ||
        authorCompact.includes(candidateCompact)
      );
    });
  });
}

async function autoPopulateCoverIfNeeded(book) {
  if (!book?.id || hasCover(book.cover)) {
    return null;
  }

  const title = normalizeForMatch(book.title);
  const authorList = extractAuthorCandidates(book.author);

  if (!title || authorList.length === 0) {
    return false;
  }

  const queryParts = [book.title, book.author].filter(Boolean);
  if (queryParts.length === 0) {
    return false;
  }

  try {
    const results = await searchOpenLibrary(queryParts.join(" "), { limit: 10 });
    const match = results.find((result) => {
      if (!result?.cover) {
        return false;
      }

      const resultTitle = normalizeForMatch(result.title);
      if (!resultTitle || resultTitle !== title) {
        return false;
      }

      const candidateAuthors = extractAuthorCandidates(result.author);
      if (candidateAuthors.length === 0) {
        return false;
      }

      return authorsIntersect(authorList, candidateAuthors);
    });

    if (!match) {
      return null;
    }

    const updatedBook = {
      ...book,
      cover: match.cover ? { ...match.cover } : book.cover,
      openLibraryUrl: book.openLibraryUrl ?? match.openLibraryUrl ?? null,
      openLibraryIdentifiers: book.openLibraryIdentifiers ?? match.identifiers ?? null,
      availability: book.availability ?? match.availability ?? null,
      titleLower: book.title ? book.title.toLowerCase() : null,
      authorLower: book.author ? book.author.toLowerCase() : null,
      updatedAt: new Date().toISOString()
    };

    await updateBook(updatedBook);
    return updatedBook;
  } catch (error) {
    console.error("Failed to auto-populate cover from Open Library", error);
    return null;
  }
}

const DEFAULT_STATUS = "finished";

const emptyBookForm = {
  title: "",
  author: "",
  status: DEFAULT_STATUS,
  cover: null,
  openLibraryUrl: "",
  openLibraryIdentifiers: null,
  availability: null
};

function createReviewDraft(status = DEFAULT_STATUS) {
  return {
    rating: "",
    text: "",
    autoCorrect: true,
    status
  };
}

const emptyReviewForm = {
  bookId: "",
  rating: "",
  text: "",
  autoCorrect: true,
  status: DEFAULT_STATUS
};
const DISCORD_STORAGE_KEY = "brtDiscordWebhook";
const DISCORD_SHARE_MODE_KEY = "brtDiscordShareFull";
const emptyReviewDraft = createReviewDraft();

function applyBookUpdateToList(list, updatedBook) {
  if (!updatedBook?.id) {
    return list;
  }

  let changed = false;
  const next = list.map((entry) => {
    if (entry.id === updatedBook.id) {
      changed = true;
      return { ...entry, ...updatedBook };
    }
    return entry;
  });

  return changed ? next : list;
}

function Logo() {
  return (
    <div style={styles.logoWrapper}>
      <div style={styles.logoIcon} aria-hidden="true">
        <svg
          width="72"
          height="64"
          viewBox="0 0 72 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="book-spine" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#F2C199" />
              <stop offset="100%" stopColor="#D9822B" />
            </linearGradient>
            <linearGradient id="book-cover" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF5EC" />
              <stop offset="100%" stopColor="#F9DFC6" />
            </linearGradient>
            <linearGradient id="bookmark" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#A73636" />
              <stop offset="100%" stopColor="#6e2121" />
            </linearGradient>
          </defs>
          <rect x="6" y="10" width="18" height="46" rx="4" fill="url(#book-cover)" />
          <rect x="26" y="8" width="20" height="48" rx="4" fill="url(#book-spine)" />
          <rect x="48" y="14" width="18" height="42" rx="4" fill="#F4E2CF" />
          <rect x="9" y="16" width="12" height="2.4" rx="1.2" fill="#D9822B" opacity="0.8" />
          <rect x="9" y="24" width="12" height="2.4" rx="1.2" fill="#D9822B" opacity="0.65" />
          <rect x="9" y="32" width="12" height="2.4" rx="1.2" fill="#D9822B" opacity="0.5" />
          <rect x="30" y="18" width="12" height="2.4" rx="1.2" fill="#FDF2E6" opacity="0.9" />
          <rect x="30" y="28" width="12" height="2.4" rx="1.2" fill="#FDF2E6" opacity="0.8" />
          <rect x="30" y="38" width="12" height="2.4" rx="1.2" fill="#FDF2E6" opacity="0.7" />
          <rect x="52" y="20" width="10" height="2.2" rx="1.1" fill="#D9822B" opacity="0.7" />
          <rect x="52" y="28" width="10" height="2.2" rx="1.1" fill="#D9822B" opacity="0.55" />
          <rect x="52" y="36" width="10" height="2.2" rx="1.1" fill="#D9822B" opacity="0.4" />
          <path
            d="M44 8 L44 0 L52 6"
            fill="url(#bookmark)"
            stroke="#6e2121"
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <ellipse cx="36" cy="54" rx="28" ry="5" fill="rgba(60, 47, 47, 0.18)" />
        </svg>
      </div>
      <div style={styles.logoTextGroup}>
        <span style={styles.logoTitle}>Book Review Tracker</span>
        <span style={styles.logoSubtitle}>a cozy corner for every chapter</span>
      </div>
    </div>
  );
}

function ToastOverlay({ toast, onDismiss }) {
  if (!toast) {
    return null;
  }

  if (typeof document === "undefined") {
    return null;
  }

  const toneStyle =
    toast.tone === "success"
      ? styles.toastSuccess
      : toast.tone === "error" || toast.tone === "danger"
      ? styles.toastDanger
      : toast.tone === "warning"
      ? styles.toastWarning
      : styles.toastInfo;

  return createPortal(
    <div
      style={{
        ...styles.toast,
        ...toneStyle
      }}
      role={toast.tone === "error" || toast.tone === "danger" ? "alert" : "status"}
      aria-live={toast.tone === "error" || toast.tone === "danger" ? "assertive" : "polite"}
    >
      <span>{toast.text}</span>
      <button
        type="button"
        onClick={onDismiss}
        style={styles.toastDismiss}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>,
    document.body
  );
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
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
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
  const isEditingBook = Boolean(editingBookFormId);

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
        await mergeSampleLibrary();
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

  useEffect(() => {
    const originalBackground = document.body.style.background;
    const originalBackgroundColor = document.body.style.backgroundColor;
    const originalBackgroundAttachment = document.body.style.backgroundAttachment;
    const originalColor = document.body.style.color;

    document.body.style.background = THEME.background;
    document.body.style.backgroundColor = THEME.backgroundSolid;
    document.body.style.backgroundAttachment = "fixed";
    document.body.style.color = THEME.textPrimary;
    document.body.style.transition = "background 0.3s ease";

    return () => {
      document.body.style.background = originalBackground;
      document.body.style.backgroundColor = originalBackgroundColor;
      document.body.style.backgroundAttachment = originalBackgroundAttachment;
      document.body.style.color = originalColor;
    };
  }, []);

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
        `${result.removedDuplicateReviews} duplicate review${
          result.removedDuplicateReviews === 1 ? "" : "s"
        } removed`
      );
    }

    if (result.trimmedOverflowReviews > 0) {
      segments.push(
        `${result.trimmedOverflowReviews} extra review${
          result.trimmedOverflowReviews === 1 ? "" : "s"
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
        text: existingReview.text ?? "",
        autoCorrect: true
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

    const cleanText = modalReviewForm.autoCorrect
      ? spellcheckText(modalReviewForm.text)
      : modalReviewForm.text;

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

  async function handleAddBook(event) {
    event.preventDefault();
    if (!bookForm.title.trim()) {
      showToast("Title is required.", "error");
      return;
    }

    const wantsReview =
      addReviewWithBook && !REVIEW_DISABLED_STATUSES.has(bookForm.status);
    const reviewStatusSelection =
      bookReviewDraft.status || bookForm.status || DEFAULT_STATUS;
    const effectiveStatus = wantsReview ? reviewStatusSelection : bookForm.status || DEFAULT_STATUS;

    if (wantsReview) {
      const ratingValueFive = Number.parseFloat(bookReviewDraft.rating);
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
    if (hasCover(bookForm.cover)) {
      const rawValue = String(bookForm.cover.value ?? "").trim();
      if (rawValue) {
        coverData = { ...bookForm.cover, value: rawValue };
      }
    }

    const newBookBase = {
      title: bookForm.title.trim(),
      author: bookForm.author.trim(),
      status: effectiveStatus,
      unread: isUnreadStatus(effectiveStatus),
      cover: coverData,
      openLibraryUrl: bookForm.openLibraryUrl ? bookForm.openLibraryUrl : null,
      openLibraryIdentifiers: bookForm.openLibraryIdentifiers,
      availability: bookForm.availability,
      titleLower: bookForm.title.trim().toLowerCase(),
      authorLower: bookForm.author ? bookForm.author.trim().toLowerCase() : null,
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
          const ratingFiveScale = Number.parseFloat(bookReviewDraft.rating);
          const ratingTenScale = fromFiveScale(ratingFiveScale);
          const cleanText = bookReviewDraft.autoCorrect
            ? spellcheckText(bookReviewDraft.text)
            : bookReviewDraft.text;

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

    const cleanText = reviewForm.autoCorrect
      ? spellcheckText(reviewForm.text)
      : reviewForm.text;

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
      return;
    }

    try {
      setSearching(true);
      setSearchError("");
      const results = await searchOpenLibrary(query);
      setSearchResults(results);
      if (results.length === 0) {
        setSearchError("No matches found. Try another search term.");
      }
    } catch (error) {
      console.error("OpenLibrary search failed", error);
      setSearchError("Could not reach OpenLibrary. Please try again later.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }

  function handleApplySearchResult(result) {
    const cover = result.cover
      ? { ...result.cover, value: String(result.cover.value ?? "") }
      : null;

    setBookForm((prev) => ({
      ...prev,
      title: result.title ?? prev.title ?? "",
      author: result.author ?? prev.author ?? "",
      cover: cover ?? prev.cover ?? null,
      openLibraryUrl: result.openLibraryUrl ?? prev.openLibraryUrl ?? "",
      openLibraryIdentifiers: result.identifiers ?? prev.openLibraryIdentifiers ?? null,
      availability: result.availability ?? prev.availability ?? null,
      status: prev.status
    }));
    setSearchQuery(result.title ?? "");
    setSearchResults([]);
    showToast(`Loaded "${result.title ?? "Book"}" from OpenLibrary.`, "info");
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

  const coverPreviewUrl = getCoverUrl(bookForm.cover, "M");
  const coverTypeValue = bookForm.cover?.type ?? "";
  const coverValueInput = bookForm.cover?.value ?? "";

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

      <main style={styles.main}>
        <section style={styles.card}>
          <h2>Add Book</h2>
          <form onSubmit={handleSearch} style={styles.searchForm}>
            <input
              style={styles.input}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search OpenLibrary (title, author, ISBN)"
            />
            <button style={styles.searchButton} type="submit" disabled={searching}>
              {searching ? "Searching…" : "Search"}
            </button>
          </form>
          {searchError && <p style={styles.error}>{searchError}</p>}
          {searchResults.length > 0 && (
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
          <form onSubmit={handleAddBook} style={styles.form}>
            <label style={styles.label}>
              Title
              <input
                style={styles.input}
                value={bookForm.title}
                onChange={(event) =>
                  setBookForm({ ...bookForm, title: event.target.value })
                }
                placeholder="The Left Hand of Darkness"
                required
              />
            </label>
            <label style={styles.label}>
              Author
              <input
                style={styles.input}
                value={bookForm.author}
                onChange={(event) =>
                  setBookForm({ ...bookForm, author: event.target.value })
                }
                placeholder="Ursula K. Le Guin"
              />
            </label>
            <div style={styles.inlineRow}>
              {!isEditingBook && (
                <label style={{ ...styles.label, ...styles.inlineField }}>
                  Status
                  <div style={styles.selectContainer}>
                    <select
                      style={{ ...styles.input, ...styles.select }}
                      value={bookForm.status}
                      onChange={handleBookStatusChange}
                    >
                      {BOOK_STATUS_SECTIONS.map((section) => (
                        <optgroup key={section.label} label={section.label}>
                          {section.options.map((status) => (
                            <option key={status.value} value={status.value}>
                              {status.label}
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
              )}
              <div style={{ ...styles.inlineField, ...styles.inlineFieldCompact }}>
                <label style={styles.label}>
                  Cover Source (optional)
                  <div style={styles.selectContainer}>
                    <select
                      style={{ ...styles.input, ...styles.select }}
                      value={coverTypeValue}
                      onChange={handleCoverTypeChange}
                    >
                      <option value="">No cover</option>
                      <option value="id">OpenLibrary Cover ID</option>
                      <option value="isbn">ISBN</option>
                      <option value="olid">OpenLibrary Edition (OLID)</option>
                      <option value="lccn">LCCN</option>
                      <option value="oclc">OCLC</option>
                      <option value="url">Direct Image URL</option>
                    </select>
                    <span style={styles.selectArrow} aria-hidden="true">
                      ▾
                    </span>
                  </div>
                </label>
                {coverTypeValue && (
                  <label style={styles.label}>
                    {coverTypeValue === "url" ? "Cover URL" : "Cover Value"}
                    <input
                      style={styles.input}
                      value={coverValueInput}
                      onChange={handleCoverValueChange}
                      placeholder={
                        coverTypeValue === "url"
                          ? "https://example.com/cover.jpg"
                          : "Enter the corresponding identifier"
                      }
                    />
                  </label>
                )}
              </div>
            </div>
            {coverPreviewUrl && (
              <div style={styles.coverPreview}>
                <img
                  src={coverPreviewUrl}
                  alt={`Cover preview for ${bookForm.title || "selected book"}`}
                  style={styles.coverImage}
                />
                <div style={styles.coverPreviewMeta}>
                  {bookForm.openLibraryUrl && (
                    <a
                      href={bookForm.openLibraryUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.coverLink}
                    >
                      View on Open Library
                    </a>
                  )}
                  <button
                    type="button"
                    style={styles.smallButton}
                    onClick={handleClearCover}
                  >
                    Remove Cover
                  </button>
                </div>
              </div>
            )}
            {!isEditingBook && (
              <>
                <label style={styles.toggleRow}>
                  <input
                    type="checkbox"
                    checked={addReviewWithBook}
                    onChange={(event) => {
                      const checked = event.target.checked;
                      setAddReviewWithBook(checked);
                      if (!checked) {
                        setBookReviewDraft(createReviewDraft(bookForm.status));
                      }
                    }}
                    disabled={REVIEW_DISABLED_STATUSES.has(bookForm.status)}
                  />
                  <span>
                    {REVIEW_DISABLED_STATUSES.has(bookForm.status)
                      ? "Reviews are disabled for unread or wishlist books."
                      : "Add a review at the same time"}
                  </span>
                </label>
                {addReviewWithBook && !REVIEW_DISABLED_STATUSES.has(bookForm.status) && (
                  <div style={styles.inlineReview}>
                    <label style={styles.label}>
                      Reading Status
                      <div style={styles.selectContainer}>
                        <select
                          style={{ ...styles.input, ...styles.select }}
                          value={bookReviewDraft.status}
                          onChange={(event) => {
                            const nextStatus = event.target.value;
                            setBookForm((prev) => ({
                              ...prev,
                              status: nextStatus
                            }));

                            if (REVIEW_DISABLED_STATUSES.has(nextStatus)) {
                              setAddReviewWithBook(false);
                              setBookReviewDraft(createReviewDraft(nextStatus));
                              return;
                            }

                            setBookReviewDraft({
                              ...bookReviewDraft,
                              status: nextStatus
                            });
                          }}
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
                          value={bookReviewDraft.rating}
                          onChange={(nextValue) =>
                            setBookReviewDraft({
                              ...bookReviewDraft,
                              rating: nextValue
                            })
                          }
                          ariaLabel="Set rating for new book"
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
                              value={bookReviewDraft.rating}
                              onChange={(event) =>
                                setBookReviewDraft({
                                  ...bookReviewDraft,
                                  rating: event.target.value
                                })
                              }
                              onBlur={(event) =>
                                setBookReviewDraft({
                                  ...bookReviewDraft,
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
                        value={bookReviewDraft.text}
                        onChange={(event) =>
                          setBookReviewDraft({
                            ...bookReviewDraft,
                            text: event.target.value
                          })
                        }
                        placeholder="Share your thoughts while it's fresh."
                      />
                    </label>
                    <label style={styles.inlineToggle}>
                      <input
                        type="checkbox"
                        checked={bookReviewDraft.autoCorrect}
                        onChange={(event) =>
                          setBookReviewDraft({
                            ...bookReviewDraft,
                            autoCorrect: event.target.checked
                          })
                        }
                      />
                      Auto-correct obvious typos
                    </label>
                  </div>
                )}
              </>
            )}
            <button style={styles.primaryButton} type="submit">
              Save Book
            </button>
          </form>
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
                />
              </label>
              <label style={{ ...styles.label, flexDirection: "row", gap: 8 }}>
                <input
                  type="checkbox"
                  checked={modalReviewForm.autoCorrect}
                  onChange={(event) =>
                    setModalReviewForm({ ...modalReviewForm, autoCorrect: event.target.checked })
                  }
                />
                Auto-correct obvious typos
              </label>
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

const styles = {
  wrapper: {
    fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif",
    margin: "0 auto",
    padding: "3.2rem 2.6rem 4.2rem",
    maxWidth: "1240px",
    color: THEME.textPrimary,
    background: "rgba(249, 223, 198, 0.72)",
    borderRadius: "2rem",
    boxShadow: "0 38px 72px rgba(44, 30, 30, 0.32)",
    backdropFilter: "blur(28px)",
    minHeight: "92vh",
    transition: "color 0.3s ease, background 0.3s ease"
  },
  header: {
    marginBottom: "2.6rem",
    textAlign: "center",
    maxWidth: "760px",
    marginLeft: "auto",
    marginRight: "auto"
  },
  logoWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1.2rem",
    marginBottom: "1.1rem",
    flexWrap: "wrap"
  },
  logoIcon: {
    width: "78px",
    height: "68px",
    borderRadius: "20px",
    background:
      "radial-gradient(circle at 30% 20%, rgba(255,245,236,0.9), rgba(242,193,153,0.35) 70%)",
    boxShadow: "0 18px 32px rgba(44, 30, 30, 0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.45rem"
  },
  logoTextGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "0.2rem"
  },
  logoTitle: {
    fontFamily:
      '"Lucida Handwriting","Brush Script MT","Segoe Script","Snell Roundhand","cursive"',
    fontSize: "2.1rem",
    color: THEME.burntOrange,
    textShadow: "0 2px 6px rgba(217, 130, 43, 0.25)",
    letterSpacing: "0.04em"
  },
  logoSubtitle: {
    fontSize: "0.95rem",
    color: THEME.textMuted,
    fontWeight: 500,
    fontStyle: "italic"
  },
  headerActions: {
    marginTop: "1.4rem",
    display: "flex",
    justifyContent: "center",
    gap: "0.75rem",
    flexWrap: "wrap"
  },
  coverRefreshButton: {
    background: "rgba(249, 223, 198, 0.28)",
    border: `1px solid ${THEME.accent}`,
    color: THEME.accent,
    padding: "0.65rem 1.4rem",
    borderRadius: "999px",
    fontSize: "0.92rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.2s ease, color 0.2s ease, opacity 0.2s ease"
  },
  coverRefreshButtonDisabled: {
    opacity: 0.6,
    cursor: "not-allowed"
  },
  warning: {
    color: THEME.warning
  },
  toast: {
    position: "fixed",
    top: "1.1rem",
    right: "1.4rem",
    left: "50%",
    transform: "translateX(-50%)",
    pointerEvents: "auto",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "0.7rem",
    padding: "0.9rem 1.4rem",
    borderRadius: "1.4rem",
    border: "2px solid rgba(217, 130, 43, 0.55)",
    boxShadow: "0 26px 48px rgba(44, 30, 30, 0.32)",
    backgroundColor: "rgba(249, 223, 198, 0.52)",
    backdropFilter: "blur(22px)",
    color: THEME.textPrimary,
    fontSize: "0.95rem",
    lineHeight: 1.25,
    maxWidth: "min(520px, 90vw)",
    textAlign: "center",
    transition: "transform 0.2s ease, opacity 0.2s ease"
  },
  toastInfo: {
    borderColor: "rgba(217, 130, 43, 0.45)",
    boxShadow: "0 22px 44px rgba(95, 64, 40, 0.28)"
  },
  toastSuccess: {
    backgroundColor: "rgba(47, 159, 99, 0.52)",
    color: "#0c2f1e",
    borderColor: "rgba(47, 159, 99, 0.9)",
    boxShadow: "0 28px 58px rgba(21, 83, 52, 0.45)"
  },
  toastWarning: {
    backgroundColor: "rgba(229, 182, 89, 0.56)",
    color: "#422f12",
    borderColor: "rgba(229, 182, 89, 0.92)",
    boxShadow: "0 28px 58px rgba(140, 101, 38, 0.44)"
  },
  toastDanger: {
    backgroundColor: "rgba(167, 54, 54, 0.54)",
    color: "#fff4f2",
    borderColor: "rgba(167, 54, 54, 0.92)",
    boxShadow: "0 28px 58px rgba(88, 26, 26, 0.45)"
  },
  toastDismiss: {
    background: "transparent",
    border: "none",
    color: "inherit",
    fontSize: "1.1rem",
    cursor: "pointer",
    lineHeight: 1,
    padding: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  main: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.6rem",
    alignItems: "stretch",
    justifyContent: "center",
    width: "100%",
    boxSizing: "border-box"
  },
  card: {
    borderRadius: "1.5rem",
    padding: "1.85rem",
    backgroundColor: THEME.surface,
    border: "1px solid transparent",
    backgroundImage:
      `linear-gradient(${THEME.surface}, ${THEME.surface}), ` +
      "linear-gradient(135deg, rgba(217,130,43,0.35), rgba(249,223,198,0.6))",
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "padding-box, border-box",
    boxShadow: "0 26px 52px rgba(44, 30, 30, 0.22)",
    backdropFilter: "blur(24px)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    position: "relative",
    overflow: "hidden",
    width: "100%",
    maxWidth: "520px",
    flex: "1 1 360px",
    display: "flex",
    flexDirection: "column",
    gap: "1.15rem"
  },
  searchForm: {
    display: "flex",
    gap: "0.65rem",
    marginBottom: "1rem",
    alignItems: "stretch"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem"
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    fontSize: "0.95rem",
    color: THEME.textPrimary
  },
  input: {
    borderRadius: "0.85rem",
    border: `1px solid rgba(217, 130, 43, 0.38)`,
    padding: "0.95rem 1.05rem",
    fontSize: "1.02rem",
    background: THEME.surfaceAlt,
    color: THEME.textPrimary,
    transition: "border 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 6px 18px rgba(67, 38, 22, 0.18)",
    width: "100%",
    boxSizing: "border-box",
    outline: "none"
  },
  textarea: {
    resize: "vertical",
    minHeight: "100px"
  },
  selectContainer: {
    position: "relative",
    display: "flex",
    width: "100%"
  },
  select: {
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    paddingRight: "3rem",
    backgroundImage:
      "linear-gradient(160deg, rgba(217,130,43,0.18), rgba(249,223,198,0.08))",
    cursor: "pointer"
  },
  selectArrow: {
    position: "absolute",
    top: "50%",
    right: "1.2rem",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    fontSize: "0.85rem",
    color: THEME.accent
  },
  searchButton: {
    background: THEME.accentSoft,
    color: THEME.accent,
    border: `1px solid ${THEME.accent}`,
    borderRadius: "0.9rem",
    padding: "0.75rem 1.1rem",
    cursor: "pointer",
    fontWeight: 600,
    alignSelf: "stretch",
    transition: "border 0.2s ease, background 0.2s ease",
    minWidth: "120px",
    textAlign: "center"
  },
  primaryButton: {
    background: "linear-gradient(135deg, #F2C199, #D9822B)",
    color: "#2C1E1E",
    border: `1px solid rgba(217, 130, 43, 0.5)`,
    borderRadius: "1rem",
    padding: "0.85rem 1.4rem",
    cursor: "pointer",
    fontWeight: 600,
    transition: "transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
    boxShadow: "0 12px 24px rgba(144, 82, 23, 0.28)",
    alignSelf: "flex-start"
  },
  secondaryButtonMuted: {
    background: "transparent",
    color: THEME.textMuted,
    border: `1px solid rgba(46, 26, 18, 0.2)`,
    borderRadius: "999px",
    padding: "0.4rem 0.85rem",
    cursor: "pointer",
    transition: "border 0.2s ease, background 0.2s ease"
  },
  coverControls: {
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem"
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.92rem",
    color: THEME.textMuted
  },
  inlineRow: {
    display: "flex",
    gap: "0.9rem",
    flexWrap: "wrap"
  },
  inlineField: {
    flex: "1 1 200px"
  },
  inlineFieldCompact: {
    maxWidth: "320px"
  },
  inlineReview: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    padding: "1rem",
    border: `1px dashed rgba(217, 130, 43, 0.32)`,
    borderRadius: "1rem",
    background: THEME.surfaceAlt
  },
  ratingGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    background: "rgba(249, 223, 198, 0.42)",
    borderRadius: "0.85rem",
    padding: "0.75rem"
  },
  ratingInputs: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5rem",
    width: "100%"
  },
  ratingDisplay: {
    fontSize: "0.95rem",
    color: THEME.accent,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.75rem",
    border: `1px solid rgba(217, 130, 43, 0.38)`,
    background: "rgba(242, 193, 153, 0.2)",
    padding: "0.45rem 1.1rem",
    minWidth: "120px",
    fontWeight: 600,
    textAlign: "center",
    boxShadow: "0 6px 14px rgba(144, 82, 23, 0.2)",
    minHeight: "48px"
  },
  ratingDisplayInput: {
    cursor: "text",
    gap: "0.25rem"
  },
  ratingDisplayInputField: {
    width: "60px",
    fontSize: "1.1rem",
    fontWeight: 600,
    color: THEME.accent,
    background: "transparent",
    border: "none",
    textAlign: "center",
    outline: "none",
    padding: 0,
    margin: 0,
    appearance: "textfield",
    WebkitAppearance: "none",
    MozAppearance: "textfield"
  },
  ratingDisplaySuffix: {
    fontSize: "0.85rem",
    color: THEME.accent,
    opacity: 0.85
  },
  inlineToggle: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.9rem",
    color: THEME.textMuted
  },
  coverPreview: {
    display: "flex",
    gap: "1rem",
    alignItems: "center"
  },
  coverImage: {
    width: "96px",
    height: "144px",
    objectFit: "cover",
    borderRadius: "0.75rem",
    border: `1px solid rgba(217, 130, 43, 0.25)`,
    background: "rgba(249, 223, 198, 0.42)"
  },
  coverPreviewMeta: {
    display: "flex",
    flexDirection: "column",
    gap: "0.35rem"
  },
  smallButton: {
    background: THEME.accentSoft,
    border: `1px solid rgba(217, 130, 43, 0.52)`,
    borderRadius: "0.9rem",
    padding: "0.4rem 0.95rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    color: THEME.accent,
    fontWeight: 600,
    transition: "border 0.2s ease, background 0.2s ease, color 0.2s ease"
  },
  dangerButton: {
    background: "rgba(226, 70, 82, 0.12)",
    border: `1px solid ${THEME.danger}`,
    color: THEME.danger,
    borderRadius: "0.9rem",
    padding: "0.4rem 0.95rem",
    fontSize: "0.82rem",
    cursor: "pointer",
    marginLeft: "0.55rem",
    fontWeight: 600
  },
  helperText: {
    fontSize: "0.9rem",
    color: THEME.textMuted,
    marginBottom: "0.9rem"
  },
  helperTextSmall: {
    fontSize: "0.8rem",
    color: THEME.textMuted,
    marginTop: "-0.25rem"
  },
  discordRow: {
    display: "flex",
    gap: "0.65rem",
    alignItems: "center"
  },
  discordInput: {
    flex: 1,
    minWidth: 0
  },
  discordButton: {
    background: THEME.accentSoft,
    color: THEME.accent,
    border: `1px solid ${THEME.accent}`,
    borderRadius: "0.9rem",
    padding: "0.6rem 0.9rem",
    cursor: "pointer",
    transition: "border 0.2s ease, background 0.2s ease"
  },
  discordSection: {
    marginTop: 0,
    padding: "1.4rem 1.6rem",
    border: "1px solid transparent",
    borderRadius: "1.4rem",
    backgroundColor: THEME.surface,
    backgroundImage:
      `linear-gradient(${THEME.surface}, ${THEME.surface}), ` +
      "linear-gradient(120deg, rgba(217,130,43,0.54), rgba(242,193,153,0.48))",
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "padding-box, border-box",
    boxShadow: "0 20px 40px rgba(67, 38, 22, 0.3)",
    backdropFilter: "blur(18px)",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
    flex: "1 1 320px",
    position: "relative",
    overflow: "hidden"
  },
  switchLabel: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    cursor: "pointer",
    userSelect: "none"
  },
  switchInput: {
    display: "none"
  },
  switchTrack: {
    position: "relative",
    width: "44px",
    height: "24px",
    borderRadius: "999px",
    background: "rgba(0,0,0,0.15)",
    transition: "background 0.2s ease"
  },
  switchThumb: {
    position: "absolute",
    top: "3px",
    left: "3px",
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "white",
    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
    transition: "transform 0.2s ease",
    transform: "translateX(0)"
  },
  switchCopy: {
    fontSize: "0.85rem",
    color: THEME.textMuted
  },
  utilityGrid: {
    display: "flex",
    flexWrap: "wrap",
    gap: "1.4rem",
    marginTop: "2.4rem",
    width: "100%"
  },
  listSection: {
    marginTop: "2.6rem"
  },
  list: {
    listStyle: "none",
    padding: 0,
    display: "flex",
    flexDirection: "column",
    gap: "1.1rem"
  },
  listItem: {
    border: `1px solid ${THEME.border}`,
    borderRadius: "1.2rem",
    padding: "1.1rem",
    background: THEME.surface,
    display: "flex",
    gap: "1.1rem",
    alignItems: "flex-start",
    boxShadow: "0 22px 46px rgba(44, 30, 30, 0.18)"
  },
  meta: {
    fontSize: "0.85rem",
    color: THEME.textMuted
  },
  reviewList: {
    marginTop: "0.5rem",
    paddingLeft: "1rem"
  },
  reviewHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    flexWrap: "wrap"
  },
  starRow: {
    display: "inline-flex",
    gap: "0.08rem",
    fontSize: "2rem",
    color: THEME.accent,
    userSelect: "none"
  },
  starInputWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.18rem",
    padding: "0.25rem 0 0.35rem",
    width: "66%",
    maxWidth: "360px",
    minWidth: "200px",
    margin: "-0.25rem auto 0"
  },
  starButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "2.9rem",
    lineHeight: 1,
    padding: "0.22rem 0.14rem",
    flex: "1 1 0%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  starFull: {
    color: THEME.accent,
    WebkitTextStroke: "1px rgba(44, 30, 30, 0.4)",
    textShadow: "0 0 2px rgba(44, 30, 30, 0.28)"
  },
  starHalf: {
    display: "inline-block",
    backgroundImage: "repeating-linear-gradient(135deg, #D9822B 0 3px, #FFF5EC 3px 6px)",
    color: "transparent",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    WebkitTextStroke: "1px rgba(44, 30, 30, 0.4)",
    textShadow: "0 0 2px rgba(44, 30, 30, 0.28)"
  },
  starEmpty: {
    color: "rgba(60, 47, 47, 0.25)",
    display: "inline-block",
    WebkitTextStroke: "1px rgba(44, 30, 30, 0.3)",
    textShadow: "0 0 2px rgba(44, 30, 30, 0.22)"
  },
  reviewScore: {
    fontSize: "0.85rem",
    color: THEME.textPrimary,
    fontWeight: 600
  },
  reviewScoreSmall: {
    fontSize: "0.75rem",
    color: THEME.textMuted
  },
  reviewStatusBadge: {
    fontSize: "0.72rem",
    color: THEME.accent,
    background: "rgba(217, 130, 43, 0.18)",
    borderRadius: "999px",
    padding: "0.18rem 0.55rem",
    fontWeight: 600
  },
  reviewTimestamp: {
    fontSize: "0.7rem",
    color: THEME.textMuted,
    marginLeft: "auto"
  },
  reviewActions: {
    marginTop: "0.4rem"
  },
  badge: {
    display: "inline-block",
    background: THEME.accent,
    color: "#3b2618",
    padding: "0.25rem 0.65rem",
    borderRadius: "999px",
    fontSize: "0.78rem",
    marginBottom: "0.75rem",
    fontWeight: 600
  },
  badgeSecondary: {
    display: "inline-block",
    marginLeft: "0.5rem",
    background: "rgba(229, 182, 89, 0.22)",
    color: "#8f5a1f",
    padding: "0.15rem 0.55rem",
    borderRadius: "999px",
    fontSize: "0.74rem"
  },
  utilitySection: {
    marginTop: 0,
    padding: "1.25rem",
    border: "1px solid transparent",
    borderRadius: "1.2rem",
    backgroundColor: THEME.surface,
    backgroundImage:
      `linear-gradient(${THEME.surface}, ${THEME.surface}), ` +
      "linear-gradient(120deg, rgba(217,130,43,0.32), rgba(249,223,198,0.5))",
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "padding-box, border-box",
    display: "flex",
    flexDirection: "column",
    gap: "0.9rem",
    boxShadow: "0 24px 48px rgba(44, 30, 30, 0.22)",
    flex: "1 1 220px",
    maxWidth: "360px",
    position: "relative",
    overflow: "hidden"
  },
  error: {
    color: THEME.danger,
    fontSize: "0.85rem"
  },
  searchResults: {
    listStyle: "none",
    padding: 0,
    margin: "0 0 1.1rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  searchResultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.9rem",
    padding: "0.75rem 0.85rem",
    border: `1px solid ${THEME.border}`,
    borderRadius: "1rem",
    background: THEME.surface,
    boxShadow: "0 18px 38px rgba(58,28,16,0.28)"
  },
  coverLink: {
    color: THEME.accent,
    fontSize: "0.85rem"
  },
  searchResultContent: {
    display: "flex",
    gap: "0.75rem",
    alignItems: "center"
  },
  searchResultCover: {
    width: "48px",
    height: "72px",
    objectFit: "cover",
    borderRadius: "0.55rem",
    border: `1px solid rgba(217, 130, 43, 0.25)`,
    background: "rgba(249, 223, 198, 0.42)"
  },
  searchResultCoverPlaceholder: {
    width: "48px",
    height: "72px",
    borderRadius: "0.55rem",
    border: `1px dashed rgba(217,130,43,0.45)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    color: THEME.textMuted,
    background: THEME.surfaceAlt
  },
  searchResultActions: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "0.4rem"
  },
  availability: {
    marginTop: "0.35rem",
    display: "flex",
    gap: "0.35rem",
    flexWrap: "wrap"
  },
  availabilityBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.2rem 0.5rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    background: "rgba(242, 193, 153, 0.24)",
    color: THEME.accent,
    fontWeight: 500
  },
  downloadBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.2rem 0.55rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    background: "rgba(47, 159, 99, 0.18)",
    color: THEME.success,
    fontWeight: 500,
    marginLeft: "0.35rem"
  },
  availabilityAction: {
    fontSize: "0.75rem",
    color: THEME.accent
  },
  availabilityActionRead: {
    color: THEME.success
  },
  availabilityActionDownload: {
    color: THEME.success
  },
  availabilityActionBorrow: {
    color: THEME.warning
  },
  availabilityActionWaitlist: {
    color: "#cfa0e9"
  },
  availabilityActionsList: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.35rem",
    marginTop: "0.35rem"
  },
  bookActions: {
    display: "flex",
    gap: "0.5rem",
    marginTop: "0.6rem",
    flexWrap: "wrap"
  },
  libraryCover: {
    width: "96px",
    height: "144px",
    objectFit: "cover",
    borderRadius: "0.8rem",
    border: `1px solid rgba(217, 130, 43, 0.25)`,
    background: "rgba(249, 223, 198, 0.4)"
  },
  libraryCoverPlaceholder: {
    width: "96px",
    height: "144px",
    borderRadius: "0.8rem",
    border: `1px dashed rgba(217,130,43,0.45)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.8rem",
    color: THEME.textMuted,
    background: THEME.surfaceAlt
  },
  bookContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  libraryToolIdeas: {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.6rem",
    marginTop: "0.5rem",
    justifyContent: "center"
  },
  fakeToolButton: {
    background: "rgba(242, 193, 153, 0.18)",
    border: `1px dashed rgba(217, 130, 43, 0.5)`,
    borderRadius: "0.9rem",
    padding: "0.6rem 1.1rem",
    fontSize: "0.82rem",
    color: THEME.accent,
    fontWeight: 600,
    cursor: "not-allowed",
    opacity: 0.8,
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
    alignItems: "center",
    textAlign: "center",
    minWidth: "180px"
  },
  fakeToolHelper: {
    fontSize: "0.72rem",
    color: THEME.textMuted,
    fontWeight: 500,
    maxWidth: "160px",
    lineHeight: 1.2
  },
  footer: {
    marginTop: "3rem",
    textAlign: "center",
    fontSize: "0.85rem",
    color: THEME.textMuted
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
    padding: "1rem"
  },
  modalContainer: {
    backgroundColor: THEME.surface,
    borderRadius: "1.5rem",
    border: "1px solid transparent",
    backgroundImage:
      `linear-gradient(${THEME.surface}, ${THEME.surface}), ` +
      "linear-gradient(120deg, rgba(217,130,43,0.32), rgba(249,223,198,0.52))",
    backgroundClip: "padding-box, border-box",
    backgroundOrigin: "padding-box, border-box",
    boxShadow: "0 30px 62px rgba(44, 30, 30, 0.32)",
    backdropFilter: "blur(24px)",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column"
  },
  modalHeader: {
    padding: "1.5rem 1.5rem 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "1rem"
  },
  modalBookTitle: {
    fontSize: "0.9rem",
    fontWeight: "normal",
    color: THEME.textMuted,
    fontStyle: "italic"
  },
  modalCloseButton: {
    background: "transparent",
    border: "none",
    fontSize: "1.5rem",
    cursor: "pointer",
    color: THEME.textMuted,
    padding: "0.25rem",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "0.5rem",
    transition: "background 0.2s ease, color 0.2s ease"
  },
  modalBody: {
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    flex: 1,
    overflow: "auto"
  },
  modalFooter: {
    padding: "0 1.5rem 1.5rem",
    display: "flex",
    gap: "0.75rem",
    justifyContent: "flex-end"
  }
};
