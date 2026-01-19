# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-22 - Namespacing Form IDs in Modals
**Learning:** Using generic IDs like `title` or `author` in modals can cause accessibility issues (duplicate IDs) if the underlying page also uses them.
**Action:** Always namespace IDs in reusable components or modals (e.g., `add-book-title`) to ensure uniqueness.
