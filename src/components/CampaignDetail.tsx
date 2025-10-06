import { BarChart3, FileText, Rocket, Pause, Play } from "lucide-react";
import { useEffect, useState } from "react";

import Card from "@/components/ui-kit/Card";
import { Input } from "@/components/ui-kit/Input";
import ClaudeToolbar from "@/features/claude/ClaudeToolbar";
import useAutoSave from "@/hooks/useAutoSave";
import { useToast } from "@/hooks/useToast";
import type { Campaign } from "@/models/campaign";
import { createManualBackup } from "@/services/backup";
import { updateCampaign } from "@/services/campaignService";

import CampaignAnalyticsDetail from "./CampaignAnalyticsDetail";

interface CampaignDetailProps {
  campaign: Campaign;
  onCampaignUpdated?: (campaign: Campaign) => void;
}

export default function CampaignDetail({ campaign, onCampaignUpdated }: CampaignDetailProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [name, setName] = useState(campaign.name ?? "");
  const [notes, setNotes] = useState<string>(campaign.notes ?? "");
  const [isLaunching, setIsLaunching] = useState(false);
  const { success, error } = useToast();

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

  const handleLaunchCampaign = async () => {
    if (isLaunching) return;
    
    try {
      setIsLaunching(true);
      console.log('Launching campaign', campaign.id);
      
      const updatedCampaign = await updateCampaign(campaign.id, {
        status: 'Active'
      });
      
      if (updatedCampaign) {
        success('Campaign Launched!', `"${campaign.name}" is now live and accepting donations.`);
        onCampaignUpdated?.(updatedCampaign);
      }
    } catch (err: any) {
      console.error('Launch failed', err);
      error('Launch Failed', err?.message || 'Failed to launch campaign');
    } finally {
      setIsLaunching(false);
    }
  };

  const handlePauseCampaign = async () => {
    if (isLaunching) return;
    
    try {
      setIsLaunching(true);
      console.log('Pausing campaign', campaign.id);
      
      const updatedCampaign = await updateCampaign(campaign.id, {
        status: 'Paused'
      });
      
      if (updatedCampaign) {
        success('Campaign Paused', `"${campaign.name}" has been paused.`);
        onCampaignUpdated?.(updatedCampaign);
      }
    } catch (err: any) {
      console.error('Pause failed', err);
      error('Pause Failed', err?.message || 'Failed to pause campaign');
    } finally {
      setIsLaunching(false);
    }
  };

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
          {/* Campaign Status & Actions */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm font-medium mb-1">Campaign Status</div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    campaign.status === 'Active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                    campaign.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {campaign.status}
                  </span>
                  <span className="text-xs text-gray-500">
                    {campaign.status === 'Draft' ? 'Ready to launch' : 
                     campaign.status === 'Active' ? 'Live and accepting donations' :
                     campaign.status === 'Paused' ? 'Temporarily stopped' :
                     'Campaign ended'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                {campaign.status === 'Draft' && (
                  <button
                    type="button"
                    data-id="launch-campaign"
                    onClick={handleLaunchCampaign}
                    disabled={isLaunching}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLaunching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Launching...
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 mr-2" />
                        Launch Campaign
                      </>
                    )}
                  </button>
                )}
                
                {campaign.status === 'Active' && (
                  <button
                    type="button"
                    onClick={handlePauseCampaign}
                    disabled={isLaunching}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLaunching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Pausing...
                      </>
                    ) : (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause Campaign
                      </>
                    )}
                  </button>
                )}
                
                {campaign.status === 'Paused' && (
                  <button
                    type="button"
                    onClick={handleLaunchCampaign}
                    disabled={isLaunching}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLaunching ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Resuming...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Resume Campaign
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </Card>
          
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
