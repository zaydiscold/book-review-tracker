# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-23 - Form Label Association
**Learning:** Implicit form labeling (wrapping input in label) is often insufficient or implemented incorrectly (label separate from input without association).
**Action:** Always use explicit `htmlFor` on labels matching the `id` of the input. This ensures robust accessibility for all screen readers and improves the click-target area for all users.
