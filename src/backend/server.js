const express = require("express");
const cors = require("cors");
const libgen = require("libgen");

// Placeholder: future releases will persist submissions server-side and sync to cloud providers.
const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.post("/api/books", (_request, response) => {
  response.status(501).json({
    message: "Local-first mode only. Use IndexedDB client instead."
  });
});

app.post("/api/scan", (_request, response) => {
  response.json({ message: "Not implemented" });
});

// Libgen API endpoints
app.get("/api/libgen/mirror", async (_request, response) => {
  try {
    const mirror = await libgen.mirror();
    response.json({ mirror });
  } catch (error) {
    console.error("Error fetching libgen mirror:", error);
    response.status(500).json({
      error: "Failed to fetch libgen mirror",
      message: error.message
    });
  }
});

app.post("/api/libgen/search", async (request, response) => {
  try {
    const { query, count = 10, sort_by, reverse } = request.body;

    if (!query) {
      return response.status(400).json({ error: "Query parameter is required" });
    }

    // Get the fastest mirror first
    let mirror;
    try {
      mirror = await libgen.mirror();
    } catch (err) {
      // Fallback to default mirror if mirror test fails
      mirror = "http://libgen.is";
      console.warn("Using fallback mirror:", mirror);
    }

    const options = {
      mirror,
      query,
      count: parseInt(count, 10),
      sort_by: sort_by || "def",
      reverse: reverse || false
    };

    const results = await libgen.search(options);

    // Ensure results is an array
    if (!Array.isArray(results)) {
      console.warn("Libgen search returned non-array result:", results);
      return response.json({
        results: [],
        mirror,
        count: 0,
        warning: "No results found or invalid response from libgen"
      });
    }

    // Normalize results to include download links
    const normalizedResults = results.map(result => ({
      ...result,
      downloadUrl: `${mirror}/book/index.php?md5=${result.md5?.toLowerCase()}`,
      mirrors: [
        `http://libgen.is/book/index.php?md5=${result.md5?.toLowerCase()}`,
        `http://gen.lib.rus.ec/book/index.php?md5=${result.md5?.toLowerCase()}`
      ]
    }));

    response.json({
      results: normalizedResults,
      mirror,
      count: normalizedResults.length
    });
  } catch (error) {
    console.error("Error searching libgen:", error);
    response.status(500).json({
      error: "Failed to search libgen",
      message: error.message
    });
  }
});

app.get("/api/libgen/latest", async (_request, response) => {
  try {
    let mirror;
    try {
      mirror = await libgen.mirror();
    } catch (err) {
      mirror = "http://libgen.is";
    }

    const latestText = await libgen.latest.text(mirror);
    response.json({
      latest: {
        ...latestText,
        downloadUrl: `${mirror}/book/index.php?md5=${latestText.md5?.toLowerCase()}`
      },
      mirror
    });
  } catch (error) {
    console.error("Error fetching latest from libgen:", error);
    response.status(500).json({
      error: "Failed to fetch latest from libgen",
      message: error.message
    });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Book Review Tracker API listening on http://localhost:${port}`);
});
