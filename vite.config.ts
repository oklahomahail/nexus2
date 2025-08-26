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
    include: ["react", "react-dom", "react/jsx-runtime"],
    // Exclude heavy libraries to allow proper chunking
    exclude: ["recharts", "lucide-react"],
  },
  build: {
    sourcemap: true,
    outDir: "dist",
    emptyOutDir: true,
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Manual chunking for better caching and loading
        manualChunks: {
          // Vendor chunk for stable dependencies
          vendor: ["react", "react-dom", "react-router-dom"],

          // UI library chunk
          ui: ["clsx", "tailwindcss"],

          // Charts chunk (heavy library)
          charts: ["recharts"],

          // Icons chunk (many small imports)
          icons: ["lucide-react"],

          // Analytics features (heavy, not always used)
          analytics: [
            "./src/components/analytics/ComparativeCampaignAnalysis.tsx",
            "./src/components/analytics/WritingStats.tsx",
            "./src/panels/AnalyticsDashboard.tsx",
          ],

          // Utils and services
          utils: [
            "crypto-js",
            "uuid",
            "zod",
            "./src/services/analyticsService.ts",
            "./src/services/campaignService.ts",
          ],
        },

        // Optimize chunk names for caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId
                .split("/")
                .pop()
                ?.replace(".tsx", "")
                .replace(".ts", "") || "chunk"
            : "chunk";
          return `js/${facadeModuleId}-[hash].js`;
        },
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    open: false,
    proxy: {
      "/ws": {
        target: "http://localhost:8787",
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
