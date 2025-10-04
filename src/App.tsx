// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
          <Route path="/notifications" element={<NotificationsRoute />} />
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
        </Routes>
      </main>
    </div>
  );
};

export default App;
