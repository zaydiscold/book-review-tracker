import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Placeholder: add progressive web app config and offline caching in later phase.
export default defineConfig({
  plugins: [react()],
  base: "/book-review-tracker/",
  server: {
    port: 5173,
    fs: {
      allow: [
        path.resolve(__dirname, "."),
        path.resolve(__dirname, ".."),
        path.resolve(__dirname, "..", "..")
      ]
    }
  }
});
