const express = require("express");
const cors = require("cors");

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

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Book Review Tracker API listening on http://localhost:${port}`);
});
