/**
 * SOPs Component
 *
 * Standard Operating Procedures and process documentation
 * Leverages brand_corpus table with type filtering
 */

import { FileText, Plus, Search } from "lucide-react";
import React, { useState, useEffect } from "react";

import { useBrandProfile } from "@/hooks/useBrandProfile";

interface SOPsProps {
  clientId: string;
  onSaveSuccess: (message: string) => void;
}

export default function SOPs({ clientId, onSaveSuccess }: SOPsProps) {
  const { corpus, loadCorpus, addCorpusEntry, removeCorpusEntry, isLoading } =
    useBrandProfile(clientId);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSOP, setNewSOP] = useState({
    title: "",
    content: "",
  });

  useEffect(() => {
    void loadCorpus();
  }, [loadCorpus]);

  // Filter to only show SOP-type corpus entries
  const sops = corpus.filter(
    (entry) =>
      entry.source_type === "manual" &&
      entry.title?.toLowerCase().includes("sop"),
  );

  const filteredSOPs = sops.filter(
    (sop) =>
      sop.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sop.content.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleAddSOP = async () => {
    if (!newSOP.title || !newSOP.content) return;

    try {
      await addCorpusEntry({
        source_type: "manual",
        title: `SOP: ${newSOP.title}`,
        content: newSOP.content,
      });
      setNewSOP({ title: "", content: "" });
      setShowAddModal(false);
      onSaveSuccess("SOP added successfully");
    } catch (error) {
      console.error("Failed to add SOP:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this SOP?")) {
      try {
        await removeCorpusEntry(id);
        onSaveSuccess("SOP deleted successfully");
      } catch (error) {
        console.error("Failed to delete SOP:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-600 dark:text-gray-400">Loading SOPs...</div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Standard Operating Procedures
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Process documentation and best practices
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add SOP
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search SOPs..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        />
      </div>

      {/* SOPs List */}
      {filteredSOPs.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No SOPs Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create your first SOP to document processes and best practices
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" />
            Add SOP
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredSOPs.map((sop) => (
            <div
              key={sop.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {sop.title?.replace("SOP: ", "")}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
                    {sop.content}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      Added {new Date(sop.created_at).toLocaleDateString()}
                    </span>
                    {sop.tokens && <span>{sop.tokens} tokens</span>}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(sop.id)}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 ml-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add SOP Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New SOP
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  SOP Title
                </label>
                <input
                  type="text"
                  value={newSOP.title}
                  onChange={(e) =>
                    setNewSOP({ ...newSOP, title: e.target.value })
                  }
                  placeholder="e.g., Campaign Approval Process"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                <textarea
                  value={newSOP.content}
                  onChange={(e) =>
                    setNewSOP({ ...newSOP, content: e.target.value })
                  }
                  placeholder="Describe the process, steps, and best practices..."
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSOP}
                  disabled={!newSOP.title || !newSOP.content}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Add SOP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> SOPs are stored in your Brand Corpus and can be
          referenced by AI when generating campaigns. For detailed corpus
          management, visit the{" "}
          <a
            href="/brand"
            className="underline hover:text-blue-900 dark:hover:text-blue-100"
          >
            Brand Profile section
          </a>
          .
        </p>
      </div>
    </div>
  );
}
