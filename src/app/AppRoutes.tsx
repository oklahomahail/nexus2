import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import ClientsPage from "@/pages/ClientsPage";
import ClientDashboard from "@/pages/client/ClientDashboard";
import ClientCampaigns from "@/pages/client/ClientCampaigns";
import ClientReports from "@/pages/client/ClientReports";
import ClientAnalytics from "@/pages/client/ClientAnalytics";
import CampaignBuilder from "@/pages/client/CampaignBuilder";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/clients" replace />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/clients/:clientId" element={<ClientDashboard />} />
        <Route path="/clients/:clientId/campaigns" element={<ClientCampaigns />} />
        <Route path="/clients/:clientId/campaigns/new" element={<CampaignBuilder />} />
        <Route path="/clients/:clientId/campaigns/:campaignId" element={<CampaignBuilder />} />
        <Route path="/clients/:clientId/analytics" element={<ClientAnalytics />} />
        <Route path="/clients/:clientId/reports" element={<ClientReports />} />
      </Route>
    </Routes>
  );
}