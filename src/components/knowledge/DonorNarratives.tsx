/**
 * Donor Narratives Component
 *
 * Repository of donor stories, testimonials, and impact narratives
 * Track15-specific: emotional center, donor role, story types
 */

import React, { useState } from "react";
import { Heart, Plus, Search, Edit2, Trash2 } from "lucide-react";
import type { DonorNarrative, DonorStoryType } from "@/services/knowledgeBaseService";
import { useKnowledgeBase } from "@/hooks/useKnowledgeBase";

interface DonorNarrativesProps {
  clientId: string;
  narratives: DonorNarrative[];
  onSaveSuccess: (message: string) => void;
}

export default function DonorNarratives({
  clientId,
  narratives,
  onSaveSuccess,
}: DonorNarrativesProps) {
  const { addNarrative, editNarrative, removeNarrative } = useKnowledgeBase(clientId);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<DonorStoryType | "all">("all");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    narrative: "",
    donor_role: "",
    emotional_center: "",
    story_type: "impact_story" as DonorStoryType,
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState("");

  const filteredNarratives = narratives.filter((narrative) => {
    const matchesSearch =
      narrative.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      narrative.narrative.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || narrative.story_type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSave = async () => {
    try {
      if (editingId) {
        await editNarrative(editingId, formData);
        onSaveSuccess("Narrative updated successfully");
      } else {
        await addNarrative(formData);
        onSaveSuccess("Narrative created successfully");
      }
      resetForm();
    } catch (error) {
      console.error("Failed to save narrative:", error);
    }
  };

  const handleEdit = (narrative: DonorNarrative) => {
    setEditingId(narrative.id);
    setFormData({
      title: narrative.title,
      narrative: narrative.narrative,
      donor_role: narrative.donor_role || "",
      emotional_center: narrative.emotional_center || "",
      story_type: narrative.story_type || "impact_story",
      tags: narrative.tags || [],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this narrative?")) {
      try {
        await removeNarrative(id);
        onSaveSuccess("Narrative deleted successfully");
      } catch (error) {
        console.error("Failed to delete narrative:", error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      narrative: "",
      donor_role: "",
      emotional_center: "",
      story_type: "impact_story",
      tags: [],
    });
    setEditingId(null);
    setShowModal(false);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Donor Narratives
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Impact stories, testimonials, and donor experiences
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Narrative
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search narratives..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as DonorStoryType | "all")}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="donor_story">Donor Stories</option>
          <option value="impact_story">Impact Stories</option>
          <option value="testimonial">Testimonials</option>
          <option value="case_study">Case Studies</option>
        </select>
      </div>

      {/* Narratives List */}
      {filteredNarratives.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Narratives Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first donor narrative to build your story library
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add Narrative
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredNarratives.map((narrative) => (
            <div
              key={narrative.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {narrative.title}
                    </h3>
                    {narrative.story_type && (
                      <span className="text-xs px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
                        {narrative.story_type.replace("_", " ")}
                      </span>
                    )}
                  </div>

                  {/* Track15 Metadata */}
                  <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    {narrative.emotional_center && (
                      <span>💙 {narrative.emotional_center}</span>
                    )}
                    {narrative.donor_role && (
                      <span>👤 {narrative.donor_role}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {narrative.narrative}
                  </p>

                  {/* Tags */}
                  {narrative.tags && narrative.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {narrative.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(narrative)}
                    className="text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(narrative.id)}
                    className="text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-3xl w-full p-6 my-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingId ? "Edit Narrative" : "Add New Narrative"}
            </h3>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Sarah's Story: From Crisis to Hope"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              {/* Story Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Story Type
                </label>
                <select
                  value={formData.story_type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      story_type: e.target.value as DonorStoryType,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="donor_story">Donor Story</option>
                  <option value="impact_story">Impact Story</option>
                  <option value="testimonial">Testimonial</option>
                  <option value="case_study">Case Study</option>
                </select>
              </div>

              {/* Track15 Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Emotional Center{" "}
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">
                      Track15
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.emotional_center}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emotional_center: e.target.value,
                      })
                    }
                    placeholder="e.g., hope, urgency, gratitude"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Donor Role{" "}
                    <span className="text-xs text-indigo-600 dark:text-indigo-400">
                      Track15
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.donor_role}
                    onChange={(e) =>
                      setFormData({ ...formData, donor_role: e.target.value })
                    }
                    placeholder="e.g., problem solver, champion"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Narrative */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Narrative *
                </label>
                <textarea
                  value={formData.narrative}
                  onChange={(e) =>
                    setFormData({ ...formData, narrative: e.target.value })
                  }
                  placeholder="Tell the full story..."
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-indigo-900 dark:hover:text-indigo-100"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add tag..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.title || !formData.narrative}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {editingId ? "Update" : "Create"} Narrative
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Track15 Tip */}
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
        <p className="text-sm text-indigo-800 dark:text-indigo-200">
          <strong>Track15 Tip:</strong> Strong donor narratives provide authentic
          stories for campaigns. Tag stories by emotional center and donor role to
          easily find the right narrative for each campaign moment.
        </p>
      </div>
    </div>
  );
}
