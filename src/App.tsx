// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { BrowserRouter } from "react-router-dom";

import { ClientProvider } from "@/contexts/ClientContext";
import { TutorialManager } from "@/features/tutorials/TutorialManager";
import { type TutorialConfig } from "@/features/tutorials/useTutorial";
import AppRoutes from "@/app/AppRoutes";

const App: React.FC = () => {
  const [config, setConfig] = useState<TutorialConfig | null>(null);

  // Fetch the tutorial config once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/data/tutorials/nexusTutorial.json", {
          cache: "no-cache",
        });
        const json = (await res.json()) as TutorialConfig;
        if (!cancelled) setConfig(json);
      } catch (e) {
        console.error("Failed to load tutorial config", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Versioned completion key so you can re-show after updates
  const versionedConfig = useMemo(() => {
    if (!config) return null;
    const vKey = `${config.completionStorageKey}:v${config.version || 1}`;
    return { ...config, completionStorageKey: vKey };
  }, [config]);

  // Optional: force the tour on via URL (?tour=1), clearing any completion flag
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tour") === "1" && versionedConfig?.completionStorageKey) {
      localStorage.removeItem(versionedConfig.completionStorageKey);
    }
  }, [versionedConfig]);

  return (
    <BrowserRouter>
      <ClientProvider>
        <AppRoutes />
        <TutorialManager config={versionedConfig} />
      </ClientProvider>
    </BrowserRouter>
  );
};

export default App;
