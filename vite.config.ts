// vite.config.ts
/// <reference types="vitest" />

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    sourcemap: true,
    outDir: "dist",
  },
  test: {
    globals: true, // provide global expect/test/vi
    environment: "jsdom", // DOM APIs for React tests
    setupFiles: "./src/test/setup.ts",
  },
});
