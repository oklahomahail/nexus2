// src/main.tsx
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { AppProviders } from "./context/AppProviders"; // ✅ use the combined provider

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>,
);
