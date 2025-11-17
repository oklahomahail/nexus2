import { Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeading } from "@/components/ui/PageHeading";
import { SectionBlock } from "@/components/ui/SectionBlock";
import Button from "@/components/ui/Button";
import { useClient } from "@/context/ClientContext";
import { getClientSlug } from "@/types/client";

export default function ClientCampaigns() {
  const { currentClient } = useClient();
  const navigate = useNavigate();

  // Get the client slug for URL construction
  const clientSlug = currentClient ? getClientSlug(currentClient) : "";

  const campaigns = [
    {
      id: "eoy-holiday-2025",
      name: "End-of-Year Holiday 2025",
      status: "Active",
      raised: "$45,230",
      goal: "$75,000",
      track15_enabled: true, // Example Track15 campaign
    },
  ];

  // Show empty state when no campaigns (for demo purposes, you can set campaigns = [])
  if (campaigns.length === 0) {
    return (
      <div className="px-8 py-10 editorial-flow" data-tutorial-step="campaigns.page">
        <PageHeading
          title="Campaigns"
          subtitle="Manage your fundraising campaigns and track performance"
          actions={
            <Button
              variant="primary"
              onClick={() => navigate(`/clients/${clientSlug}/campaigns/new`)}
              data-tutorial-step="campaigns.new"
            >
              New Campaign
            </Button>
          }
        />

        <SectionBlock>
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <h2 className="text-[18px] font-semibold text-[var(--nx-charcoal)] mb-2">
                No campaigns yet
              </h2>
              <p className="text-[var(--nx-text-muted)] mb-6">
                Create your first campaign to start tracking performance and
                engaging donors.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate(`/clients/${clientSlug}/campaigns/new`)}
                data-tutorial-step="campaigns.new"
              >
                Create Your First Campaign
              </Button>
            </div>
          </div>
        </SectionBlock>
      </div>
    );
  }

  return (
    <div className="px-8 py-10 editorial-flow" data-tutorial-step="campaigns.page">
      <PageHeading
        title="Campaigns"
        subtitle="Manage your fundraising campaigns and track performance"
        actions={
          <Button
            variant="primary"
            onClick={() => navigate(`/clients/${clientSlug}/campaigns/new`)}
            data-tutorial-step="campaigns.new"
          >
            New Campaign
          </Button>
        }
      />

      <SectionBlock title="Active Campaigns" noPadding data-tutorial-step="campaigns.list">
        <table className="w-full">
          <thead className="border-b border-[var(--nx-border)]">
            <tr>
              <th className="text-left p-4 text-[13px] font-semibold text-[var(--nx-charcoal)]">Name</th>
              <th className="text-left p-4 text-[13px] font-semibold text-[var(--nx-charcoal)]">Status</th>
              <th className="text-left p-4 text-[13px] font-semibold text-[var(--nx-charcoal)]">Progress</th>
              <th className="text-left p-4 text-[13px] font-semibold text-[var(--nx-charcoal)]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="border-b border-[var(--nx-border)] last:border-0 hover:bg-[var(--nx-bg-secondary)] transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[15px] font-medium text-[var(--nx-charcoal)]">
                      {campaign.name}
                    </span>
                    {campaign.track15_enabled && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-100 text-purple-700"
                        title="Track15 Campaign"
                      >
                        <Sparkles className="w-3 h-3" />
                        Track15
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {campaign.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="text-[13px]">
                    <div className="text-[var(--nx-charcoal)] font-medium mb-1">
                      {campaign.raised} / {campaign.goal}
                    </div>
                    <div className="w-24 bg-[var(--nx-bg-tertiary)] rounded-full h-2">
                      <div
                        className="bg-[var(--nx-blue-deep)] h-2 rounded-full transition-all"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <button
                      className="text-[13px] font-medium text-[var(--nx-blue-deep)] hover:text-[var(--nx-charcoal)] transition-colors"
                      onClick={() =>
                        navigate(
                          `/clients/${clientSlug}/campaigns/${campaign.id}`,
                        )
                      }
                      data-tutorial-step="campaigns.row"
                    >
                      Edit
                    </button>
                    {campaign.track15_enabled && (
                      <button
                        className="text-[13px] font-medium text-purple-600 hover:text-purple-800 transition-colors"
                        onClick={() =>
                          navigate(
                            `/clients/${clientSlug}/track15?campaign=${campaign.id}`,
                          )
                        }
                        title="View Track15 Analytics"
                      >
                        Analytics
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </SectionBlock>
    </div>
  );
}
