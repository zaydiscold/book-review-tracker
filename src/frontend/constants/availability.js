/**
 * Availability status constants and utilities
 */

export const AVAILABILITY_STATUS_COPY = {
  open: "Available to read online",
  borrow_available: "Available to borrow",
  borrow_unavailable: "All copies checked out",
  restricted: "Requires library login or waitlist",
  private: "Not available for digital lending",
  error: "Availability unavailable",
  unknown: "Availability unknown"
};

export function describeAvailability(availability) {
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

export function buildAvailabilityActions(availability) {
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

export function shouldShowOpenLibraryLink(openLibraryUrl, availabilityActions) {
  if (!openLibraryUrl) {
    return false;
  }

  const alreadyInActions = availabilityActions.some((action) => action.url === openLibraryUrl);
  return !alreadyInActions;
}
