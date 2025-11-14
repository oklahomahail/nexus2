/**
 * Voice & Tone Component
 *
 * Track15-specific voice and tone guidelines
 * Manages how the organization communicates with donors
 */

import React, { useState, useEffect } from "react";
import { Save, Plus, X } from "lucide-react";
import type { VoiceProfile } from "@/services/knowledgeBaseService";
import knowledgeBaseService from "@/services/knowledgeBaseService";

interface VoiceToneProps {
  clientId: string;
  voiceProfile: VoiceProfile | null | undefined;
  onSaveSuccess: (message: string) => void;
}

export default function VoiceTone({
  clientId,
  voiceProfile,
  onSaveSuccess,
}: VoiceToneProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    voice_description: "",
    tone_guidelines: "",
    donor_language_rules: "",
    examples: { positive: [] as string[], negative: [] as string[] },
  });

  // New example inputs
  const [newPositive, setNewPositive] = useState("");
  const [newNegative, setNewNegative] = useState("");

  // Update form when profile loads
  useEffect(() => {
    if (voiceProfile) {
      setFormData({
        voice_description: voiceProfile.voice_description || "",
        tone_guidelines: voiceProfile.tone_guidelines || "",
        donor_language_rules: voiceProfile.donor_language_rules || "",
        examples: voiceProfile.examples || { positive: [], negative: [] },
      });
    }
  }, [voiceProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await knowledgeBaseService.upsertVoiceProfile(clientId, formData);
      onSaveSuccess("Voice & tone profile saved successfully");
    } catch (error) {
      console.error("Failed to save voice profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addPositiveExample = () => {
    if (newPositive.trim()) {
      setFormData({
        ...formData,
        examples: {
          ...formData.examples,
          positive: [...formData.examples.positive, newPositive.trim()],
        },
      });
      setNewPositive("");
    }
  };

  const addNegativeExample = () => {
    if (newNegative.trim()) {
      setFormData({
        ...formData,
        examples: {
          ...formData.examples,
          negative: [...formData.examples.negative, newNegative.trim()],
        },
      });
      setNewNegative("");
    }
  };

  const removePositiveExample = (index: number) => {
    setFormData({
      ...formData,
      examples: {
        ...formData.examples,
        positive: formData.examples.positive.filter((_, i) => i !== index),
      },
    });
  };

  const removeNegativeExample = (index: number) => {
    setFormData({
      ...formData,
      examples: {
        ...formData.examples,
        negative: formData.examples.negative.filter((_, i) => i !== index),
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Save */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Voice & Tone Guidelines
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Define how your organization communicates with donors
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Voice Description */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Voice Description
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Overall personality and character of your organization's communication
        </p>
        <textarea
          value={formData.voice_description}
          onChange={(e) =>
            setFormData({ ...formData, voice_description: e.target.value })
          }
          placeholder="e.g., Warm, authentic, and empowering. We speak as a trusted partner in creating change."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Tone Guidelines */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Tone Guidelines
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          Contextual variations in tone (formal vs casual, urgent vs calm, etc.)
        </p>
        <textarea
          value={formData.tone_guidelines}
          onChange={(e) =>
            setFormData({ ...formData, tone_guidelines: e.target.value })
          }
          placeholder="e.g., Use urgency for time-sensitive asks, warmth for gratitude, inspiration for impact stories."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Donor Language Rules (Track15) */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Donor Language Rules
          <span className="ml-2 text-xs font-normal text-indigo-600 dark:text-indigo-400">
            Track15
          </span>
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          How to address and position donors (problem solvers, champions, partners, etc.)
        </p>
        <textarea
          value={formData.donor_language_rules}
          onChange={(e) =>
            setFormData({ ...formData, donor_language_rules: e.target.value })
          }
          placeholder="e.g., Position donors as 'compassionate problem solvers' who make change possible. Use 'you' and 'your impact' frequently. Avoid 'we' unless including the donor."
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Examples Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Positive Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            ✅ Do Say (Positive Examples)
          </h3>

          <div className="space-y-2 mb-4">
            {formData.examples.positive.map((example, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded"
              >
                <p className="flex-1 text-sm text-gray-900 dark:text-white">
                  {example}
                </p>
                <button
                  onClick={() => removePositiveExample(index)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPositive}
              onChange={(e) => setNewPositive(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addPositiveExample()}
              placeholder="Add positive example..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button
              onClick={addPositiveExample}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Negative Examples */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            ❌ Don't Say (Negative Examples)
          </h3>

          <div className="space-y-2 mb-4">
            {formData.examples.negative.map((example, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded"
              >
                <p className="flex-1 text-sm text-gray-900 dark:text-white">
                  {example}
                </p>
                <button
                  onClick={() => removeNegativeExample(index)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNegative}
              onChange={(e) => setNewNegative(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addNegativeExample()}
              placeholder="Add negative example..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button
              onClick={addNegativeExample}
              className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Track15 Tip */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          <strong>Track15 Tip:</strong> Strong voice & tone guidelines ensure
          consistent, authentic communication across all donor touchpoints. AI-generated
          campaigns will automatically apply these rules.
        </p>
      </div>
    </div>
  );
}
