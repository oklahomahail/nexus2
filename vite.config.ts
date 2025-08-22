// vite.config.ts
/// <reference types="vitest" />

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "recharts",
      "@tiptap/react",
      "@tiptap/core",
      "@tiptap/pm",
      "lucide-react",
    ],
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true, // ensure clean builds in CI
    rollupOptions: {
      // keep React in-bundle unless you explicitly externalize it
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    // Dev proxy so a relative VITE_WEBSOCKET_URL=/ws upgrades correctly
    proxy: {
      "/ws": {
        target: "http://localhost:8787", // your WS server in dev
        ws: true,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    strictPort: false,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    coverage: { provider: "v8" },
  },
});
