# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-22 - Modal Interaction Patterns
**Learning:** Users expect modals to be keyboard-ready immediately upon opening.
**Action:** Always use `autoFocus` on the primary input field and ensure the modal container has `role="dialog"` and `aria-modal="true"`.

## 2024-05-23 - Search Input Accessibility
**Learning:** Multiple search inputs were implemented without associated labels, relying only on placeholders. This is a recurring pattern in the app's forms.
**Action:** Always verify `input` elements have a corresponding `label` (visible or `.sr-only`) linked via `id` and `htmlFor`.

## 2024-05-23 - Context for Action Buttons in Lists
**Learning:** Action buttons in list views (like "Add to Wishlist" in LibGen results) often lack context, making them repetitive and ambiguous for screen reader users ("Add to Wishlist", "Add to Wishlist"...).
**Action:** Use dynamic `aria-label`s that include the item's name (e.g., "Add [Book Title] to Wishlist") for repeated actions in grids/lists.
