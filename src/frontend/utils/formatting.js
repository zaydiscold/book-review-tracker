/**
 * Formatting and display utilities
 */
import { PST_TIME_ZONE } from "../constants/theme";

export function formatTimestampForDisplay(isoString) {
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

export function normalizeForMatch(value) {
  if (!value) {
    return "";
  }

  return String(value)
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9']+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function compactForComparison(value) {
  return normalizeForMatch(value).replace(/[\s']/g, "");
}

export function extractAuthorCandidates(authorText) {
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
