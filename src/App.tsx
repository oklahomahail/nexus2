// src/App.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

import { TutorialManager } from "@/features/tutorials/TutorialManager";
import type { TutorialConfig } from "@/features/tutorials/types";

import CampaignCreationWizard from "./components/CampaignCreationWizard";
import FormComponentsDemo from "./components/demos/FormComponentsDemo";
import NotificationsPanel from "./components/NotificationsPanel";
import Topbar from "./components/Topbar";
import CampaignBuilderDemo from "./pages/CampaignBuilderDemo";
import CampaignOverviewDemo from "./pages/CampaignOverviewDemo";
import ClientDashboard from "./pages/ClientDashboard";
import ClientList from "./pages/ClientList";
import MessagingFrameworkDemo from "./pages/MessagingFrameworkDemo";
import AnalyticsDashboard from "./panels/AnalyticsDashboard";
import CampaignsPanel from "./panels/CampaignsPanel";

function NotificationsRoute() {
  return (
    <div className="max-w-md mx-auto mt-8">
      <NotificationsPanel onClose={() => window.history.back()} />
    </div>
  );
}

function NotFound() {
  return (
    <div className="text-slate-100">
      <h1 className="text-xl font-semibold mb-2">Page not found</h1>
      <p className="text-slate-300">Check the URL or use the navigation.</p>
    </div>
  );
}

function NewCampaignPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    // Navigate back to campaigns page
    void navigate("/campaigns");
  };

  const handleSaved = (_campaign: any) => {
    // Navigate to campaigns page after successful creation
    void navigate("/campaigns");
  };

  return (
    <CampaignCreationWizard
      open={true}
      onClose={handleClose}
      onSaved={handleSaved}
    />
  );
}

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
    <div className="min-h-screen bg-bg text-text">
      <Topbar title="Dashboard" />
      <main className="">
        <Routes>
          {/* Landing page at "/" */}
          <Route path="/" element={<AnalyticsDashboard />} />

          {/* Primary app routes */}
          <Route path="/clients" element={<ClientList />} />
          <Route path="/client/:id" element={<ClientDashboard />} />
          <Route path="/campaigns" element={<CampaignsPanel />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />

          {/* Demos */}
          <Route
            path="/demo/campaign-overview"
            element={<CampaignOverviewDemo />}
          />
          <Route
            path="/demo/campaign-builder"
            element={<CampaignBuilderDemo />}
          />
          <Route
            path="/demo/messaging-framework"
            element={<MessagingFrameworkDemo />}
          />
          <Route
            path="/demo/form-components"
            element={<FormComponentsDemo />}
          />

          {/* Modals-as-routes */}
          <Route path="/notifications" element={<NotificationsRoute />} />
          <Route path="/campaigns/new" element={<NewCampaignPage />} />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Render the tutorial manager at root so it can spotlight anywhere */}
      <TutorialManager config={versionedConfig} />
    </div>
  );
};

export default App;
