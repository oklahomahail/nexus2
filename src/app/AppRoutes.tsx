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
const KnowledgeBase = lazy(() => import("@/pages/client/KnowledgeBase"));
const Track15Analytics = lazy(() => import("@/pages/client/Track15Analytics"));
const Track15CampaignWizard = lazy(
  () => import("@/pages/client/Track15CampaignWizard"),
);
const ClientDataQuality = lazy(
  () => import("@/pages/client/ClientDataQuality"),
);

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
          path="campaigns/new/track15"
          element={
            <Suspense fallback={<PageLoader />}>
              <Track15CampaignWizard />
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
        <Route
          path="knowledge"
          element={
            <Suspense fallback={<PageLoader />}>
              <KnowledgeBase />
            </Suspense>
          }
        />
        <Route
          path="track15"
          element={
            <Suspense fallback={<PageLoader />}>
              <Track15Analytics />
            </Suspense>
          }
        />
        <Route
          path="data-quality"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientDataQuality />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
