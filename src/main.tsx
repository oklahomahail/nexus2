// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

// Load global styles (Tailwind v4)
import "./index.css";

import App from "./App";
import { AppProviders } from "./context/AppProviders";
import { initSentry } from "./lib/sentry";

// Initialize Sentry monitoring (Phase 4)
initSentry();

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error('Root element "#root" not found');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
