# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-24 - Form Accessibility in Modals
**Learning:** Form inputs in custom modals often lack explicit label association (`htmlFor` + `id`), which breaks screen reader support. Also, users expect the first input to be focused automatically when a modal opens.
**Action:** Always verify form accessibility in modals and add `autoFocus` to the primary input field for better efficiency.
