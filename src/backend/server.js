const express = require("express");
const cors = require("cors");
const axios = require("axios");

// Book Review Tracker Backend Server
const app = express();
app.use(cors());
app.use(express.json());

const PYTHON_SERVICE_URL = "http://localhost:5001";

// Health check endpoint
app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

// Placeholder endpoints
app.post("/api/books", (_request, response) => {
  response.status(501).json({
    message: "Local-first mode only. Use IndexedDB client instead."
  });
});

app.post("/api/scan", (_request, response) => {
  response.json({ message: "Not implemented" });
});

// ===== LIBGEN API ENDPOINTS (Proxy to Python Service) =====

/**
 * POST /api/libgen/search
 * Search LibGen for books via Python microservice
 * Body: { query, count?, search_in? }
 */
app.post("/api/libgen/search", async (request, response) => {
  try {
    const { query, count = 25, search_in = 'def' } = request.body;

    if (!query || query.length < 3) {
      return response.status(400).json({
        error: "Search query must be at least 3 characters long"
      });
    }

    // Map frontend parameters to Python service parameters
    let search_type = "default";
    if (search_in === 'title') search_type = "title";
    if (search_in === 'author') search_type = "author";

    console.log(`[Proxy] Forwarding search to Python service: ${query} (${search_type})`);

    const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/search`, {
      query,
      search_type,
      topics: ["libgen", "fiction"] // Search both by default
    });

    const results = pythonResponse.data.results || [];

    response.json({
      results: results.slice(0, count), // Limit results if needed
      count: results.length,
      query,
      search_in
    });

  } catch (error) {
    console.error("Error proxying to Python service:", error.message);
    if (error.code === 'ECONNREFUSED') {
      return response.status(503).json({
        error: "LibGen service unavailable",
        message: "The Python microservice is not running or unreachable."
      });
    }
    response.status(500).json({
      error: "Failed to search libgen",
      message: error.response?.data?.detail || error.message
    });
  }
});

/**
 * POST /api/libgen/resolve
 * Resolve a direct download link for a book
 * Body: { book_data }
 */
app.post("/api/libgen/resolve", async (request, response) => {
  try {
    const { book_data } = request.body;

    if (!book_data) {
      return response.status(400).json({ error: "book_data is required" });
    }

    console.log(`[Proxy] Resolving download link for: ${book_data.title}`);

    const pythonResponse = await axios.post(`${PYTHON_SERVICE_URL}/resolve`, {
      book_data
    });

    response.json(pythonResponse.data);

  } catch (error) {
    console.error("Error resolving link via Python service:", error.message);
    response.status(500).json({
      error: "Failed to resolve download link",
      message: error.response?.data?.detail || error.message
    });
  }
});

// Start server
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Book Review Tracker API listening on http://localhost:${port}`);
  console.log(`Proxying LibGen requests to ${PYTHON_SERVICE_URL}`);
});
