// src/components/CampaignList.tsx - Complete campaign list component
import React, { useState, useEffect } from "react";

import CampaignQuickCard from "./CampaignQuickCard";
import LoadingSpinner from "./LoadingSpinner";
import { Campaign } from "../models/campaign";
import { campaignService } from "../services/campaignService";

interface CampaignListProps {
  onEditCampaign: (_campaign: Campaign) => void;
  onViewCampaign: (_campaign: Campaign) => void;
  onCreateCampaign: () => void;
}

const CampaignList: React.FC<CampaignListProps> = ({
  onEditCampaign: _onEditCampaign,
  _onViewCampaign,
  _onCreateCampaign,
}) => {
  const [_campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [_loading, setLoading] = useState(true);
  const [_filters, _setFilters] = useState<any>({});
  const [_viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    void loadCampaigns();
  }, [filters]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const data = await campaignService.getAllCampaigns(filters);
      setCampaigns(data);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create button and view toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-semibold">
            Campaigns ({campaigns.length})
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1 rounded ${
                viewMode === "grid"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600"
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 rounded ${
                viewMode === "list"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600"
              }`}
            >
              List
            </button>
          </div>
        </div>

        <button
          onClick={onCreateCampaign}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Campaign
        </button>
      </div>

      {/* Campaigns grid/list */}
      {campaigns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">No campaigns found</p>
          <button
            onClick={onCreateCampaign}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Campaign
          </button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              : "space-y-4"
          }
        >
          {campaigns.map((campaign) => (
            <CampaignQuickCard
              key={campaign.id}
              campaign={campaign}
              onClick={() => onViewCampaign(campaign)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
