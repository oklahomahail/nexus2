// src/components/CampaignList.tsx
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  Target,
  Building,
  Gift,
  Heart,
  Star,
} from "lucide-react";
import React, { useState, useEffect } from "react";

import LoadingSpinner from "./LoadingSpinner";
import { Campaign } from "../models/campaign";
import * as campaignService from "../services/campaignService";

interface CampaignListProps {
  onCreateCampaign?: () => void;
  onViewCampaign: (campaign: Campaign) => void;
  onEditCampaign?: (campaign: Campaign) => void;
  onDeleteCampaign?: (campaign: Campaign) => void;
  clientId?: string; // NEW: Add clientId prop for filtering
}

type CampaignType =
  | "annual"
  | "capital"
  | "emergency"
  | "program"
  | "event"
  | "endowment";

const CampaignList: React.FC<CampaignListProps> = ({
  onCreateCampaign,
  onViewCampaign,
  onEditCampaign,
  onDeleteCampaign,
  clientId, // NEW: Accept clientId prop
}) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Campaign["status"]>(
    "all",
  );

  useEffect(() => {
    void loadCampaigns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]); // Reload when clientId changes

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all campaigns and filter by clientId if provided
      const data = await campaignService.getAllCampaigns();

      // Filter by clientId if specified
      const filteredData = clientId
        ? data.filter((campaign) => campaign.clientId === clientId)
        : data;

      setCampaigns(filteredData);
    } catch (err: any) {
      console.error("Failed to load campaigns:", err);
      setError(err.message || "Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch =
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: Campaign["status"]) => {
    switch (status) {
      case "Active":
        return "bg-green-900/20 text-green-400 border-green-800/50";
      case "Draft":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-800/50";
      case "Completed":
        return "bg-blue-900/20 text-blue-400 border-blue-800/50";
      case "Paused":
        return "bg-gray-900/20 text-gray-400 border-gray-800/50";
      default:
        return "bg-slate-900/20 text-slate-400 border-slate-800/50";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<CampaignType, React.ComponentType<any>> = {
      annual: Calendar,
      capital: Building,
      emergency: Heart,
      program: Users,
      event: Star,
      endowment: Gift,
    };
    return icons[type as CampaignType] || Target;
  };

  const getDaysLeftColor = (daysLeft: number) => {
    if (daysLeft <= 7) return "text-red-400";
    if (daysLeft <= 30) return "text-yellow-400";
    return "text-green-400";
  };

  // Helper function to check if campaign is newly created (within last 7 days)
  const isNewCampaign = (campaign: Campaign) => {
    if (!campaign.createdAt) return false;
    const createdDate = new Date(campaign.createdAt);
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return createdDate.getTime() > sevenDaysAgo;
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-slate-400">Loading campaigns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-6">
        <h3 className="text-red-400 font-medium mb-2">
          Error Loading Campaigns
        </h3>
        <p className="text-red-300 text-sm">{error}</p>
        <button
          onClick={loadCampaigns}
          className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as typeof statusFilter)
              }
              className="pl-9 pr-8 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>

          {/* Create Campaign Button */}
          {onCreateCampaign && (
            <button
              onClick={onCreateCampaign}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 hover:scale-105 transform duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>New Campaign</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count */}
      {campaigns.length > 0 && (
        <div className="text-sm text-slate-400">
          {searchQuery || statusFilter !== "all" ? (
            <>
              Showing {filteredCampaigns.length} of {campaigns.length} campaigns
              {searchQuery && <span> matching "{searchQuery}"</span>}
            </>
          ) : (
            `${campaigns.length} total campaigns`
          )}
        </div>
      )}

      {/* Campaign Grid */}
      {filteredCampaigns.length === 0 ? (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-12 text-center">
          <Target className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            {campaigns.length === 0
              ? "No campaigns yet"
              : "No campaigns match your search"}
          </h3>
          <p className="text-slate-400 mb-6">
            {campaigns.length === 0
              ? clientId
                ? "Create your first campaign for this client"
                : "Create your first campaign to get started"
              : "Try adjusting your search terms or filters"}
          </p>
          {onCreateCampaign && campaigns.length === 0 && (
            <button
              onClick={onCreateCampaign}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:scale-105 transform duration-200"
            >
              Create First Campaign
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCampaigns.map((campaign) => {
            const TypeIcon = getTypeIcon(campaign.type || "annual");
            const isNew = isNewCampaign(campaign);

            return (
              <div
                key={campaign.id}
                className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:bg-slate-700/50 transition-all duration-200 group hover:scale-105 transform hover:shadow-lg"
              >
                {/* Campaign Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <TypeIcon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors truncate">
                        {campaign.name}
                      </h3>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}
                        >
                          {campaign.status}
                        </span>

                        {/* NEW BADGE for recently created campaigns */}
                        {isNew && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse">
                            ✨ New
                          </span>
                        )}

                        <span className="text-slate-400 text-xs">
                          {campaign.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {campaign.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {campaign.description}
                  </p>
                )}

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-slate-400">Progress</span>
                    <span className="text-sm font-medium text-white">
                      {campaign.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-400 text-xs">Raised</p>
                    <p className="text-white font-semibold">
                      {formatCurrency(campaign.raised)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs">Goal</p>
                    <p className="text-white font-semibold">
                      {formatCurrency(campaign.goal)}
                    </p>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex items-center justify-between text-xs mb-4">
                  <div className="flex items-center space-x-1 text-slate-400">
                    <Users className="w-3 h-3" />
                    <span>{campaign.donorCount} donors</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${getDaysLeftColor(campaign.daysLeft)}`}
                  >
                    <Calendar className="w-3 h-3" />
                    <span>{campaign.daysLeft} days left</span>
                  </div>
                </div>

                {/* Tags */}
                {campaign.tags && campaign.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {campaign.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-slate-700/50 text-slate-400 text-xs rounded hover:bg-slate-600/50 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                    {campaign.tags.length > 3 && (
                      <span className="text-xs text-slate-500">
                        +{campaign.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewCampaign(campaign)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-1 hover:scale-105 transform"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </button>

                  {onEditCampaign && (
                    <button
                      onClick={() => onEditCampaign(campaign)}
                      className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all duration-200 hover:scale-105 transform"
                      title="Edit Campaign"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  {onDeleteCampaign && (
                    <button
                      onClick={() => onDeleteCampaign(campaign)}
                      className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all duration-200 hover:scale-105 transform"
                      title="Delete Campaign"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Copy Campaign Link Button */}
                {isNew && (
                  <button
                    onClick={() => {
                      const campaignUrl = `https://nexus.app/campaign/${campaign.name.toLowerCase().replace(/\s+/g, "-")}`;
                      void navigator.clipboard.writeText(campaignUrl);
                      // You could add a toast notification here
                      alert("📋 Campaign link copied to clipboard!");
                    }}
                    className="w-full mt-2 text-blue-400 hover:text-blue-300 text-sm py-1 transition-colors"
                  >
                    📋 Copy Campaign Link
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CampaignList;
