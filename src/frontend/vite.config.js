import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Placeholder: add progressive web app config and offline caching in later phase.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
