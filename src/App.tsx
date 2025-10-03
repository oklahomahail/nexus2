// src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import CampaignCreationWizard from "./components/CampaignCreationWizard";
import NotificationsPanel from "./components/NotificationsPanel";
import Topbar from "./components/Topbar";
import { useNotifications } from "./hooks/useNotifications";
import ClientDashboard from "./pages/ClientDashboard";
import ClientList from "./pages/ClientList";
import AnalyticsDashboard from "./panels/AnalyticsDashboard";
import CampaignsPanel from "./panels/CampaignsPanel";

function NotificationsRoute() {
  const notifications = useNotifications();
  return (
    <div className="max-w-md mx-auto mt-8">
      <NotificationsPanel
        notifications={notifications.notifications}
        onClose={() => window.history.back()}
        onMarkAsRead={notifications.markAsRead}
        onMarkAllAsRead={notifications.markAllAsRead}
      />
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
        </Routes>
      </main>
    </div>
  );
};

export default App;
