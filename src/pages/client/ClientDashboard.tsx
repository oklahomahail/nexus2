/**
 * Client Dashboard
 *
 * Track15 three-panel layout with premium editorial design:
 * - Campaign Engine (dominant panel)
 * - Analytics (quick metrics)
 * - Knowledge Base (quick access)
 */

import { useParams } from "react-router-dom";

import AnalyticsSection from "@/components/dashboard/AnalyticsSection";
import CampaignEngineSection from "@/components/dashboard/CampaignEngineSection";
import KnowledgeBaseSection from "@/components/dashboard/KnowledgeBaseSection";
import { PageHeading } from "@/components/ui/PageHeading";
import { useClient } from "@/context/ClientContext";

export default function ClientDashboard() {
  const { clientId: _clientId } = useParams();
  const { currentClient } = useClient();

  return (
    <div className="px-8 py-10 editorial-flow" data-tutorial-step="dashboard.page">
      {/* Page Header with Editorial Design */}
      <PageHeading
        title={`${currentClient?.name || "Client"} Dashboard`}
        subtitle="Track15-powered campaign and donor management"
      />

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
  );
}
