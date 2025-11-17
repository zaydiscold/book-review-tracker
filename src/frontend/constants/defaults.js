/**
 * Default form values and initial states
 */
import { DEFAULT_STATUS } from "./theme";

export const emptyBookForm = {
  title: "",
  author: "",
  status: DEFAULT_STATUS,
  cover: null,
  openLibraryUrl: "",
  openLibraryIdentifiers: null,
  availability: null,
  libgenMetadata: null
};

export function createReviewDraft(status = DEFAULT_STATUS) {
  return {
    rating: "",
    text: "",
    status
  };
}

export const emptyReviewForm = {
  bookId: "",
  rating: "",
  text: "",
  status: DEFAULT_STATUS
};

export const emptyReviewDraft = createReviewDraft();
