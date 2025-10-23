// Placeholder: expand to sync IndexedDB data with secure cloud replica once phase 2 begins.
const DB_NAME = "book-review-tracker";
const DB_VERSION = 2;
const BOOK_STORE = "books";
const REVIEW_STORE = "reviews";

let dbPromise = null;

function isPromise(value) {
  return Boolean(value && typeof value === "object" && typeof value.then === "function");
}

function isIDBRequest(value) {
  return Boolean(value && typeof value === "object" && "onsuccess" in value && "onerror" in value);
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      resolve(event.target?.result ?? request.result ?? null);
    };
    request.onerror = () => {
      reject(request.error ?? new Error("IndexedDB request failed"));
    };
  });
}

function ensureIndex(store, name, keyPath) {
  if (store && !store.indexNames.contains(name)) {
    store.createIndex(name, keyPath, { unique: false });
  }
}

function toLowerOrNull(value) {
  if (value === undefined || value === null) {
    return null;
  }

  return String(value).toLowerCase();
}

function normalizeExistingBookRecord(value) {
  const record = { ...value };
  let mutated = false;

  if (record.title && !record.titleLower) {
    record.titleLower = toLowerOrNull(record.title);
    mutated = true;
  }

  if (record.author && !record.authorLower) {
    record.authorLower = toLowerOrNull(record.author);
    mutated = true;
  }

  let timestamp;
  const getTimestamp = () => {
    if (!timestamp) {
      timestamp = new Date().toISOString();
    }
    return timestamp;
  };

  if (!record.createdAt) {
    record.createdAt = getTimestamp();
    mutated = true;
  }

  if (!record.updatedAt) {
    record.updatedAt = record.createdAt ?? getTimestamp();
    mutated = true;
  }

  return { record, mutated };
}

function normalizeExistingReviewRecord(value) {
  const record = { ...value };
  let mutated = false;

  let timestamp;
  const getTimestamp = () => {
    if (!timestamp) {
      timestamp = new Date().toISOString();
    }
    return timestamp;
  };

  if (!record.createdAt) {
    record.createdAt = getTimestamp();
    mutated = true;
  }

  if (!record.updatedAt) {
    record.updatedAt = record.createdAt ?? getTimestamp();
    mutated = true;
  }

  return { record, mutated };
}

function upgradeBookStore(database, transaction) {
  let bookStore;
  if (!database.objectStoreNames.contains(BOOK_STORE)) {
    bookStore = database.createObjectStore(BOOK_STORE, { keyPath: "id", autoIncrement: true });
  } else {
    bookStore = transaction.objectStore(BOOK_STORE);
  }

  ensureIndex(bookStore, "status", "status");
  ensureIndex(bookStore, "titleLower", "titleLower");
  ensureIndex(bookStore, "authorLower", "authorLower");
  ensureIndex(bookStore, "createdAt", "createdAt");

  if (bookStore) {
    const cursorRequest = bookStore.openCursor();
    cursorRequest.onsuccess = (cursorEvent) => {
      const cursor = cursorEvent.target.result;
      if (!cursor) {
        return;
      }

      const { record, mutated } = normalizeExistingBookRecord(cursor.value ?? {});
      if (mutated) {
        cursor.update(record);
      }

      cursor.continue();
    };
  }
}

function upgradeReviewStore(database, transaction) {
  let reviewStore;
  if (!database.objectStoreNames.contains(REVIEW_STORE)) {
    reviewStore = database.createObjectStore(REVIEW_STORE, { keyPath: "id", autoIncrement: true });
  } else {
    reviewStore = transaction.objectStore(REVIEW_STORE);
  }

  ensureIndex(reviewStore, "bookId", "bookId");
  ensureIndex(reviewStore, "updatedAt", "updatedAt");

  if (reviewStore) {
    const reviewCursor = reviewStore.openCursor();
    reviewCursor.onsuccess = (cursorEvent) => {
      const cursor = cursorEvent.target.result;
      if (!cursor) {
        return;
      }

      const { record, mutated } = normalizeExistingReviewRecord(cursor.value ?? {});
      if (mutated) {
        cursor.update(record);
      }

      cursor.continue();
    };
  }
}

function prepareBookForWrite(input, existing, now = new Date().toISOString()) {
  const merged = existing ? { ...existing, ...input } : { ...input };
  const resolvedTitle = merged.title ?? existing?.title ?? null;
  const resolvedAuthor = merged.author ?? existing?.author ?? null;

  return {
    ...merged,
    titleLower: toLowerOrNull(resolvedTitle),
    authorLower: toLowerOrNull(resolvedAuthor),
    createdAt: existing?.createdAt ?? merged.createdAt ?? now,
    updatedAt: merged.updatedAt ?? now
  };
}

function prepareReviewForWrite(input, existing, now = new Date().toISOString()) {
  const merged = existing ? { ...existing, ...input } : { ...input };

  if (!merged.bookId && existing?.bookId) {
    merged.bookId = existing.bookId;
  }

  return {
    ...merged,
    createdAt: existing?.createdAt ?? merged.createdAt ?? now,
    updatedAt: merged.updatedAt ?? now
  };
}

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

      upgradeBookStore(database, transaction);
      upgradeReviewStore(database, transaction);
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

    let finalValue = null;
    let settled = false;

    const resolveWith = (value) => {
      finalValue = value ?? null;
    };

    const rejectOnce = (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    };

    transaction.oncomplete = () => {
      if (!settled) {
        settled = true;
        resolve(finalValue);
      }
    };

    transaction.onerror = () => {
      rejectOnce(transaction.error ?? new Error("IndexedDB transaction failed"));
    };

    transaction.onabort = () => {
      rejectOnce(transaction.error ?? new Error("IndexedDB transaction aborted"));
    };

    let callbackResult;

    try {
      callbackResult = callback(store, transaction);
    } catch (error) {
      rejectOnce(error);
      try {
        transaction.abort();
      } catch {
        // ignore abort failures
      }
      return;
    }

    const handleResult = (result) => {
      if (result === undefined) {
        return;
      }

      if (isPromise(result)) {
        result
          .then((value) => {
            resolveWith(value);
          })
          .catch((error) => {
            rejectOnce(error);
            try {
              transaction.abort();
            } catch {
              // ignore abort failures
            }
          });
        return;
      }

      if (isIDBRequest(result)) {
        requestToPromise(result)
          .then((value) => {
            resolveWith(value);
          })
          .catch((error) => {
            rejectOnce(error);
            try {
              transaction.abort();
            } catch {
              // ignore abort failures
            }
          });
        return;
      }

      resolveWith(result);
    };

    handleResult(callbackResult);
  });
}

export async function addBook(book) {
  const now = new Date().toISOString();
  return withStore(BOOK_STORE, "readwrite", (store) => {
    const record = prepareBookForWrite(book, null, now);
    return requestToPromise(store.add(record));
  });
}

export async function updateBook(book) {
  if (!book?.id) {
    throw new Error("updateBook requires an id");
  }

  const now = new Date().toISOString();
  return withStore(BOOK_STORE, "readwrite", async (store) => {
    const existing = await requestToPromise(store.get(book.id));
    const normalized = prepareBookForWrite(book, existing ?? null, now);
    await requestToPromise(store.put(normalized));
    return { ...normalized };
  });
}

export async function deleteBook(bookId) {
  return withStore(BOOK_STORE, "readwrite", (store) => {
    const request = store.delete(bookId);
    return requestToPromise(request).then(() => true);
  });
}

export async function getBooks() {
  return (await withStore(BOOK_STORE, "readonly", (store) => store.getAll())) ?? [];
}

export async function saveReview(review) {
  if (!review || !review.bookId) {
    throw new Error("saveReview requires a review with a bookId");
  }

  const now = new Date().toISOString();

  return withStore(REVIEW_STORE, "readwrite", async (store) => {
    if (review.id !== undefined && review.id !== null) {
      const existing = await requestToPromise(store.get(review.id));
      if (!existing) {
        const normalized = prepareReviewForWrite(review, null, now);
        normalized.id = review.id;
        await requestToPromise(store.put(normalized));
        return { ...normalized };
      }

      const normalized = prepareReviewForWrite(review, existing, now);
      await requestToPromise(store.put(normalized));
      return { ...normalized };
    }

    const normalized = prepareReviewForWrite(review, null, now);
    const newId = await requestToPromise(store.add(normalized));
    return { ...normalized, id: newId };
  });
}

export async function addReview(review) {
  if (!review || !review.bookId) {
    throw new Error("addReview requires a review with a bookId");
  }

  const now = new Date().toISOString();
  return withStore(REVIEW_STORE, "readwrite", (store) => {
    const normalized = prepareReviewForWrite(review, null, now);
    return requestToPromise(store.add(normalized));
  });
}

export async function getReviews() {
  return (await withStore(REVIEW_STORE, "readonly", (store) => store.getAll())) ?? [];
}

export async function getReviewByBookId(bookId) {
  return withStore(REVIEW_STORE, "readonly", (store) => {
    const index = store.index("bookId");
    return requestToPromise(index.getAll(bookId)).then((results) => {
      const list = results ?? [];
      return list[0] ?? null;
    });
  });
}

export async function deleteReviewByBookId(bookId) {
  if (bookId === undefined || bookId === null) {
    return false;
  }

  return withStore(REVIEW_STORE, "readwrite", (store) => {
    const index = store.index("bookId");
    const keyRange = typeof IDBKeyRange !== "undefined" ? IDBKeyRange.only(bookId) : bookId;

    return new Promise((resolve, reject) => {
      const cursorRequest = index.openCursor(keyRange);

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (!cursor) {
          resolve(true);
          return;
        }

        store.delete(cursor.primaryKey);
        cursor.continue();
      };

      cursorRequest.onerror = () => {
        reject(cursorRequest.error ?? new Error("Failed to lookup review keys for deletion"));
      };
    });
  });
}

export async function clearAll() {
  await withStore(BOOK_STORE, "readwrite", (store) => {
    const request = store.clear();
    return requestToPromise(request).then(() => true);
  });
  await withStore(REVIEW_STORE, "readwrite", (store) => {
    const request = store.clear();
    return requestToPromise(request).then(() => true);
  });
}

export async function deleteReviewById(reviewId) {
  if (reviewId === undefined || reviewId === null) {
    return false;
  }

  return withStore(REVIEW_STORE, "readwrite", (store) => {
    const request = store.delete(reviewId);
    return requestToPromise(request).then(() => true);
  });
}
