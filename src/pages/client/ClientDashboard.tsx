/**
 * Client Dashboard
 *
 * Track15 three-panel layout:
 * - Campaign Engine (dominant panel)
 * - Analytics (quick metrics)
 * - Knowledge Base (quick access)
 */

import React from "react";
import { useParams } from "react-router-dom";
import { useClient } from "@/context/ClientContext";

import CampaignEngineSection from "@/components/dashboard/CampaignEngineSection";
import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import KnowledgeBaseSection from "@/components/dashboard/KnowledgeBaseSection";

export default function ClientDashboard() {
  const { clientId } = useParams();
  const { currentClient } = useClient();

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-6" data-tutorial-step="dashboard.page">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {currentClient?.name || "Client"} Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track15-powered campaign and donor management
          </p>
        </div>

        {/* Three-Panel Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Campaign Engine - Dominant Panel (60%) */}
          <div className="lg:col-span-7">
            <CampaignEngineSection />
          </div>

          {/* Right Column - Analytics + Knowledge Base (40%) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Analytics Section */}
            <AnalyticsSection />

            {/* Knowledge Base Section */}
            <KnowledgeBaseSection />
          </div>
        </div>
      </div>
    </div>
  );
}
