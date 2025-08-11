import React, { useState, useEffect } from "react";

import CampaignQuickCard from "./CampaignQuickCard";
import LoadingSpinner from "./LoadingSpinner";
import { Campaign } from "../models/campaign";
import * as campaignService from "../services/campaignService";

interface CampaignListProps {
  onViewCampaign: (_campaign: Campaign) => void;
  onCreateCampaign?: () => void;
  filters?: any;
  viewMode?: "grid" | "list";
  className?: string;
}

const CampaignList: React.FC<CampaignListProps> = ({
  onViewCampaign,
  onCreateCampaign,
  filters = {},
  viewMode = "grid",
  className = "",
}) => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        const data = await campaignService.getAllCampaigns(filters);
        setCampaigns(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load campaigns:", error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    void loadCampaigns();
  }, [filters]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" text="Loading campaigns..." />
      </div>
    );
  }

  const headerWrap = ["space-y-6", className].filter(Boolean).join(" ");

  const gridClass =
    viewMode === "grid"
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      : "space-y-4";

  const gridBtnClass =
    viewMode === "grid"
      ? "px-3 py-1 rounded text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm"
      : "px-3 py-1 rounded text-sm font-medium transition-colors text-gray-500 hover:text-gray-700";

  const listBtnClass =
    viewMode === "list"
      ? "px-3 py-1 rounded text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm"
      : "px-3 py-1 rounded text-sm font-medium transition-colors text-gray-500 hover:text-gray-700";

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
            <button
              onClick={() => {
                /* setViewMode("grid") */
              }}
              className={gridBtnClass}
            >
              Grid
            </button>
            <button
              onClick={() => {
                /* setViewMode("list") */
              }}
              className={listBtnClass}
            >
              List
            </button>
          </div>

          {onCreateCampaign && (
            <button
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
              onClick={onCreateCampaign}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className={gridClass}>
          {campaigns.map((campaign: Campaign) => (
            <CampaignQuickCard
              key={campaign.id}
              campaign={campaign}
              onClick={() => onViewCampaign(campaign)}
              className={viewMode === "list" ? "max-w-none" : ""}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
