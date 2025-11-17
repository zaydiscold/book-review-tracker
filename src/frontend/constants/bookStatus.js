/**
 * Book status constants and utilities
 */

export const BOOK_STATUS_SECTIONS = [
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

export const BOOK_STATUSES = BOOK_STATUS_SECTIONS.flatMap((section) => section.options);

export const REVIEW_DISABLED_STATUSES = new Set(["wishlist", "library"]);
export const UNREAD_STATUSES = new Set(["wishlist", "library", "reading", "on-hold"]);

export const STATUS_LABELS = BOOK_STATUSES.reduce((acc, status) => {
  acc[status.value] = status.label;
  return acc;
}, {});

export function isUnreadStatus(status) {
  if (!status) {
    return false;
  }
  return UNREAD_STATUSES.has(String(status));
}
