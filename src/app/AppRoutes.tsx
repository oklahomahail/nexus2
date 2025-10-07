import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";
import ClientsPage from "@/pages/ClientsPage";

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
      <Route element={<AppShell />}>
        <Route path="/" element={<Navigate to="/clients" replace />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route
          path="/clients/:clientId"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientDashboard />
            </Suspense>
          }
        />
        <Route
          path="/clients/:clientId/campaigns"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientCampaigns />
            </Suspense>
          }
        />
        <Route
          path="/clients/:clientId/campaigns/new"
          element={
            <Suspense fallback={<PageLoader />}>
              <CampaignBuilder />
            </Suspense>
          }
        />
        <Route
          path="/clients/:clientId/campaigns/:campaignId"
          element={
            <Suspense fallback={<PageLoader />}>
              <CampaignBuilder />
            </Suspense>
          }
        />
        <Route
          path="/clients/:clientId/analytics"
          element={
            <Suspense fallback={<PageLoader />}>
              <ClientAnalytics />
            </Suspense>
          }
        />
        <Route
          path="/clients/:clientId/reports"
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
