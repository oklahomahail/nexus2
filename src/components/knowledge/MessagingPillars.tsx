/**
 * Messaging Pillars Component
 *
 * Track15 messaging framework: pillars, positioning, and narrative elements
 */

import React, { useState, useEffect } from "react";
import { Save, Plus, X, Edit2 } from "lucide-react";
import type { MessagingProfile } from "@/services/knowledgeBaseService";
import knowledgeBaseService from "@/services/knowledgeBaseService";

interface MessagingPillarsProps {
  clientId: string;
  messagingProfile: MessagingProfile | null | undefined;
  onSaveSuccess: (message: string) => void;
}

interface Pillar {
  title: string;
  description: string;
  examples: string[];
}

export default function MessagingPillars({
  clientId,
  messagingProfile,
  onSaveSuccess,
}: MessagingPillarsProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    pillars: [] as Pillar[],
    impact_language: "",
    value_proposition: "",
    problem_statement: "",
    vision_statement: "",
    point_of_view: "",
  });

  // Pillar editor state
  const [editingPillar, setEditingPillar] = useState<number | null>(null);
  const [newPillar, setNewPillar] = useState<Pillar>({
    title: "",
    description: "",
    examples: [],
  });

  useEffect(() => {
    if (messagingProfile) {
      setFormData({
        pillars: messagingProfile.pillars || [],
        impact_language: messagingProfile.impact_language || "",
        value_proposition: messagingProfile.value_proposition || "",
        problem_statement: messagingProfile.problem_statement || "",
        vision_statement: messagingProfile.vision_statement || "",
        point_of_view: messagingProfile.point_of_view || "",
      });
    }
  }, [messagingProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await knowledgeBaseService.upsertMessagingProfile(clientId, formData);
      onSaveSuccess("Messaging framework saved successfully");
    } catch (error) {
      console.error("Failed to save messaging profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addPillar = () => {
    if (newPillar.title && newPillar.description) {
      setFormData({
        ...formData,
        pillars: [...formData.pillars, newPillar],
      });
      setNewPillar({ title: "", description: "", examples: [] });
    }
  };

  const removePillar = (index: number) => {
    setFormData({
      ...formData,
      pillars: formData.pillars.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Save */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Messaging Framework
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Track15 messaging pillars and narrative positioning
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

      {/* Track15 Narrative Framework */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 space-y-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Track15 Narrative Framework
        </h3>

        {/* Problem Statement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Problem Statement
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Clear articulation of the need your organization addresses
          </p>
          <textarea
            value={formData.problem_statement}
            onChange={(e) =>
              setFormData({ ...formData, problem_statement: e.target.value })
            }
            placeholder="e.g., Thousands of families in our community lack access to nutritious food..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Vision Statement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Vision Statement
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Aspirational future state when the problem is solved
          </p>
          <textarea
            value={formData.vision_statement}
            onChange={(e) =>
              setFormData({ ...formData, vision_statement: e.target.value })
            }
            placeholder="e.g., A community where every child has the nutrition they need to thrive..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Point of View */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Point of View
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Your organization's distinctive stance on solving this problem
          </p>
          <textarea
            value={formData.point_of_view}
            onChange={(e) =>
              setFormData({ ...formData, point_of_view: e.target.value })
            }
            placeholder="e.g., We believe food access is a human right, not charity. Our approach empowers communities..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Value Proposition & Impact */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Value Proposition
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Why donors should support your organization
          </p>
          <textarea
            value={formData.value_proposition}
            onChange={(e) =>
              setFormData({ ...formData, value_proposition: e.target.value })
            }
            placeholder="e.g., Your gift provides immediate relief and creates lasting change..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Impact Language
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            How you describe outcomes and results
          </p>
          <textarea
            value={formData.impact_language}
            onChange={(e) =>
              setFormData({ ...formData, impact_language: e.target.value })
            }
            placeholder="e.g., 'families served', 'meals provided', 'lives transformed'..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Messaging Pillars */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Messaging Pillars
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          3-5 core themes that appear across all communications
        </p>

        {/* Existing Pillars */}
        <div className="space-y-4 mb-6">
          {formData.pillars.map((pillar, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {pillar.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {pillar.description}
                  </p>
                  {pillar.examples && pillar.examples.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {pillar.examples.map((example, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removePillar(index)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 ml-4"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Pillar */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Add New Pillar
          </h4>
          <div className="space-y-3">
            <input
              type="text"
              value={newPillar.title}
              onChange={(e) =>
                setNewPillar({ ...newPillar, title: e.target.value })
              }
              placeholder="Pillar title (e.g., 'Community Empowerment')"
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <textarea
              value={newPillar.description}
              onChange={(e) =>
                setNewPillar({ ...newPillar, description: e.target.value })
              }
              placeholder="Description of this messaging pillar..."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
            />
            <button
              onClick={addPillar}
              disabled={!newPillar.title || !newPillar.description}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Pillar
            </button>
          </div>
        </div>
      </div>

      {/* Track15 Tip */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          <strong>Track15 Tip:</strong> These messaging pillars form the foundation
          of your narrative arc. Every campaign should weave in at least 2-3 pillars
          to maintain consistency and reinforce your core themes.
        </p>
      </div>
    </div>
  );
}
