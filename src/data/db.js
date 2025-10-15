// Placeholder: expand to sync IndexedDB data with secure cloud replica once phase 2 begins.
const DB_NAME = "book-review-tracker";
const DB_VERSION = 2;
const BOOK_STORE = "books";
const REVIEW_STORE = "reviews";

let dbPromise = null;

export async function initDB() {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is not available in this environment");
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      const transaction = event.target.transaction;

      let bookStore;
      if (!database.objectStoreNames.contains(BOOK_STORE)) {
        bookStore = database.createObjectStore(BOOK_STORE, {
          keyPath: "id",
          autoIncrement: true
        });
      } else {
        bookStore = transaction.objectStore(BOOK_STORE);
      }

      if (bookStore && !bookStore.indexNames.contains("status")) {
        bookStore.createIndex("status", "status", { unique: false });
      }

      if (bookStore && !bookStore.indexNames.contains("titleLower")) {
        bookStore.createIndex("titleLower", "titleLower", { unique: false });
      }

      if (bookStore && !bookStore.indexNames.contains("authorLower")) {
        bookStore.createIndex("authorLower", "authorLower", { unique: false });
      }

      if (bookStore && !bookStore.indexNames.contains("createdAt")) {
        bookStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      if (bookStore) {
        const cursorRequest = bookStore.openCursor();
        cursorRequest.onsuccess = (cursorEvent) => {
          const cursor = cursorEvent.target.result;
          if (!cursor) {
            return;
          }

          const value = cursor.value ?? {};
          let mutated = false;

          if (value.title && !value.titleLower) {
            value.titleLower = String(value.title).toLowerCase();
            mutated = true;
          }

          if (value.author && !value.authorLower) {
            value.authorLower = String(value.author).toLowerCase();
            mutated = true;
          }

          if (!value.createdAt) {
            value.createdAt = new Date().toISOString();
            mutated = true;
          }

          if (!value.updatedAt) {
            value.updatedAt = value.createdAt ?? new Date().toISOString();
            mutated = true;
          }

          if (mutated) {
            cursor.update(value);
          }

          cursor.continue();
        };
      }

      let reviewStore;
      if (!database.objectStoreNames.contains(REVIEW_STORE)) {
        reviewStore = database.createObjectStore(REVIEW_STORE, {
          keyPath: "id",
          autoIncrement: true
        });
      } else {
        reviewStore = transaction.objectStore(REVIEW_STORE);
      }

      if (reviewStore && !reviewStore.indexNames.contains("bookId")) {
        reviewStore.createIndex("bookId", "bookId", { unique: false });
      }

      if (reviewStore && !reviewStore.indexNames.contains("updatedAt")) {
        reviewStore.createIndex("updatedAt", "updatedAt", { unique: false });
      }

      if (reviewStore) {
        const reviewCursor = reviewStore.openCursor();
        reviewCursor.onsuccess = (cursorEvent) => {
          const cursor = cursorEvent.target.result;
          if (!cursor) {
            return;
          }

          const value = cursor.value ?? {};
          let mutated = false;

          if (!value.createdAt) {
            value.createdAt = new Date().toISOString();
            mutated = true;
          }

          if (!value.updatedAt) {
            value.updatedAt = value.createdAt ?? new Date().toISOString();
            mutated = true;
          }

          if (mutated) {
            cursor.update(value);
          }

          cursor.continue();
        };
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Unable to open IndexedDB"));
    };
  });

  return dbPromise;
}

async function withStore(storeName, mode, callback) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const result = callback(store);

    transaction.oncomplete = () => {
      if (result && typeof result === "object" && "result" in result) {
        resolve(result.result);
      } else {
        resolve(result ?? null);
      }
    };

    transaction.onerror = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    };
  });
}

export async function addBook(book) {
  return withStore(BOOK_STORE, "readwrite", (store) => store.add(book));
}

export async function updateBook(book) {
  if (!book?.id) {
    throw new Error("updateBook requires an id");
  }

  return withStore(BOOK_STORE, "readwrite", (store) => store.put(book));
}

export async function deleteBook(bookId) {
  return withStore(BOOK_STORE, "readwrite", (store) => store.delete(bookId));
}

export async function getBooks() {
  return (await withStore(BOOK_STORE, "readonly", (store) => store.getAll())) ?? [];
}

export async function saveReview(review) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(REVIEW_STORE, "readwrite");
    const store = transaction.objectStore(REVIEW_STORE);
    const index = store.index("bookId");
    const lookup = index.getAll(review.bookId);

    const now = new Date().toISOString();

    lookup.onsuccess = () => {
      const existingList = lookup.result ?? [];
      const [primary, ...duplicates] = existingList;

      if (primary) {
        const updatedReview = {
          ...primary,
          ...review,
          id: primary.id,
          createdAt: primary.createdAt ?? now,
          updatedAt: now
        };
        const updateRequest = store.put(updatedReview);
        updateRequest.onsuccess = () => {
          // Clean up any duplicate entries left from earlier versions.
          duplicates.forEach((orphan) => store.delete(orphan.id));
          resolve({ ...updatedReview });
        };
        updateRequest.onerror = () => {
          reject(updateRequest.error ?? new Error("Failed to update review"));
        };
      } else {
        const newReview = {
          ...review,
          createdAt: review.createdAt ?? now,
          updatedAt: now
        };
        const addRequest = store.add(newReview);
        addRequest.onsuccess = (event) => {
          resolve({ ...newReview, id: event.target.result });
        };
        addRequest.onerror = () => {
          reject(addRequest.error ?? new Error("Failed to add review"));
        };
      }
    };

    lookup.onerror = () => {
      reject(lookup.error ?? new Error("Failed to look up review by book"));
    };

    transaction.onerror = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    };
  });
}

export async function addReview(review) {
  return withStore(REVIEW_STORE, "readwrite", (store) => store.add(review));
}

export async function getReviews() {
  return (await withStore(REVIEW_STORE, "readonly", (store) => store.getAll())) ?? [];
}

export async function getReviewByBookId(bookId) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(REVIEW_STORE, "readonly");
    const store = transaction.objectStore(REVIEW_STORE);
    const index = store.index("bookId");
    const request = index.getAll(bookId);

    request.onsuccess = () => {
      const results = request.result ?? [];
      resolve(results[0] ?? null);
    };

    request.onerror = () => {
      reject(request.error ?? new Error("Failed to fetch review by book"));
    };

    transaction.onerror = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    };

    transaction.onabort = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    };
  });
}

export async function deleteReviewByBookId(bookId) {
  const database = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(REVIEW_STORE, "readwrite");
    const store = transaction.objectStore(REVIEW_STORE);
    const index = store.index("bookId");
    const lookup = index.getAllKeys(bookId);

    lookup.onsuccess = () => {
      const keys = lookup.result ?? [];
      keys.forEach((key) => store.delete(key));
    };

    lookup.onerror = () => {
      reject(lookup.error ?? new Error("Failed to lookup review keys for deletion"));
    };

    transaction.oncomplete = () => resolve(true);
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed"));
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction aborted"));
    };
  });
}

export async function clearAll() {
  await withStore(BOOK_STORE, "readwrite", (store) => store.clear());
  await withStore(REVIEW_STORE, "readwrite", (store) => store.clear());
}
