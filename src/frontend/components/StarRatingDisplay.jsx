/**
 * Display-only star rating component
 */
import { STAR_SYMBOL, STAR_COUNT } from "../constants/theme";

export function renderStarRating(rating10) {
  if (typeof rating10 !== "number" || Number.isNaN(rating10)) {
    return null;
  }

  const ratingFive = rating10 / 2;
  const stars = [];

  for (let idx = 1; idx <= STAR_COUNT; idx += 1) {
    if (ratingFive >= idx) {
      stars.push(
        <span key={`star-${idx}`} className="star">
          {STAR_SYMBOL}
        </span>
      );
    } else if (ratingFive >= idx - 0.5) {
      stars.push(
        <span key={`star-${idx}`} className="star opacity-50">
          {STAR_SYMBOL}
        </span>
      );
    } else {
      stars.push(
        <span key={`star-${idx}`} className="star-empty">
          {STAR_SYMBOL}
        </span>
      );
    }
  }

  return stars;
}
