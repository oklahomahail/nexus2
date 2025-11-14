/**
 * Knowledge Base Panel
 *
 * Track15-aligned knowledge repository for each client
 * Tabs: Brand, Voice & Tone, Messaging Pillars, SOPs, Assets, Donor Narratives
 */

import {
  Sparkles,
  MessageCircle,
  Target,
  FileText,
  FolderOpen,
  Heart,
  AlertCircle,
  Zap,
} from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Tab components
import BrandGuidelines from "@/components/knowledge/BrandGuidelines";
import ClientAssets from "@/components/knowledge/ClientAssets";
import DonorNarratives from "@/components/knowledge/DonorNarratives";
import MessagingPillars from "@/components/knowledge/MessagingPillars";
import SOPs from "@/components/knowledge/SOPs";
import VoiceTone from "@/components/knowledge/VoiceTone";
import { useClient } from "@/context/ClientContext";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";

// ============================================================================
// TYPES
// ============================================================================

type TabId = "brand" | "voice" | "messaging" | "sops" | "assets" | "narratives";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function KnowledgeBasePanel() {
  const { currentClient } = useClient();
  const clientId = currentClient?.id;
  const navigate = useNavigate();

  const { knowledgeBase, isLoading, error } = useKnowledgeBase(clientId || "");

  const [activeTab, setActiveTab] = useState<TabId>("brand");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Tab configuration
  const tabs = [
    {
      id: "brand" as const,
      label: "Brand",
      icon: Sparkles,
      description: "Brand identity and guidelines",
    },
    {
      id: "voice" as const,
      label: "Voice & Tone",
      icon: MessageCircle,
      description: "Writing style and donor language",
    },
    {
      id: "messaging" as const,
      label: "Messaging",
      icon: Target,
      description: "Core pillars and positioning",
    },
    {
      id: "sops" as const,
      label: "SOPs",
      icon: FileText,
      description: "Standard operating procedures",
    },
    {
      id: "assets" as const,
      label: "Assets",
      icon: FolderOpen,
      description: "Photos, templates, and files",
    },
    {
      id: "narratives" as const,
      label: "Donor Stories",
      icon: Heart,
      description: "Impact narratives and testimonials",
    },
  ];

  // Show success message
  const handleSaveSuccess = (message: string) => {
    setSaveMessage(message);
    setTimeout(() => setSaveMessage(null), 3000);
  };

  if (!clientId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Please select a client to manage knowledge base
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Knowledge Base
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Centralized repository for{" "}
              {currentClient?.name || "your organization"}
            </p>
          </div>

          {/* Track15 CTA */}
          <button
            onClick={() =>
              navigate(`/clients/${clientId}/campaigns/new/track15`)
            }
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            title="Create a Track15 campaign using your knowledge base"
          >
            <Zap className="w-4 h-4" />
            <span className="font-medium">Create Track15 Campaign</span>
          </button>
        </div>

        {/* Save message */}
        {saveMessage && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              {saveMessage}
            </p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Tabs */}
        <div className="mt-4 flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap
                  ${
                    isActive
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
                title={tab.description}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading knowledge base...
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            {activeTab === "brand" && (
              <BrandGuidelines
                clientId={clientId}
                onSaveSuccess={handleSaveSuccess}
              />
            )}
            {activeTab === "voice" && (
              <VoiceTone
                clientId={clientId}
                voiceProfile={knowledgeBase?.voice}
                onSaveSuccess={handleSaveSuccess}
              />
            )}
            {activeTab === "messaging" && (
              <MessagingPillars
                clientId={clientId}
                messagingProfile={knowledgeBase?.messaging}
                onSaveSuccess={handleSaveSuccess}
              />
            )}
            {activeTab === "sops" && (
              <SOPs clientId={clientId} onSaveSuccess={handleSaveSuccess} />
            )}
            {activeTab === "assets" && (
              <ClientAssets
                clientId={clientId}
                onSaveSuccess={handleSaveSuccess}
              />
            )}
            {activeTab === "narratives" && (
              <DonorNarratives
                clientId={clientId}
                narratives={knowledgeBase?.narratives || []}
                onSaveSuccess={handleSaveSuccess}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
