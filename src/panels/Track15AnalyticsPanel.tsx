/**
 * Track15 Analytics Panel
 *
 * Comprehensive Track15 performance analytics
 * Shows lift metrics, segment performance, and retention over time
 */

import React, { useState, useEffect } from "react";
import { Sparkles, TrendingUp, ChevronDown } from "lucide-react";
import { useClient } from "@/context/ClientContext";
import { useTrack15Retention } from "@/hooks/useTrack15Retention";
import { useTrack15Metrics } from "@/hooks/useTrack15Metrics";
import { useTrack15Segments } from "@/hooks/useTrack15Segments";
import Track15LiftMetrics from "@/components/analytics/Track15LiftMetrics";
import Track15SegmentPerformance from "@/components/analytics/Track15SegmentPerformance";
import Track15RetentionChart from "@/components/analytics/Track15RetentionChart";
import { supabase } from "@/lib/supabaseClient";

interface Campaign {
  id: string;
  name: string;
  track15_enabled: boolean;
  track15_season: string | null;
}

interface Track15AnalyticsPanelProps {
  campaignId?: string;
}

export default function Track15AnalyticsPanel({
  campaignId: initialCampaignId,
}: Track15AnalyticsPanelProps) {
  const { currentClient } = useClient();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    initialCampaignId || null
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);

  // Fetch Track15 campaigns for selector
  useEffect(() => {
    if (!currentClient?.id) return;

    const fetchCampaigns = async () => {
      setLoadingCampaigns(true);
      try {
        const { data, error } = await supabase
          .from("campaigns")
          .select("id, name, track15_enabled, track15_season")
          .eq("client_id", currentClient.id)
          .eq("track15_enabled", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setCampaigns(data || []);

        // Auto-select first campaign if none selected
        if (!selectedCampaignId && data && data.length > 0) {
          setSelectedCampaignId(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching Track15 campaigns:", error);
      } finally {
        setLoadingCampaigns(false);
      }
    };

    fetchCampaigns();
  }, [currentClient?.id]);

  // Fetch data using hooks
  const {
    metrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useTrack15Metrics(selectedCampaignId);

  const {
    segments,
    isLoading: segmentsLoading,
    error: segmentsError,
  } = useTrack15Segments(selectedCampaignId);

  const {
    data: retentionSeries,
    isLoading: retentionLoading,
    error: retentionError,
  } = useTrack15Retention(selectedCampaignId);

  if (!currentClient) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
        <p>No client selected</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Track15 Performance Analytics
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Advanced donor engagement and campaign lift metrics
            </p>
          </div>

          {/* Campaign Selector */}
          <div className="flex items-center gap-4">
            {campaigns.length > 0 && (
              <div className="relative">
                <select
                  value={selectedCampaignId || ""}
                  onChange={(e) => setSelectedCampaignId(e.target.value || null)}
                  className="appearance-none px-4 py-2 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={loadingCampaigns}
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                      {campaign.track15_season && ` (${campaign.track15_season})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}

            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Track15 Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* No Campaign Selected */}
          {!selectedCampaignId && campaigns.length === 0 && !loadingCampaigns && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
              <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Track15 Campaigns Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first Track15 campaign to see performance analytics here.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loadingCampaigns && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-gray-600 dark:text-gray-400">
                Loading campaigns...
              </div>
            </div>
          )}

          {/* Data Display */}
          {selectedCampaignId && !loadingCampaigns && (
            <>
              {/* Lift Metrics */}
              {metrics ? (
                <Track15LiftMetrics metrics={metrics} loading={metricsLoading} />
              ) : metricsLoading ? (
                <Track15LiftMetrics
                  metrics={{
                    engagementLift: 0,
                    responseRateLift: 0,
                    velocityLift: 0,
                    calculatedAt: new Date().toISOString(),
                  }}
                  loading={true}
                />
              ) : null}

              {/* Segment Performance + Retention (2-column grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Track15SegmentPerformance
                  segments={segments}
                  loading={segmentsLoading}
                />
                <Track15RetentionChart
                  series={retentionSeries}
                  isLoading={retentionLoading}
                  error={retentionError}
                />
              </div>
            </>
          )}

          {/* Track15 Methodology Info */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  About Track15 Methodology
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  Track15 is a proven fundraising framework that combines donor
                  segmentation, narrative arc design, and multi-channel engagement to
                  maximize campaign performance.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                      Narrative Stages
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Awareness → Engagement → Consideration → Conversion → Gratitude
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                      Donor Segmentation
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      7 strategic segments with tailored messaging
                    </div>
                  </div>
                  <div>
                    <div className="font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                      Performance Tracking
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">
                      Lift metrics vs. baseline across all campaigns
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
