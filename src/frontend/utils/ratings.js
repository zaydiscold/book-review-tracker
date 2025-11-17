/**
 * Rating conversion and display utilities
 */
import { STAR_COUNT } from "../constants/theme";

export function normalizeFiveValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "0";
  }

  const clamped = Math.min(STAR_COUNT, Math.max(0, value));
  const rounded = Math.round(clamped * 10) / 10;
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toFixed(1).replace(/\.0$/, "");
}

export function toFiveScale(rating10) {
  if (typeof rating10 !== "number" || Number.isNaN(rating10)) {
    return "";
  }
  return normalizeFiveValue(rating10 / 2);
}

export function fromFiveScale(value) {
  const numeric = Number.parseFloat(value);
  if (Number.isNaN(numeric)) {
    return null;
  }
  return numeric * 2;
}

export function formatFiveScaleDisplay(rating10) {
  if (typeof rating10 !== "number" || Number.isNaN(rating10)) {
    return "—";
  }
  const fiveScale = rating10 / 2;
  return `${fiveScale.toFixed(fiveScale % 1 === 0 ? 0 : 1)}/5`;
}
