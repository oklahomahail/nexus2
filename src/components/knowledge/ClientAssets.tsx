/**
 * Client Assets Component
 *
 * Asset library for photos, templates, and files
 * Leverages brand_assets table
 */

import { FolderOpen, Upload, Image, FileText, Palette } from "lucide-react";
import React, { useState, useEffect } from "react";

import { useBrandProfile } from "@/hooks/useBrandProfile";
import type { BrandAssetType } from "@/services/brandService";

interface ClientAssetsProps {
  clientId: string;
  onSaveSuccess: (message: string) => void;
}

export default function ClientAssets({
  clientId,
  onSaveSuccess,
}: ClientAssetsProps) {
  const { profile, assets, loadAssets, uploadAsset, removeAsset, isLoading } =
    useBrandProfile(clientId);

  const [filter, setFilter] = useState<BrandAssetType | "all">("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newAsset, setNewAsset] = useState({
    asset_type: "photo" as BrandAssetType,
    url: "",
    description: "",
  });

  useEffect(() => {
    void loadAssets();
  }, [loadAssets]);

  const filteredAssets =
    filter === "all" ? assets : assets.filter((a) => a.asset_type === filter);

  const handleUpload = async () => {
    if (!newAsset.url || !profile) return;

    try {
      await uploadAsset({
        ...newAsset,
      });
      setNewAsset({ asset_type: "photo", url: "", description: "" });
      setShowUploadModal(false);
      onSaveSuccess("Asset added successfully");
    } catch (error) {
      console.error("Failed to upload asset:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      try {
        await removeAsset(id);
        onSaveSuccess("Asset deleted successfully");
      } catch (error) {
        console.error("Failed to delete asset:", error);
      }
    }
  };

  const getAssetIcon = (type: BrandAssetType) => {
    switch (type) {
      case "photo":
        return Image;
      case "template":
        return FileText;
      case "logo":
        return Palette;
      default:
        return FolderOpen;
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-600 dark:text-gray-400">Loading assets...</div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
        <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Create Brand Profile First
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Assets are linked to brand profiles. Please create a brand profile
          first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Asset Library
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Photos, templates, and files for campaigns
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {["all", "photo", "logo", "template", "example_doc", "palette"].map(
          (type) => (
            <button
              key={type}
              onClick={() => setFilter(type as BrandAssetType | "all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === type
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {type === "all" ? "All" : type.replace("_", " ")}
            </button>
          ),
        )}
      </div>

      {/* Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
          <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Assets Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Upload photos, logos, templates, and other files
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Upload className="w-4 h-4" />
            Add Asset
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAssets.map((asset) => {
            const Icon = getAssetIcon(asset.asset_type);
            const isImage =
              asset.asset_type === "photo" || asset.asset_type === "logo";

            return (
              <div
                key={asset.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
              >
                {/* Preview */}
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                  {isImage ? (
                    <img
                      src={asset.url}
                      alt={asset.description || "Asset"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Icon className="w-12 h-12 text-gray-400" />
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                      {asset.asset_type}
                    </span>
                  </div>
                  {asset.description && (
                    <p className="text-sm text-gray-900 dark:text-white line-clamp-2 mb-2">
                      {asset.description}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <a
                      href={asset.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-xs text-center px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                    >
                      View
                    </a>
                    <button
                      onClick={() => handleDelete(asset.id)}
                      className="text-xs px-2 py-1 text-red-600 hover:text-red-700 dark:text-red-400 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-xl w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Asset
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset Type
                </label>
                <select
                  value={newAsset.asset_type}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      asset_type: e.target.value as BrandAssetType,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                >
                  <option value="photo">Photo</option>
                  <option value="logo">Logo</option>
                  <option value="template">Template</option>
                  <option value="example_doc">Example Document</option>
                  <option value="palette">Color Palette</option>
                  <option value="typography">Typography</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Asset URL
                </label>
                <input
                  type="url"
                  value={newAsset.url}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={newAsset.description}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, description: e.target.value })
                  }
                  placeholder="Describe this asset..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!newAsset.url}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                >
                  Add Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Helpful Note */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-800 dark:text-blue-200">
          <strong>Note:</strong> Assets are stored in your Brand Profile. For
          advanced asset management and file uploads, visit the{" "}
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
