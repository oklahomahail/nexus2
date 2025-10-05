// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";

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

const App: React.FC = () => {
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
          <Route path="/demo/campaign-overview" element={<CampaignOverviewDemo />} />
          <Route path="/demo/campaign-builder" element={<CampaignBuilderDemo />} />
          <Route path="/demo/messaging-framework" element={<MessagingFrameworkDemo />} />
          <Route path="/demo/form-components" element={<FormComponentsDemo />} />

          {/* Modals-as-routes */}
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

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
