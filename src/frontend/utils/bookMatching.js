/**
 * Book matching and auto-population utilities
 */
import { searchOpenLibrary } from "../../data/openLibrary";
import { updateBook } from "../../data/db";
import { hasCover } from "./covers";
import { normalizeForMatch, compactForComparison, extractAuthorCandidates } from "./formatting";

export function authorsIntersect(bookAuthors, candidateAuthors) {
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

export async function autoPopulateCoverIfNeeded(book) {
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

export function applyBookUpdateToList(list, updatedBook) {
  if (!list || !updatedBook?.id) {
    return list;
  }

  const exists = list.some((item) => item.id === updatedBook.id);
  if (!exists) {
    return list;
  }

  return list.map((item) => (item.id === updatedBook.id ? updatedBook : item));
}
