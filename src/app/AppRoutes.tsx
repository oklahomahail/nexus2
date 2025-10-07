import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";

import AppLayout from "@/layouts/AppLayout";
import ClientLayout from "@/layouts/ClientLayout";
import ClientsPage from "@/pages/ClientsPage";
import Dashboard from "@/pages/Dashboard";

// Lazy load heavy pages
const ClientDashboard = lazy(() => import("@/pages/client/ClientDashboard"));
const ClientCampaigns = lazy(() => import("@/pages/client/ClientCampaigns"));
const ClientReports = lazy(() => import("@/pages/client/ClientReports"));
const ClientAnalytics = lazy(() => import("@/pages/client/ClientAnalytics"));
const CampaignBuilder = lazy(() => import("@/pages/client/CampaignBuilder"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-gray-600">Loading...</div>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      {/* Global layout routes */}
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<ClientsPage />} />
      </Route>

      {/* Client-specific layout routes */}
      <Route path="clients/:clientId" element={<ClientLayout />}>
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientDashboard />
            </Suspense>
          }
        />
        <Route
          path="campaigns"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientCampaigns />
            </Suspense>
          }
        />
        <Route
          path="campaigns/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <CampaignBuilder />
            </Suspense>
          }
        />
        <Route
          path="campaigns/:campaignId"
          element={
            <Suspense fallback={<PageLoader />}>
              <CampaignBuilder />
            </Suspense>
          }
        />
        <Route
          path="analytics"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientAnalytics />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientReports />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
