# Palette's Journal

## 2024-05-22 - Accessibility of Icon-Only Buttons
**Learning:** Icon-only buttons (like Edit/Delete) are common in card components but often lack `aria-label`, making them inaccessible to screen reader users. The `title` attribute is insufficient for accessibility.
**Action:** Always verify that icon-only buttons have an explicit `aria-label` describing the action and the item it acts upon (e.g., "Delete [Book Title]").

## 2024-05-22 - Semantic Navigation Elements
**Learning:** Using `div` with `onClick` for main navigation (like logos) completely excludes keyboard users.
**Action:** Always use `<button>` or `<a>` for interactive navigation elements. If styling requires a custom look, use a button and style it with Tailwind's utility classes (`bg-transparent`, `p-0`, etc.) and ensure focus states are visible.
