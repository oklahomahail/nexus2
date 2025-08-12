// src/panels/CampaignsPanel.tsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";
import { useClient } from "@/context/ClientContext";

import { KPIWidget } from "../components/AnalyticsWidgets";
import CampaignDetail from "../components/CampaignDetail";
import CampaignList from "../components/CampaignList";
import CampaignModal from "../components/CampaignModal";
import CampaignPerformanceTable from "../components/CampaignPerformanceTable";
import LoadingSpinner from "../components/LoadingSpinner";
import { Campaign } from "../models/campaign";
import * as campaignService from "../services/campaignService";
import { CampaignStats } from "../services/campaignService";

type ViewMode = "list" | "detail";

const CampaignsPanel: React.FC = () => {
  const { user, hasRole } = useAuth();
  const { currentClient } = useClient();
  const { id: clientId } = useParams(); // Get clientId from route params
  const location = useLocation();

  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [tableView, setTableView] = useState(false); // NEW: Toggle between grid and table view

  // Determine if we're in client-scoped mode
  const isClientScoped = location.pathname.includes("/client/");
  const effectiveClientId = isClientScoped
    ? clientId || currentClient?.id
    : undefined;

  useEffect(() => {
    if (!user) return;
    void loadStats();
    void loadCampaigns(); // NEW: Load campaigns for table view
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, effectiveClientId]);

  // NEW: Load campaigns function
  const loadCampaigns = async () => {
    try {
      const data = await campaignService.getAllCampaigns();
      const filteredData = effectiveClientId
        ? data.filter((campaign) => campaign.clientId === effectiveClientId)
        : data;
      setCampaigns(filteredData);
    } catch (err) {
      console.error("Failed to load campaigns for table:", err);
    }
  };

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  // Show client selection prompt if in client-scoped mode but no client selected
  if (isClientScoped && !effectiveClientId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-slate-400 text-2xl">📊</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Select a Client
          </h3>
          <p className="text-slate-400">
            Choose a client from the switcher above to view their campaigns.
          </p>
        </div>
      </div>
    );
  }

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      setError(null);
      const data = await campaignService.getCampaignStats(effectiveClientId);
      setStats(data);
    } catch (err: any) {
      console.error("Failed to load campaign stats:", err);
      setStats(null);
      setError(err.message || "Failed to load campaign stats");
    } finally {
      setLoadingStats(false);
    }
  };

  const handleCreateCampaign = () => {
    if (isClientScoped && !effectiveClientId) {
      setError("Please select a client first");
      return;
    }

    setSelectedCampaign(null);
    setModalMode("create");
    setShowModal(true);
  };

  const handleViewCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedCampaign(null);
  };

  const handleSaveCampaign = async (data: any) => {
    try {
      if (modalMode === "create") {
        // Ensure clientId is included for new campaigns
        const campaignData = {
          ...data,
          clientId: effectiveClientId || data.clientId,
        };

        if (!campaignData.clientId) {
          throw new Error("Client ID is required for campaign creation");
        }

        await campaignService.createCampaign(campaignData);
      } else {
        // For updates, we need the campaign ID
        if (selectedCampaign?.id) {
          await campaignService.updateCampaign(selectedCampaign.id, {
            ...data,
            id: selectedCampaign.id,
          });
        }
      }

      setShowModal(false);
      void loadStats();

      if (modalMode === "edit" && selectedCampaign && viewMode === "detail") {
        const updated = await campaignService.getCampaignById(
          selectedCampaign.id,
        );
        if (updated) setSelectedCampaign(updated);
      }
      setError(null);
    } catch (err: any) {
      console.error("Failed to save campaign:", err);
      setError(err.message || "Failed to save campaign");
    }
  };

  const getPageTitle = () => {
    if (isClientScoped && currentClient) {
      return `${currentClient.name} Campaigns`;
    }
    return "Campaign Overview";
  };

  const getPageDescription = () => {
    if (isClientScoped && currentClient) {
      return `Manage fundraising campaigns for ${currentClient.name}`;
    }
    return "Overview of all campaigns across your organization";
  };

  const errorMessage = error && (
    <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 mb-6">
      <p className="text-red-400">{error}</p>
    </div>
  );

  if (viewMode === "detail" && selectedCampaign) {
    return (
      <div className="space-y-6">
        {errorMessage}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Campaigns
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-sm text-slate-400">
            <span>/</span>
            {isClientScoped && currentClient && (
              <>
                <span>{currentClient.name}</span>
                <span>/</span>
              </>
            )}
            <span>Campaigns</span>
            <span>/</span>
            <span className="text-white">{selectedCampaign.name}</span>
          </div>
        </div>

        <CampaignDetail campaign={selectedCampaign} />

        {showModal && (
          <CampaignModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveCampaign}
            initialData={selectedCampaign || undefined}
            mode={modalMode}
            clientId={effectiveClientId}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage}

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-1">
              {getPageTitle()}
            </h2>
            <p className="text-slate-400 text-sm">{getPageDescription()}</p>
          </div>

          {/* NEW: View Toggle */}
          <div className="flex items-center space-x-2">
            <div className="bg-slate-700/50 rounded-lg p-1 flex">
              <button
                onClick={() => setTableView(false)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  !tableView
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setTableView(true)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  tableView
                    ? "bg-blue-600 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Show client context indicator */}
        {isClientScoped && currentClient && (
          <div className="mb-6 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span className="text-blue-400 text-sm font-medium">
              Client-scoped view
            </span>
          </div>
        )}
      </div>

      {/* KPI Widgets */}
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4"
            >
              <LoadingSpinner size="sm" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPIWidget
            title="Total Campaigns"
            value={stats.totalCampaigns}
            format="number"
            color="blue"
          />
          <KPIWidget
            title="Active Campaigns"
            value={stats.activeCampaigns}
            format="number"
            color="green"
          />
          <KPIWidget
            title="Total Raised"
            value={stats.totalRaised}
            format="currency"
            color="purple"
          />
          <KPIWidget
            title="Success Rate"
            value={stats.successRate}
            format="percentage"
            color="orange"
          />
        </div>
      ) : (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
          <p className="text-yellow-400">Unable to load campaign statistics.</p>
        </div>
      )}

      {/* Campaign List or Table */}
      {tableView ? (
        <CampaignPerformanceTable
          campaigns={campaigns}
          onViewCampaign={handleViewCampaign}
          showClientColumn={!effectiveClientId}
        />
      ) : (
        <CampaignList
          onCreateCampaign={hasRole("admin") ? handleCreateCampaign : undefined}
          onViewCampaign={handleViewCampaign}
          clientId={effectiveClientId} // Pass clientId to filter campaigns
        />
      )}

      {showModal && (
        <CampaignModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCampaign}
          initialData={selectedCampaign || undefined}
          mode={modalMode}
          clientId={effectiveClientId} // Pass clientId for new campaigns
        />
      )}
    </div>
  );
};

export default CampaignsPanel;
