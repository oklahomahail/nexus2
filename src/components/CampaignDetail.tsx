import { BarChart3, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import Card from "@/components/ui-kit/Card";
import { Input } from "@/components/ui-kit/Input";
import ClaudeToolbar from "@/features/claude/ClaudeToolbar";
import useAutoSave from "@/hooks/useAutoSave";
import type { Campaign } from "@/models/campaign";
import { createManualBackup } from "@/services/backup";

import CampaignAnalyticsDetail from "./CampaignAnalyticsDetail";

interface CampaignDetailProps {
  campaign: Campaign;
}

export default function CampaignDetail({ campaign }: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [name, setName] = useState(campaign.name ?? "");
  const [notes, setNotes] = useState<string>(campaign.notes ?? "");

  // Persist notes locally and queue backup
  useAutoSave({
    key: `campaign:${campaign.id}:notes`,
    data: notes,
    onSave: async (payload: string) => {
      try {
        await createManualBackup(
          { notes: payload },
          `Campaign Notes: ${name}`,
          `Notes for campaign ${campaign.id}`,
        );
      } catch {
        // silent: the backup card will surface health state
      }
    },
  });

  // keep local state in sync if parent campaign changes
  useEffect(() => {
    setName(campaign.name ?? "");
    setNotes(campaign.notes ?? "");
  }, [campaign.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const tabs = [
    { id: "details", label: "Details", icon: FileText },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-slate-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-400"
                    : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "details" && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-sm font-medium mb-2">Campaign details</div>
            <div className="grid grid-cols-1 gap-3">
              <label className="text-xs text-gray-600">Name</label>
              <Input
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setName(e.target.value)
                }
                placeholder="Campaign name"
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-sm font-medium mb-2">Notes</div>
            <ClaudeToolbar
              context={{
                campaignName: name,
                // add anything else you track: goals, audience, dates, etc.
              }}
              onInsert={(text: string) =>
                setNotes((n) => (n ? `${n}\n\n${text}` : text))
              }
            />
            <textarea
              className="mt-3 w-full h-48 rounded-md border border-gray-200 p-3 text-sm outline-none focus:ring"
              placeholder="Notes save automatically"
              value={notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setNotes(e.target.value)
              }
            />
          </Card>
        </div>
      )}

      {activeTab === "analytics" && (
        <CampaignAnalyticsDetail campaignId={campaign.id} />
      )}
    </div>
  );
}
