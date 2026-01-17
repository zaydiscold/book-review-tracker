# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-23 - Modal Form Accessibility
**Learning:** Modal forms often lack programmatic association between labels and inputs, and missing `aria-modal="true"` roles. This makes them difficult for screen reader users to navigate and understand.
**Action:** Ensure all modal inputs have `id`s and corresponding `label`s with `htmlFor`. Add `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` to the modal container. Set `autoFocus` on the first input.
