# 📚 My Reading Journal

A beautiful, cozy book tracking app with a warm aesthetic perfect for book lovers.

![Status](https://img.shields.io/badge/status-ready-success)
![Design](https://img.shields.io/badge/design-cozy-pink)
![Data](https://img.shields.io/badge/storage-local--first-blue)

---

## ✨ Features

- 📖 **Track Your Books** - Add, edit, and organize your reading collection
- ⭐ **Write Reviews** - Rate books 0-5 stars with detailed reviews
- 🔍 **Search & Discover** - Find books via OpenLibrary API
- 🎨 **Beautiful UI** - Cozy, elegant design with soft colors and smooth animations
- 💾 **Local-First** - All data stored in your browser (IndexedDB), no account needed
- 📊 **Export/Import** - Save your library as JSON anytime

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- npm or yarn

### Installation

```bash
# 1. Install frontend dependencies
cd src/frontend
npm install

# 2. Install backend dependencies (for LibGen)
cd ../backend
npm install

# 3. Start both servers
cd ../backend
node server.js          # Backend on port 4000

# In another terminal:
cd src/frontend
npm run dev             # Frontend on port 5173
```

### Access the App
Open http://localhost:5173/book-review-tracker/ in your browser

---

## 🎨 Design

### Color Palette
- **Cream** (#FFFBF5) - Warm backgrounds
- **Rose** (#FB7185) - Primary actions  
- **Lavender** (#C084FC) - Secondary actions
- **Sage** (#495749) - Text content
- **Honey** (#FBBF24) - Star ratings

### Fonts
- **Playfair Display** - Elegant serif for headers
- **Inter** - Clean sans-serif for body text
- **Dancing Script** - Handwriting style for accents

### Visual Style
- Soft, rounded corners (1.5-2rem)
- Gentle shadows (no harsh edges)
- Glass morphism effects
- Warm gradient backgrounds
- Smooth 200-300ms transitions

---

## 📂 Project Structure

```
book-review-tracker/
├── src/
│   ├── backend/
│   │   ├── server.js                 # Express API server
│   │   ├── services/
│   │   │   └── libgenService.js      # LibGen integration
│   │   └── package.json
│   │
│   └── frontend/
│       ├── index.html
│       ├── App.jsx                   # Main app component
│       ├── tailwind.config.js        # Cozy theme config
│       ├── index.css                 # Global styles
│       │
│       ├── components/               # UI components
│       ├── data/                     # API clients & DB
│       ├── utils/                    # Helper functions
│       └── styles/                   # Style definitions
│
└── README.md                         # This file
```

---

## 🔧 Technical Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **IndexedDB** - Local data storage

### Backend
- **Express** - REST API server
- **libgen npm** - LibGen search integration
- **CORS** - Cross-origin support

### APIs
- **OpenLibrary** - Book metadata & covers
- **LibGen** - Open-access book repository (when available)

---

## 💡 Usage Guide

### Adding Books

**Method 1: Manual Entry**
1. Fill out the "Add Book" form
2. Enter title, author, and status
3. Optionally add a cover (URL or ISBN)
4. Click "Add Book"

**Method 2: Search OpenLibrary**
1. Use the search bar at the top
2. Type a book title or author
3. Click "Search"
4. Click "Use" on a result to populate the form
5. Click "Add Book"

### Managing Reviews
1. Click "Add review" on any book card
2. Click stars to rate (0-5)
3. Write review text (optional)
4. Submit

### Editing Books
1. Click "Edit details" on a book card
2. Modify any fields
3. Save changes

### Exporting Data
- Your library auto-saves to IndexedDB
- Use browser DevTools → Application → IndexedDB to inspect
- Export feature can be added for JSON backups

---

## 🐛 Known Issues

### LibGen Search
**Status**: Infrastructure ready, but LibGen servers are slow/unreliable

**What Works**:
- ✅ Backend API module (`libgenService.js`)
- ✅ Search endpoints implemented
- ✅ Frontend client ready
- ✅ Result normalization

**Issue**:
- ⚠️ LibGen servers timeout (60+ second responses)
- ⚠️ Network connectivity varies by region

**Workaround**:
- Use OpenLibrary search instead
- LibGen integration will work when servers respond

---

## 🔒 Privacy & Data

- **100% Local-First** - No cloud storage required
- **No Account Needed** - No sign-up, no login
- **No Tracking** - Zero analytics or telemetry
- **Your Data, Your Control** - Export anytime as JSON
- **Works Offline** - After initial load, works without internet

---

## 🚀 Deployment

### Option 1: Static Hosting (Netlify, Vercel)
```bash
cd src/frontend
npm run build
# Deploy the `dist/` folder
```

### Option 2: Self-Hosted
```bash
# Build frontend
cd src/frontend
npm run build

# Serve with any static file server
npx serve dist -l 3000
```

**Note**: Backend (LibGen) is optional. App works fully without it using only OpenLibrary.

---

## 🛠️ Development

### Frontend Dev
```bash
cd src/frontend
npm run dev        # Start dev server
npm run build      # Build for production
npm run preview    # Preview production build
```

### Backend Dev
```bash
cd src/backend
node server.js              # Start API server
npm run dev                 # Start with nodemon (auto-reload)
```

### Code Style
- **ESLint** for linting
- **Prettier** for formatting
- **Tailwind** for styling (utility-first)

---

## 📊 Architecture Decisions

### Why Local-First?
- **Privacy**: Your reading data stays on your device
- **Speed**: No network latency for reads/writes
- **Reliability**: Works offline, no server downtime
- **Simplicity**: No backend required for core features

### Why IndexedDB?
- **Capacity**: Store thousands of books + reviews
- **Performance**: Fast lookups and queries
- **Browser Native**: No external dependencies
- **Structured**: Proper database with indexes

### Why Tailwind?
- **Design System**: Consistent spacing, colors, shadows
- **Developer Experience**: Fast iteration, no context switching
- **Performance**: Purges unused CSS in production
- **Customization**: Easy to extend with custom values

---

## 🔮 Future Enhancements

### Short Term
- ✅ Improved LibGen error handling
- ✅ Loading states for API calls
- ✅ Keyboard shortcuts
- ✅ Better mobile responsive design

### Medium Term
- 📊 Reading statistics dashboard
- 🏷️ Tags and categories
- 🔍 Advanced search filters
- 📱 PWA (Progressive Web App)

### Long Term
- ☁️ Optional cloud sync (Supabase)
- 📲 Mobile app (React Native)
- 👥 Social features (share reviews)
- 📚 Import from Goodreads

---

## 🤝 Contributing

This is a personal project, but suggestions are welcome!

### Reporting Bugs
- Check if already reported
- Include steps to reproduce
- Add browser/OS info

### Suggesting Features
- Explain the use case
- Describe expected behavior
- Consider privacy implications

---

## 📝 License

MIT License - Feel free to use for personal projects

---

## 🙏 Acknowledgments

- **OpenLibrary** - Free book metadata API
- **LibGen** - Open access to knowledge
- **Tailwind CSS** - Amazing utility-first CSS framework
- **React Team** - For an incredible UI library

---

## 📞 Support

### Common Questions

**Q: My books aren't saving**
- Check you're not in private/incognito mode
- Check browser console for IndexedDB errors
- Try a different browser

**Q: LibGen searches don't work**
- This is expected - LibGen servers are slow
- Use OpenLibrary search instead
- Backend module is ready when LibGen responds

**Q: Can I use this without internet?**
- Yes! After first load, works fully offline
- Search features require internet

**Q: How do I backup my data?**
- Currently: Use browser DevTools → Application → IndexedDB
- Future: Export to JSON feature coming

---

## 📖 Quick Reference

### Keyboard Shortcuts (Future)
- `Ctrl/Cmd + K` - Focus search
- `Ctrl/Cmd + N` - New book
- `Escape` - Close modals

### Status Options
- 📖 Reading
- ✅ Finished
- 💭 Want to Read
- ⏸️ Paused
- ❌ DNF (Did Not Finish)

### Rating Scale
- ⭐⭐⭐⭐⭐ 5/5 - Masterpiece
- ⭐⭐⭐⭐ 4/5 - Loved it
- ⭐⭐⭐ 3/5 - Good
- ⭐⭐ 2/5 - Meh
- ⭐ 1/5 - Disliked
- (no stars) 0/5 - Terrible

---

**Built with ❤️ for book lovers**

*Last Updated: 2025-11-20*
