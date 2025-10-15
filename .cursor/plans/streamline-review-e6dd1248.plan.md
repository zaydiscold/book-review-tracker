<!-- e6dd1248-cea9-4d77-a30b-3473d1318d87 56b1c616-ad4c-4140-882e-6fc1263217fc -->
# Streamline Book Review Tracker Workflow

## Overview

Transform the UI from a multi-section form layout into a streamlined, modal-based experience. Remove the separate "Add Review" section and use popups for all review operations (add/edit).

## Key Changes

### 1. Remove Separate "Add Review" Section

**File: `src/frontend/App.jsx`**

- Delete the entire "Add Review" card section (lines ~1308-1400)
- Remove related state: `reviewForm`, `editingBookId`
- Remove handlers: `handleAddReview`, `handleReviewBookChange`
- Keep only the inline review option when adding/editing books

### 2. Implement Review Modal Component

**File: `src/frontend/App.jsx`**

Create a reusable modal component for adding/editing reviews:

- Modal overlay with backdrop
- Star rating input (reuse existing `StarRatingInput`)
- Review text area
- Auto-correct toggle
- Save/Cancel buttons
- Displays book title/author at top for context

Add modal state:

```javascript
const [reviewModal, setReviewModal] = useState({
  isOpen: false,
  bookId: null,
  book: null,
  existingReview: null
});
```

### 3. Update Library Section - Add "Add Review" Buttons

**File: `src/frontend/App.jsx` (lines ~1404-1556)**

For each book in the library view:

- If book has NO review: Show "Add Review" button
- If book HAS review: Show existing review with "Edit" button
- Both buttons open the review modal
- Keep "Delete" button functionality

Replace inline edit flow with modal trigger:

```javascript
// Instead of beginEditReview loading into form
function openReviewModal(book, existingReview = null) {
  setReviewModal({
    isOpen: true,
    bookId: book.id,
    book: book,
    existingReview: existingReview
  });
}
```

### 4. Modal Review Submission Handler

**File: `src/frontend/App.jsx`**

Create new handler that:

- Validates rating (0-5)
- Applies spellcheck if enabled
- Saves to IndexedDB via `saveReview()`
- Posts to Discord if webhook configured
- Closes modal and refreshes data
- Shows success/error toast

### 5. Simplify "Add Book" Section

**File: `src/frontend/App.jsx` (lines ~991-1306)**

Keep the inline review option when adding books, but:

- Make the UI more compact
- Consider collapsible sections for cover settings
- Improve visual hierarchy (search at top, form below)

### 6. Reorganize Main Layout

**File: `src/frontend/App.jsx` (lines ~956-1646)**

New structure:

```
[Header]
[Add Book Card - with OpenLibrary search and inline review option]
[Library Section - books with modal-based review buttons]
[Discord/Tools Section - side-by-side at bottom]
```

Remove the second card entirely, consolidate spacing.

### 7. Add Modal Styling

**File: `src/frontend/App.jsx` (styles object, lines ~1650-2384)**

Add styles for:

- `modalOverlay` - full-screen backdrop (semi-transparent dark)
- `modalContainer` - centered modal box
- `modalHeader` - title with close button
- `modalBody` - form content
- `modalFooter` - action buttons
- `modalCloseButton` - X button styling

Use theme colors and match existing aesthetic (warm orange gradient borders, backdrop blur).

### 8. Improve Book Status Flow

**File: `src/frontend/App.jsx`**

Current flow is confusing with "Add review with book" checkbox:

- For wishlist/library status: Hide inline review entirely (already doing this)
- For other statuses: Show inline review by default, allow unchecking
- Make it clearer that reviews can always be added later via library

### 9. Clean Up State Management

**File: `src/frontend/App.jsx`**

Remove unused state after removing "Add Review" section:

- `reviewForm` and `emptyReviewForm`
- `editingBookId` (distinct from `editingBookFormId`)
- Simplify state initialization

### 10. Update Toast Messages

**File: `src/frontend/App.jsx`**

Adjust success messages:

- "Review added" when adding via modal
- "Review updated" when editing via modal
- "Book saved" when saving book without review
- "Book and review saved" when using inline option

## Benefits

1. **Cleaner UI**: One less section cluttering the interface
2. **Better UX**: Modal focuses attention on review writing
3. **Context-aware**: Modal shows which book you're reviewing
4. **Consistent**: Same modal for add and edit operations
5. **Streamlined**: Faster workflow - click book → click "Add Review" → write → save
6. **Mobile-friendly**: Modals work better on small screens than scrolling between sections

## Implementation Notes

- Modal should trap focus (accessibility)
- Escape key should close modal
- Clicking backdrop should close modal (with confirmation if text entered)
- Modal should be responsive (smaller on mobile)
- Preserve all existing functionality (spellcheck, Discord posting, rating validation)

### To-dos

- [x] Create reusable ReviewModal component with form fields, styling, and handlers
- [x] Add 'Add Review' and 'Edit' buttons to library items that open the modal
- [x] Remove the separate 'Add Review' card section and related state/handlers
- [x] Add modal styling (overlay, container, header, body, footer) matching theme
- [x] Reorganize main layout to be more compact without the review section
- [x] Test all workflows: add book with review, add book without review, add review from library, edit review, delete review
- [x] Fix star rating click logic to use 50/50 split (left half = half star, right half = full star)
- [x] Add OpenLibrary search testing and star rating UX improvements to project roadmap