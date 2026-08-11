# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-22 - Modal Interaction Patterns
**Learning:** Users expect modals to be keyboard-ready immediately upon opening.
**Action:** Always use `autoFocus` on the primary input field and ensure the modal container has `role="dialog"` and `aria-modal="true"`.

## 2024-05-23 - Modal Accessibility Defaults
**Learning:** Modals require explicit `role="dialog"`, `aria-modal="true"`, and labeling to be accessible. Icon-only buttons (like 'Close') are critical failure points if missing `aria-label`.
**Action:** Audit all modal components for these attributes, even if they are currently unused or "work in progress".
