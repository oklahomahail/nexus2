/// <reference types="vitest" />

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
export default defineConfig({
  base: "/",
  plugins: [react()],

  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
    dedupe: ["react", "react-dom"],
  },

  optimizeDeps: {
    include: ["react", "react-dom", "react/jsx-runtime"],
    exclude: ["recharts", "lucide-react"],
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          icons: ["lucide-react"],
          charts: ["recharts"],
          analytics: [
            "./src/components/analytics/ComparativeCampaignAnalysis.tsx",
            "./src/components/analytics/WritingStats.tsx",
            "./src/panels/AnalyticsDashboard.tsx",
          ],
          utils: [
            "crypto-js",
            "uuid",
            "zod",
            "./src/services/analyticsService.ts",
            "./src/services/campaignService.ts",
          ],
        },
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: (chunkInfo) => {
          const name =
            chunkInfo.name ||
            chunkInfo.facadeModuleId
              ?.split("/")
              .pop()
              ?.replace(/\.(t|j)sx?$/, "") ||
            "chunk";
          return `js/${name}-[hash].js`;
        },
        assetFileNames: ({ name }) => {
          if (!name) return "assets/[name]-[hash][extname]";
          if (/\.(css)$/.test(name)) return "css/[name]-[hash][extname]";
          if (/\.(png|jpe?g|gif|svg|webp|avif)$/.test(name))
            return "img/[name]-[hash][extname]";
          if (/\.(woff2?|ttf|otf|eot)$/.test(name))
            return "fonts/[name]-[hash][extname]";
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    commonjsOptions: { transformMixedEsModules: true },
  },

  server: {
    port: 5173,
    strictPort: false,
    open: false,
    proxy: {
      "/ws": { target: "http://localhost:8787", ws: true, changeOrigin: true },
    },
  },

  preview: { port: 4173, strictPort: false },

  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    coverage: { provider: "v8" },
  },
});
