/**
 * Interactive star rating input component
 */
import { useState } from "react";
import { STAR_SYMBOL, STAR_COUNT } from "../constants/theme";
import { normalizeFiveValue } from "../utils/ratings";
import { styles } from "../styles/appStyles";

export function StarRatingInput({ value, onChange, ariaLabel }) {
  const [hoverValue, setHoverValue] = useState(null);

  const numericValue = Number.parseFloat(value ?? "0");
  const safeValue = Number.isNaN(numericValue)
    ? 0
    : Math.min(STAR_COUNT, Math.max(0, numericValue));
  const displayValue = hoverValue ?? safeValue;

  function computeValueFromEvent(event, starIndex) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clientX =
      event.clientX ?? event.nativeEvent?.clientX ?? event.nativeEvent?.touches?.[0]?.clientX;
    if (typeof clientX !== "number") {
      return safeValue;
    }

    const ratio = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1);
    let computed;

    // Simple 50/50 split: left half = half star, right half = full star
    if (ratio < 0.5) {
      computed = starIndex - 0.5;
    } else {
      computed = starIndex;
    }

    return Math.min(STAR_COUNT, Math.max(0, Number((Math.round(computed * 2) / 2).toFixed(1))));
  }

  function handleHover(event, starIndex) {
    const nextValue = computeValueFromEvent(event, starIndex);
    setHoverValue(nextValue);
  }

  function handleSelect(event, starIndex) {
    const nextValue = computeValueFromEvent(event, starIndex);
    onChange(normalizeFiveValue(nextValue));
    setHoverValue(null);
  }

  function adjustBy(delta) {
    const nextValue = Math.min(STAR_COUNT, Math.max(0, safeValue + delta));
    onChange(normalizeFiveValue(nextValue));
  }

  return (
    <div
      style={styles.starInputWrapper}
      role="radiogroup"
      aria-label={ariaLabel}
      onMouseLeave={() => setHoverValue(null)}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const starIndex = index + 1;
        const fill =
          displayValue >= starIndex
            ? "full"
            : displayValue >= starIndex - 0.5
            ? "half"
            : "empty";
        const colourStyle =
          fill === "full"
            ? styles.starFull
            : fill === "half"
            ? styles.starHalf
            : styles.starEmpty;

        return (
          <button
            key={`star-input-${starIndex}`}
            type="button"
            style={{ ...styles.starButton, ...colourStyle }}
            onMouseMove={(event) => handleHover(event, starIndex)}
            onClick={(event) => handleSelect(event, starIndex)}
            onKeyDown={(event) => {
              if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
                event.preventDefault();
                adjustBy(-0.5);
              } else if (event.key === "ArrowRight" || event.key === "ArrowUp") {
                event.preventDefault();
                adjustBy(0.5);
              } else if (event.key === "Home") {
                event.preventDefault();
                onChange("0");
              } else if (event.key === "End") {
                event.preventDefault();
                onChange(String(STAR_COUNT));
              }
            }}
            aria-label={`${starIndex} ${STAR_SYMBOL}`}
            aria-pressed={
              displayValue >= starIndex
                ? "true"
                : displayValue >= starIndex - 0.5
                ? "mixed"
                : "false"
            }
          >
            {STAR_SYMBOL}
          </button>
        );
      })}
    </div>
  );
}
