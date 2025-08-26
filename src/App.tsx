// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import CampaignCreationWizard from "./components/CampaignCreationWizard";
import Topbar from "./components/Topbar";
import ClientDashboard from "./pages/ClientDashboard";
import ClientList from "./pages/ClientList";
import AnalyticsDashboard from "./panels/AnalyticsDashboard";
import CampaignsPanel from "./panels/CampaignsPanel";

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900">
      <Topbar title="Dashboard" />
      <main className="p-6">
        <Routes>
          <Route path="/" element={<Navigate to="/clients" replace />} />
          <Route path="/clients" element={<ClientList />} />
          <Route path="/client/:id" element={<ClientDashboard />} />
          <Route path="/campaigns" element={<CampaignsPanel />} />
          <Route
            path="/campaigns/new"
            element={
              <CampaignCreationWizard
                open={false}
                onClose={function (): void {
                  throw new Error("Function not implemented.");
                }}
              />
            }
          />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
