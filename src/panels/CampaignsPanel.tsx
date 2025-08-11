import React, { useState, useEffect } from "react";

import { useAuth } from "@/context/AuthContext";

import { KPIWidget } from "../components/AnalyticsWidgets";
import CampaignDetail from "../components/CampaignDetail";
import CampaignList from "../components/CampaignList";
import CampaignModal from "../components/CampaignModal"; // Default import
import LoadingSpinner from "../components/LoadingSpinner";
import { Campaign } from "../models/campaign";
import * as campaignService from "../services/campaignService";
import { CampaignStats } from "../services/campaignService"; // Import CampaignStats

type ViewMode = "list" | "detail";

const CampaignsPanel: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    void loadStats();
  }, [user]);

  if (!user) {
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
    return null;
  }

  const loadStats = async () => {
    try {
      setLoadingStats(true);
      setError(null);
      const data = await campaignService.getCampaignStats();
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
        await campaignService.createCampaign(data);
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

  const errorMessage = error && (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <p className="text-red-800">{error}</p>
    </div>
  );

  if (viewMode === "detail" && selectedCampaign) {
    return (
      <div className="space-y-6">
        {errorMessage}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
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
        </div>

        <CampaignDetail campaign={selectedCampaign} />

        {showModal && (
          <CampaignModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSave={handleSaveCampaign}
            initialData={selectedCampaign || undefined}
            mode={modalMode}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {errorMessage}
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Campaign Overview
        </h2>
        {loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 p-4"
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
              color="red"
            />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              Unable to load campaign statistics.
            </p>
          </div>
        )}
      </div>

      <CampaignList
        onCreateCampaign={hasRole("admin") ? handleCreateCampaign : undefined}
        onViewCampaign={handleViewCampaign}
      />

      {showModal && (
        <CampaignModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveCampaign}
          initialData={selectedCampaign || undefined}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default CampaignsPanel;
