# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-22 - Modal Interaction Patterns
**Learning:** Users expect modals to be keyboard-ready immediately upon opening.
**Action:** Always use `autoFocus` on the primary input field and ensure the modal container has `role="dialog"` and `aria-modal="true"`.

## 2024-10-24 - Semantic Clickable Elements
**Learning:** Using `div` with `onClick` for navigation or actions excludes keyboard and screen reader users.
**Action:** Replace clickable `div`s with semantic `<button>` elements, ensuring `type="button"` and proper focus styles are applied.
