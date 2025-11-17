# Frontend Architecture - Modular Structure

## Overview

The frontend has been refactored from a monolithic 4,536-line `App.jsx` into a **modular architecture** with organized constants, utilities, components, and styles. This makes the codebase:

- ✅ **Easier to maintain** - Each module has a single responsibility
- ✅ **Easier to test** - Utilities and components can be tested in isolation
- ✅ **Easier to extend** - Add new features without touching the main app
- ✅ **Easier to understand** - Clear separation of concerns
- ✅ **Easier to restart** - Rebuild UI from modular building blocks

## Directory Structure

```
src/frontend/
├── components/          # Reusable UI components
│   ├── index.js        # Component exports
│   ├── Logo.jsx        # App logo component
│   ├── ToastOverlay.jsx          # Toast notifications
│   ├── StarRatingInput.jsx       # Interactive star rating input
│   ├── StarRatingDisplay.jsx     # Display-only star rating
│   ├── LibGenWidget.jsx          # LibGen download widget
│   └── LibGenAnalyticsDashboard.jsx  # LibGen statistics
│
├── constants/           # Application constants
│   ├── theme.js        # Theme colors and UI constants
│   ├── bookStatus.js   # Book status definitions
│   ├── availability.js # Availability status helpers
│   └── defaults.js     # Default form values
│
├── utils/              # Utility functions
│   ├── ratings.js      # Rating conversion utilities
│   ├── formatting.js   # Text and date formatting
│   └── bookMatching.js # Book matching and auto-population
│
├── styles/             # Centralized styles
│   ├── variables.css   # CSS variables
│   └── appStyles.js    # JavaScript style objects
│
├── App.jsx            # Main application (now 2,735 lines - 40% smaller!)
├── App-old-monolithic.jsx  # Original monolithic version (backup)
├── main.jsx           # React entry point
└── index.html         # HTML template
```

## Module Descriptions

### Constants (`constants/`)

**`theme.js`**
- Theme colors (THEME object)
- Star rating constants (STAR_SYMBOL, STAR_COUNT)
- Time zone (PST_TIME_ZONE)
- Storage keys (DISCORD_STORAGE_KEY, DISCORD_SHARE_MODE_KEY)
- Default status (DEFAULT_STATUS)

**`bookStatus.js`**
- Book status sections and options
- Status label mappings
- Review-disabled statuses
- Unread status utilities

**`availability.js`**
- Availability status copy
- `describeAvailability()` - Get human-readable availability
- `buildAvailabilityActions()` - Build action buttons
- `shouldShowOpenLibraryLink()` - Determine if OL link needed

**`defaults.js`**
- Empty form templates (book, review)
- `createReviewDraft()` - Create review draft with status

### Utilities (`utils/`)

**`ratings.js`**
- `normalizeFiveValue()` - Normalize rating to 0-5 scale
- `toFiveScale()` - Convert 10-point to 5-point rating
- `fromFiveScale()` - Convert 5-point to 10-point rating
- `formatFiveScaleDisplay()` - Format rating for display

**`formatting.js`**
- `formatTimestampForDisplay()` - Format ISO timestamp
- `normalizeForMatch()` - Normalize text for matching
- `compactForComparison()` - Compact text for comparison
- `extractAuthorCandidates()` - Extract author names

**`bookMatching.js`**
- `authorsIntersect()` - Check if authors match
- `autoPopulateCoverIfNeeded()` - Auto-fetch cover from Open Library
- `applyBookUpdateToList()` - Update book in list

### Components (`components/`)

All components are exported from `components/index.js` for easy importing:

```javascript
import { Logo, ToastOverlay, StarRatingInput } from "./components";
```

**`Logo.jsx`**
- Renders the app logo with SVG graphics
- Displays app title and tagline

**`ToastOverlay.jsx`**
- Toast notification system
- Supports success, error, warning, info tones
- Uses React Portal for top-level rendering

**`StarRatingInput.jsx`**
- Interactive star rating component
- Half-star precision
- Keyboard navigation support
- Hover preview

**`StarRatingDisplay.jsx`**
- Display-only star rating
- Exports `renderStarRating()` function

**`LibGenWidget.jsx`**
- LibGen download options
- Version switcher for multiple results
- File metadata display

**`LibGenAnalyticsDashboard.jsx`**
- Library statistics
- Format breakdown
- Batch search trigger

### Styles (`styles/`)

**`appStyles.js`**
- Centralized JavaScript style objects
- Imports THEME from constants
- 1,000+ lines of styles organized by component

**`variables.css`**
- CSS custom properties
- Global color palette
- Typography settings

## Usage Examples

### Importing Constants

```javascript
import { DEFAULT_STATUS, THEME } from "./constants/theme";
import { BOOK_STATUS_SECTIONS, isUnreadStatus } from "./constants/bookStatus";
import { describeAvailability } from "./constants/availability";
```

### Importing Utilities

```javascript
import { toFiveScale, formatFiveScaleDisplay } from "./utils/ratings";
import { formatTimestampForDisplay } from "./utils/formatting";
import { autoPopulateCoverIfNeeded } from "./utils/bookMatching";
```

### Importing Components

```javascript
import { Logo, ToastOverlay, StarRatingInput } from "./components";
```

### Importing Styles

```javascript
import { styles } from "./styles/appStyles";

// Use in components
<div style={styles.card}>...</div>
```

## Migration Notes

### Before (Monolithic)
```javascript
// Everything in one 4,536-line file
const THEME = { ... };
const BOOK_STATUS_SECTIONS = [ ... ];
function Logo() { ... }
function toFiveScale(rating) { ... }
const styles = { ... };
export default function App() { ... }
```

### After (Modular)
```javascript
// Clean imports at the top
import { THEME } from "./constants/theme";
import { BOOK_STATUS_SECTIONS } from "./constants/bookStatus";
import { Logo } from "./components";
import { toFiveScale } from "./utils/ratings";
import { styles } from "./styles/appStyles";

export default function App() { ... }
```

## Benefits

### 1. **Maintainability**
- Each module focuses on one concern
- Easy to find and update specific functionality
- Reduced risk of breaking unrelated features

### 2. **Testability**
- Utilities can be unit tested independently
- Components can be tested in isolation
- Easier to mock dependencies

### 3. **Reusability**
- Components can be used across different pages
- Utilities can be shared between features
- Constants ensure consistency

### 4. **Developer Experience**
- Faster navigation with smaller files
- Better IDE autocomplete
- Easier code reviews

### 5. **Restart Capability**
- Clear building blocks for UI rebuild
- Can replace individual modules without touching others
- Easy to add new components or utilities

## Next Steps

### Potential Further Refactoring

1. **Extract Form Components**
   - BookForm
   - ReviewForm
   - SearchForm

2. **Extract List Components**
   - BookList
   - ReviewList
   - SearchResults

3. **Extract Modal Components**
   - ReviewModal
   - SettingsModal

4. **Create Custom Hooks**
   - useBooks
   - useReviews
   - useToast
   - useDiscord

5. **Add Context Providers**
   - BooksContext
   - ReviewsContext
   - SettingsContext

## File Sizes

| File | Lines | Description |
|------|-------|-------------|
| **Before** | | |
| `App.jsx` (old) | 4,536 | Monolithic file |
| | | |
| **After** | | |
| `App.jsx` (new) | 2,735 | Main app (40% reduction) |
| `constants/theme.js` | 32 | Theme constants |
| `constants/bookStatus.js` | 47 | Book status constants |
| `constants/availability.js` | 77 | Availability utilities |
| `constants/defaults.js` | 27 | Default forms |
| `utils/ratings.js` | 42 | Rating utilities |
| `utils/formatting.js` | 52 | Formatting utilities |
| `utils/bookMatching.js` | 95 | Book matching utilities |
| `components/Logo.jsx` | 61 | Logo component |
| `components/ToastOverlay.jsx` | 48 | Toast component |
| `components/StarRatingInput.jsx` | 115 | Star input component |
| `components/StarRatingDisplay.jsx` | 40 | Star display component |
| `components/LibGenWidget.jsx` | 97 | LibGen widget |
| `components/LibGenAnalyticsDashboard.jsx` | 73 | LibGen analytics |
| `styles/appStyles.js` | 1,093 | Centralized styles |
| **Total (new)** | **4,634** | **Modular structure** |

**Note:** While total lines increased slightly due to imports and module boilerplate, the code is now:
- 40% reduction in main App.jsx
- Much easier to navigate and maintain
- Properly organized by concern
- Ready for testing and extension

## Backup

The original monolithic `App.jsx` is saved as `App-old-monolithic.jsx` for reference.
