/**
 * Brand Profile Panel
 *
 * Manage organizational brand identity for AI-generated campaigns
 * Tabs: Identity, Visuals, Tone & Language, Brand Corpus
 */

import {
  Palette,
  FileText,
  MessageSquare,
  Library,
  Save,
  AlertCircle,
} from "lucide-react";
import React, { useState } from "react";

import BrandCorpusManager from "@/components/brand/BrandCorpusManager";
import { useClient } from "@/context/ClientContext";
import { useBrandProfile } from "@/hooks/useBrandProfile";

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrandProfilePanel() {
  const { currentClient } = useClient();
  const clientId = currentClient?.id;

  const { profile, isLoading, error, updateProfile, createProfile } =
    useBrandProfile(clientId || "");

  const [activeTab, setActiveTab] = useState<
    "identity" | "visuals" | "tone" | "corpus"
  >("identity");
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    mission_statement: profile?.mission_statement || "",
    tone_of_voice: profile?.tone_of_voice || "",
    brand_personality: profile?.brand_personality || "",
    style_keywords: profile?.style_keywords || [],
    primary_colors: profile?.primary_colors || [],
    typography: profile?.typography || {},
    logo_url: profile?.logo_url || "",
    guidelines_url: profile?.guidelines_url || "",
  });

  // Update form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name,
        mission_statement: profile.mission_statement || "",
        tone_of_voice: profile.tone_of_voice || "",
        brand_personality: profile.brand_personality || "",
        style_keywords: profile.style_keywords || [],
        primary_colors: profile.primary_colors || [],
        typography: profile.typography || {},
        logo_url: profile.logo_url || "",
        guidelines_url: profile.guidelines_url || "",
      });
    }
  }, [profile]);

  // Handle save
  const handleSave = async () => {
    if (!clientId) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      if (profile) {
        await updateProfile(formData);
        setSaveMessage("Brand profile updated successfully");
      } else {
        await createProfile({ ...formData, client_id: clientId });
        setSaveMessage("Brand profile created successfully");
      }

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage("Failed to save brand profile");
    } finally {
      setIsSaving(false);
    }
  };

  // Tab configuration
  const tabs = [
    { id: "identity" as const, label: "Identity", icon: FileText },
    { id: "visuals" as const, label: "Visuals", icon: Palette },
    { id: "tone" as const, label: "Tone & Language", icon: MessageSquare },
    { id: "corpus" as const, label: "Brand Corpus", icon: Library },
  ];

  if (!clientId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            Please select a client to manage brand profile
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
              Brand Profile
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Define your organization's identity for AI-generated campaigns
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
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
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
        <nav className="flex gap-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`
                flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === id
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === "identity" && (
          <IdentityTab formData={formData} setFormData={setFormData} />
        )}
        {activeTab === "visuals" && (
          <VisualsTab formData={formData} setFormData={setFormData} />
        )}
        {activeTab === "tone" && (
          <ToneTab formData={formData} setFormData={setFormData} />
        )}
        {activeTab === "corpus" && (
          <CorpusTab clientId={clientId} brandId={profile?.id} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// IDENTITY TAB
// ============================================================================

interface TabProps {
  formData: any;
  setFormData: (data: any) => void;
}

function IdentityTab({ formData, setFormData }: TabProps) {
  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Brand Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Track15"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          The name of your organization or brand
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mission Statement
        </label>
        <textarea
          value={formData.mission_statement}
          onChange={(e) =>
            setFormData({ ...formData, mission_statement: e.target.value })
          }
          placeholder="e.g., Track15 advances community safety and opportunity through evidence-backed programs."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          A concise statement of your organization's purpose and impact
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Brand Guidelines URL (Optional)
        </label>
        <input
          type="url"
          value={formData.guidelines_url}
          onChange={(e) =>
            setFormData({ ...formData, guidelines_url: e.target.value })
          }
          placeholder="https://example.org/brand-guidelines.pdf"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Link to your full brand guidelines document (PDF or web page)
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// VISUALS TAB
// ============================================================================

function VisualsTab({ formData, setFormData }: TabProps) {
  const [newColor, setNewColor] = useState("");

  const addColor = () => {
    if (newColor && !formData.primary_colors.includes(newColor)) {
      setFormData({
        ...formData,
        primary_colors: [...formData.primary_colors, newColor],
      });
      setNewColor("");
    }
  };

  const removeColor = (color: string) => {
    setFormData({
      ...formData,
      primary_colors: formData.primary_colors.filter(
        (c: string) => c !== color,
      ),
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Logo URL
        </label>
        <input
          type="url"
          value={formData.logo_url}
          onChange={(e) =>
            setFormData({ ...formData, logo_url: e.target.value })
          }
          placeholder="https://example.org/logo.png"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Public URL to your organization's logo
        </p>

        {formData.logo_url && (
          <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Preview:
            </p>
            <img
              src={formData.logo_url}
              alt="Logo preview"
              className="max-h-32 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Primary Colors
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newColor}
            onChange={(e) => setNewColor(e.target.value)}
            placeholder="#0E4B7F"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={addColor}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-3">
          {formData.primary_colors.map((color: string) => (
            <div
              key={color}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div
                className="w-6 h-6 rounded border border-gray-300 dark:border-gray-600"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {color}
              </span>
              <button
                onClick={() => removeColor(color)}
                className="ml-2 text-gray-500 hover:text-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Your brand's primary color palette (hex codes)
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Typography (Optional)
        </label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Headings Font
            </label>
            <input
              type="text"
              value={formData.typography?.headings || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  typography: {
                    ...formData.typography,
                    headings: e.target.value,
                  },
                })
              }
              placeholder="Inter"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Body Font
            </label>
            <input
              type="text"
              value={formData.typography?.body || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  typography: { ...formData.typography, body: e.target.value },
                })
              }
              placeholder="Source Serif Pro"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TONE TAB
// ============================================================================

function ToneTab({ formData, setFormData }: TabProps) {
  const [newKeyword, setNewKeyword] = useState("");

  const addKeyword = () => {
    if (newKeyword && !formData.style_keywords.includes(newKeyword)) {
      setFormData({
        ...formData,
        style_keywords: [...formData.style_keywords, newKeyword],
      });
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      style_keywords: formData.style_keywords.filter(
        (k: string) => k !== keyword,
      ),
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tone of Voice
        </label>
        <input
          type="text"
          value={formData.tone_of_voice}
          onChange={(e) =>
            setFormData({ ...formData, tone_of_voice: e.target.value })
          }
          placeholder="e.g., warm, evidence-based, donor-respectful, clear"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Comma-separated adjectives describing how your brand communicates
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Brand Personality
        </label>
        <textarea
          value={formData.brand_personality}
          onChange={(e) =>
            setFormData({ ...formData, brand_personality: e.target.value })
          }
          placeholder="e.g., Pragmatic, Impact-focused, Community-first, Compassionate"
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Key personality traits that define your brand's character
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Style Keywords
        </label>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addKeyword()}
            placeholder="e.g., impact, community, transparency"
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            onClick={addKeyword}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {formData.style_keywords.map((keyword: string) => (
            <span
              key={keyword}
              className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
            >
              {keyword}
              <button
                onClick={() => removeKeyword(keyword)}
                className="text-indigo-500 hover:text-indigo-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>

        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Keywords that should appear in your campaigns (impact, community,
          etc.)
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// CORPUS TAB (Placeholder - will be separate component)
// ============================================================================

function CorpusTab({
  clientId,
  brandId,
}: {
  clientId: string;
  brandId?: string;
}) {
  if (!brandId) {
    return (
      <div className="max-w-3xl">
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            Please save your brand profile first before adding corpus content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <BrandCorpusManager clientId={clientId} brandId={brandId} />
    </div>
  );
}
