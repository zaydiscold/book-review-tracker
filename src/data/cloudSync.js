import { getSupabaseClient, isSupabaseConfigured } from "./supabaseClient";

const BOOK_TABLE = "books";
const REVIEW_TABLE = "reviews";

const BOOK_FIELDS = [
  "id",
  "title",
  "titleLower",
  "author",
  "authorLower",
  "status",
  "cover",
  "openLibraryUrl",
  "openLibraryIdentifiers",
  "availability",
  "createdAt",
  "updatedAt"
];

const REVIEW_FIELDS = [
  "id",
  "bookId",
  "rating",
  "text",
  "status",
  "unread",
  "createdAt",
  "updatedAt"
];

function normalizeRecord(record, fields) {
  if (!record) {
    return null;
  }

  const normalized = {};

  for (const field of fields) {
    if (record[field] !== undefined) {
      normalized[field] = record[field];
    } else {
      normalized[field] = null;
    }
  }

  return normalized;
}

function coerceIdentifier(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const numeric = Number(trimmed);
    if (Number.isSafeInteger(numeric)) {
      return numeric;
    }

    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
      return numeric;
    }

    return trimmed;
  }

  return value;
}

function coerceRating(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (!Number.isNaN(numeric) && Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return null;
}

function normalizeBookFromCloud(book) {
  const normalized = normalizeRecord(book, BOOK_FIELDS);
  if (!normalized) {
    return null;
  }

  normalized.id = coerceIdentifier(normalized.id);

  if (normalized.title && !normalized.titleLower) {
    normalized.titleLower = normalized.title.toLowerCase();
  }

  if (normalized.author && !normalized.authorLower) {
    normalized.authorLower = normalized.author.toLowerCase();
  }

  const now = new Date().toISOString();
  if (!normalized.createdAt) {
    normalized.createdAt = now;
  }

  if (!normalized.updatedAt) {
    normalized.updatedAt = normalized.createdAt;
  }

  return normalized;
}

function normalizeReviewFromCloud(review) {
  const normalized = normalizeRecord(review, REVIEW_FIELDS);
  if (!normalized) {
    return null;
  }

  normalized.id = coerceIdentifier(normalized.id);
  normalized.bookId = coerceIdentifier(normalized.bookId);
  normalized.rating = coerceRating(normalized.rating);

  if (normalized.unread !== null) {
    normalized.unread = Boolean(normalized.unread);
  }

  const now = new Date().toISOString();
  if (!normalized.createdAt) {
    normalized.createdAt = now;
  }

  if (!normalized.updatedAt) {
    normalized.updatedAt = normalized.createdAt;
  }

  return normalized;
}

function assertIdentifier(value, label) {
  if (value === undefined || value === null) {
    throw new Error(`${label} is required for cloud sync`);
  }
}

export function isCloudSyncEnabled() {
  return isSupabaseConfigured();
}

async function fetchAllFromSupabase(client, table, { normalizer, validator }) {
  const PAGE_SIZE = 1000;
  const results = [];
  let offset = 0;

  while (true) {
    const { data, error } = await client
      .from(table)
      .select("*")
      .order("updatedAt", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1);

    if (error) {
      const wrapped = new Error(`Failed to fetch ${table} from Supabase: ${error.message ?? error}`);
      wrapped.cause = error;
      throw wrapped;
    }

    const batch = data ?? [];
    if (batch.length === 0) {
      break;
    }

    const normalized = batch.map((entry) => normalizer(entry)).filter((entry) => validator(entry));
    results.push(...normalized);

    if (batch.length < PAGE_SIZE) {
      break;
    }

    offset += PAGE_SIZE;
  }

  return results;
}

export async function pullCloudSnapshot() {
  const client = getSupabaseClient();
  if (!client) {
    return { status: "disabled", books: [], reviews: [], isComplete: false };
  }

  const [books, reviews] = await Promise.all([
    fetchAllFromSupabase(client, BOOK_TABLE, {
      normalizer: (entry) => normalizeBookFromCloud(entry),
      validator: (entry) => entry && entry.id !== null
    }),
    fetchAllFromSupabase(client, REVIEW_TABLE, {
      normalizer: (entry) => normalizeReviewFromCloud(entry),
      validator: (entry) => entry && entry.id !== null && entry.bookId !== null
    })
  ]);

  return {
    status: "ok",
    books,
    reviews,
    isComplete: true
  };
}

export async function syncBookUpsert(book) {
  const client = getSupabaseClient();
  if (!client) {
    return { status: "disabled" };
  }

  assertIdentifier(book?.id, "Book id");
  const payload = normalizeRecord(book, BOOK_FIELDS);

  const { error } = await client
    .from(BOOK_TABLE)
    .upsert([payload], { onConflict: "id", ignoreDuplicates: false, returning: "minimal" });

  if (error) {
    const wrapped = new Error(`Failed to sync book ${book.id} to Supabase: ${error.message ?? error}`);
    wrapped.cause = error;
    throw wrapped;
  }

  return { status: "ok" };
}

export async function syncBookDelete(bookId) {
  const client = getSupabaseClient();
  if (!client) {
    return { status: "disabled" };
  }

  assertIdentifier(bookId, "Book id");

  const { error } = await client.from(BOOK_TABLE).delete().eq("id", bookId);

  if (error) {
    const wrapped = new Error(`Failed to delete book ${bookId} on Supabase: ${error.message ?? error}`);
    wrapped.cause = error;
    throw wrapped;
  }

  return { status: "ok" };
}

export async function syncReviewUpsert(review) {
  const client = getSupabaseClient();
  if (!client) {
    return { status: "disabled" };
  }

  assertIdentifier(review?.id, "Review id");
  assertIdentifier(review?.bookId, "Review bookId");

  const payload = normalizeRecord(review, REVIEW_FIELDS);

  const { error } = await client
    .from(REVIEW_TABLE)
    .upsert([payload], { onConflict: "id", ignoreDuplicates: false, returning: "minimal" });

  if (error) {
    const wrapped = new Error(
      `Failed to sync review ${review.id} (book ${review.bookId}) to Supabase: ${error.message ?? error}`
    );
    wrapped.cause = error;
    throw wrapped;
  }

  return { status: "ok" };
}

export async function syncReviewDelete(reviewId) {
  const client = getSupabaseClient();
  if (!client) {
    return { status: "disabled" };
  }

  assertIdentifier(reviewId, "Review id");

  const { error } = await client.from(REVIEW_TABLE).delete().eq("id", reviewId);

  if (error) {
    const wrapped = new Error(`Failed to delete review ${reviewId} on Supabase: ${error.message ?? error}`);
    wrapped.cause = error;
    throw wrapped;
  }

  return { status: "ok" };
}

export async function syncReviewsDeleteForBook(bookId) {
  const client = getSupabaseClient();
  if (!client) {
    return { status: "disabled" };
  }

  assertIdentifier(bookId, "Book id");

  const { error } = await client.from(REVIEW_TABLE).delete().eq("bookId", bookId);

  if (error) {
    const wrapped = new Error(
      `Failed to delete reviews for book ${bookId} on Supabase: ${error.message ?? error}`
    );
    wrapped.cause = error;
    throw wrapped;
  }

  return { status: "ok" };
}

export async function syncDeleteAllBooks() {
  const client = getSupabaseClient();
  if (!client) {
    return { status: "disabled" };
  }

  const { error } = await client.from(BOOK_TABLE).delete().not("id", "is", null);

  if (error) {
    const wrapped = new Error(`Failed to clear books on Supabase: ${error.message ?? error}`);
    wrapped.cause = error;
    throw wrapped;
  }

  return { status: "ok" };
}

export async function syncDeleteAllReviews() {
  const client = getSupabaseClient();
  if (!client) {
    return { status: "disabled" };
  }

  const { error } = await client.from(REVIEW_TABLE).delete().not("id", "is", null);

  if (error) {
    const wrapped = new Error(`Failed to clear reviews on Supabase: ${error.message ?? error}`);
    wrapped.cause = error;
    throw wrapped;
  }

  return { status: "ok" };
}

export function scheduleBackgroundSync() {
  return null;
}
