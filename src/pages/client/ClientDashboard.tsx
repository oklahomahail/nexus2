/**
 * Client Dashboard
 *
 * Track15 three-panel layout:
 * - Campaign Engine (dominant panel)
 * - Analytics (quick metrics)
 * - Knowledge Base (quick access)
 */

import { useParams } from "react-router-dom";

import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import CampaignEngineSection from "@/components/dashboard/CampaignEngineSection";
import KnowledgeBaseSection from "@/components/dashboard/KnowledgeBaseSection";
import { useClient } from "@/context/ClientContext";

export default function ClientDashboard() {
  const { clientId: _clientId } = useParams();
  const { currentClient } = useClient();

  return (
    <div className="h-full overflow-y-auto bg-[rgb(var(--nexus-slate-50))]">
      <div className="p-8" data-tutorial-step="dashboard.page">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[rgb(var(--nexus-slate-900))] tracking-tight">
            {currentClient?.name || "Client"} Dashboard
          </h1>
          <p className="text-[rgb(var(--nexus-slate-700))] mt-1">
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
