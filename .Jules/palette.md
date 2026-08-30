# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-22 - Modal Interaction Patterns
**Learning:** Users expect modals to be keyboard-ready immediately upon opening.
**Action:** Always use `autoFocus` on the primary input field and ensure the modal container has `role="dialog"` and `aria-modal="true"`.

## 2026-01-24 - Input Fields with Internal Buttons
**Learning:** Placing action buttons (like "Search") inside input fields visually requires significant padding (`pr-32` vs `pr-4`) to prevent text overlap, which ruins the user experience for long queries. Also, visual-only placeholders fail accessibility checks; they must have a corresponding label (e.g., `.sr-only`).
**Action:** When using internal buttons, calculate padding based on button width + safe area, and always include a hidden label for screen readers.
