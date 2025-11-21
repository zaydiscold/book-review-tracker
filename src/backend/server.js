const express = require("express");
const cors = require("cors");
const libgenService = require("./services/libgenService");

// Book Review Tracker Backend Server
const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

// Placeholder endpoints for future features
app.post("/api/books", (_request, response) => {
  response.status(501).json({
    message: "Local-first mode only. Use IndexedDB client instead."
  });
});

app.post("/api/scan", (_request, response) => {
  response.json({ message: "Not implemented" });
});

// ===== LIBGEN API ENDPOINTS =====

/**
 * GET /api/libgen/mirror
 * Returns the fastest available LibGen mirror
 */
app.get("/api/libgen/mirror", async (_request, response) => {
  try {
    const mirror = await libgenService.getMirror();
    response.json({ mirror });
  } catch (error) {
    console.error("Error fetching libgen mirror:", error);
    response.status(500).json({
      error: "Failed to fetch libgen mirror",
      message: error.message
    });
  }
});

/**
 * POST /api/libgen/search
 * Search LibGen for books
 * Body: { query, count?, search_in? }
 */
app.post("/api/libgen/search", async (request, response) => {
  try {
    const { query, count = 25, search_in = 'def' } = request.body;

    // Validate query
    if (!query) {
      return response.status(400).json({
        error: "Query parameter is required"
      });
    }

    if (query.length < 3) {
      return response.status(400).json({
        error: "Search query must be at least 3 characters long"
      });
    }

    // Perform search based on search_in field
    let results;
    if (search_in === 'title') {
      results = await libgenService.searchByTitle(query, { count });
    } else if (search_in === 'author') {
      results = await libgenService.searchByAuthor(query, { count });
    } else {
      results = await libgenService.search(query, { count, search_in });
    }

    response.json({
      results: results || [],
      count: results ? results.length : 0,
      query,
      search_in
    });
  } catch (error) {
    console.error("Error searching libgen:", error);
    response.status(500).json({
      error: "Failed to search libgen",
      message: error.message
    });
  }
});

/**
 * GET /api/libgen/latest
 * Get the latest uploaded book to LibGen
 */
app.get("/api/libgen/latest", async (_request, response) => {
  try {
    const latest = await libgenService.getLatest();
    response.json({
      latest,
      mirror: latest.mirrors && latest.mirrors[0]
    });
  } catch (error) {
    console.error("Error fetching latest from libgen:", error);
    response.status(500).json({
      error: "Failed to fetch latest from libgen",
      message: error.message
    });
  }
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Book Review Tracker API listening on http://localhost:${port}`);
});
