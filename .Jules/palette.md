# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-22 - Focus Visibility in Hover-Reveal Interfaces
**Learning:** Interfaces that reveal actions on hover (like card overlays) are often inaccessible to keyboard users because the controls remain hidden even when focused.
**Action:** Use `focus-within` on the container (e.g., `focus-within:opacity-100`) to ensure hidden controls become visible when they receive keyboard focus.
