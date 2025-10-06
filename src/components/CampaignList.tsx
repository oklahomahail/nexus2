import clsx from "clsx";
import React, { useEffect, useState } from "react";

import CampaignQuickCard from "./CampaignQuickCard";
import LoadingSpinner from "./LoadingSpinner";
import { Campaign } from "../models/campaign";
import * as campaignService from "../services/campaignService";

type Filters = Record<string, unknown>;

interface CampaignListProps {
  onViewCampaign: (campaign: Campaign) => void;
  onCreateCampaign?: () => void;
  /** Optional filters applied client-side after fetch */
  filters?: Filters;
  /** Initial view; user can toggle locally */
  viewMode?: "grid" | "list";
  className?: string;
  /** Optional: fetch only campaigns for this client */
  clientId?: string;
}

const CampaignList: React.FC<CampaignListProps> = ({
  onViewCampaign,
  onCreateCampaign,
  filters = {},
  viewMode = "grid",
  className = "",
  clientId,
}) => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mode, setMode] = useState<"grid" | "list">(viewMode);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Service expects a string (e.g., clientId) or no arg – not a filters object
        const raw =
          typeof clientId === "string" && clientId.length > 0
            ? await campaignService.getAllCampaigns(clientId)
            : await campaignService.getAllCampaigns();

        const list = Array.isArray(raw) ? raw : [];

        // Lightweight client-side filter pass (best-effort)
        const filtered =
          filters && Object.keys(filters).length
            ? list.filter((c) =>
                Object.entries(filters).every(([k, v]) => {
                  if (v == null || v === "") return true;
                  const val = (c as any)[k];
                  if (val == null) return false;
                  // loose string match when possible, else strict equality
                  if (typeof v === "string") {
                    return String(val).toLowerCase().includes(v.toLowerCase());
                  }
                  return val === v;
                }),
              )
            : list;

        setCampaigns(filtered);
      } catch (err) {
        console.error("Failed to load campaigns:", err);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [clientId, filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading campaigns..." />
      </div>
    );
  }

  const headerWrap = clsx("space-y-6", className);

  const gridClass =
    mode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "space-y-4";

  const gridBtnClass = clsx(
    "px-3 py-1 rounded text-sm font-medium transition-colors",
    mode === "grid"
      ? "bg-white text-gray-900 shadow-sm"
      : "text-gray-500 hover:text-gray-700",
  );

  const listBtnClass = clsx(
    "px-3 py-1 rounded text-sm font-medium transition-colors",
    mode === "list"
      ? "bg-white text-gray-900 shadow-sm"
      : "text-gray-500 hover:text-gray-700",
  );

  return (
    <div className={headerWrap}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Campaigns ({campaigns.length})
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button onClick={() => setMode("grid")} className={gridBtnClass}>
              Grid
            </button>
            <button onClick={() => setMode("list")} className={listBtnClass}>
              List
            </button>
          </div>

          {onCreateCampaign && (
            <button
              data-tour="campaigns-new"
              onClick={onCreateCampaign}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Create Campaign
            </button>
          )}
        </div>
      </div>

      {/* Campaign Grid/List */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">No campaigns found</div>
          {onCreateCampaign && (
            <button
              data-tour="campaigns-new"
              onClick={onCreateCampaign}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className={gridClass}>
          {campaigns.map((campaign) => (
            <CampaignQuickCard
              key={campaign.id}
              campaign={campaign}
              onClick={() => onViewCampaign(campaign)}
              className={mode === "list" ? "max-w-none" : ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
