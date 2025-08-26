// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";

// Load global styles (Tailwind v4)
import "./index.css";

import App from "./App";
import { AppProviders } from "./context/AppProviders";

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
