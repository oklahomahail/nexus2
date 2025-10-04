// src/components/channels/ChannelTemplatesLibrary.tsx

import {
  Search,
  Eye,
  Star,
  Users,
  Clock,
  Tag,
  Plus,
  Heart,
} from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback } from "react";

import type { ChannelTemplate, ChannelType } from "@/models/channels";
import {
  getAllTemplates,
  searchTemplates,
  getPopularTemplates,
  getTopRatedTemplates,
  customizeTemplate,
  getTemplateStatistics,
  TEMPLATE_CATEGORIES,
  type TemplateCategoryKey,
} from "@/services/channelTemplatesService";

interface ChannelTemplatesLibraryProps {
  onSelectTemplate?: (template: ChannelTemplate) => void;
  onCustomizeTemplate?: (customizedTemplate: ChannelTemplate) => void;
  channelType?: ChannelType;
  mode?: "select" | "browse" | "manage";
  clientId?: string;
}

type ViewMode = "grid" | "list";
type FilterOptions = {
  type: ChannelType | "all";
  category: string;
  difficulty: "all" | "beginner" | "intermediate" | "advanced";
  rating: number;
  sortBy: "popular" | "rating" | "recent" | "name";
};

export const ChannelTemplatesLibrary: React.FC<
  ChannelTemplatesLibraryProps
> = ({
  onSelectTemplate,
  onCustomizeTemplate,
  channelType,
  mode = "browse",
  clientId,
}) => {
  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedTemplate, setSelectedTemplate] =
    useState<ChannelTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [templates, setTemplates] = useState<ChannelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "all" | "popular" | "recent" | "rated"
  >("all");

  const [filters, setFilters] = useState<FilterOptions>({
    type: channelType || "all",
    category: "all",
    difficulty: "all",
    rating: 0,
    sortBy: "popular",
  });

  const loadTemplates = useCallback(async () => {
    setLoading(true);
    try {
      let fetchedTemplates: ChannelTemplate[] = [];

      if (searchQuery) {
        fetchedTemplates = searchTemplates(searchQuery, {
          type: filters.type !== "all" ? filters.type : undefined,
          category: filters.category !== "all" ? filters.category : undefined,
          clientId,
        });
      } else {
        const filterOptions = {
          type: filters.type !== "all" ? filters.type : undefined,
          category: filters.category !== "all" ? filters.category : undefined,
          clientId,
        };

        switch (activeTab) {
          case "popular":
            fetchedTemplates = getPopularTemplates(50, filterOptions.type);
            break;
          case "rated":
            fetchedTemplates = getTopRatedTemplates(50, filterOptions.type);
            break;
          default:
            fetchedTemplates = getAllTemplates(filterOptions);
        }
      }

      // Apply additional filters
      if (filters.difficulty !== "all") {
        fetchedTemplates = fetchedTemplates.filter(
          (t) => t.config.difficulty === filters.difficulty,
        );
      }

      if (filters.rating > 0) {
        fetchedTemplates = fetchedTemplates.filter(
          (t) => (t.usage.rating || 0) >= filters.rating,
        );
      }

      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error("Error loading templates:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, searchQuery, activeTab, clientId]);

  // Load templates and statistics
  useEffect(() => {
    void loadTemplates();
  }, [loadTemplates]);

  const statistics = useMemo(() => getTemplateStatistics(), []);

  // Event handlers
  const handleTemplateSelect = (template: ChannelTemplate) => {
    if (mode === "select") {
      // Simply pass the template to the parent
      if (onSelectTemplate) {
        onSelectTemplate(template);
      }
    } else {
      setSelectedTemplate(template);
      setShowPreview(true);
    }
  };

  const handleCustomizeTemplate = (template: ChannelTemplate) => {
    setSelectedTemplate(template);
    setShowCustomization(true);
  };

  const handleUseTemplate = (template: ChannelTemplate) => {
    // Simply pass the template to the parent
    if (onSelectTemplate) {
      onSelectTemplate(template);
    }
    setShowPreview(false);
  };

  // Template customization
  const [customizations, setCustomizations] = useState({
    name: "",
    subject: "",
    message: "",
    hashtags: [] as string[],
    colors: {} as Record<string, string>,
    fonts: {} as Record<string, string>,
  });

  const handleSaveCustomization = () => {
    if (!selectedTemplate) return;

    const customizedTemplate = customizeTemplate(
      selectedTemplate.id,
      customizations,
    );
    if (customizedTemplate && onCustomizeTemplate) {
      onCustomizeTemplate(customizedTemplate);
    }
    setShowCustomization(false);
    resetCustomizations();
  };

  const resetCustomizations = () => {
    setCustomizations({
      name: "",
      subject: "",
      message: "",
      hashtags: [],
      colors: {},
      fonts: {},
    });
  };

  // Render template card
  const renderTemplateCard = (template: ChannelTemplate, _index: number) => {
    const category =
      TEMPLATE_CATEGORIES[template.category as TemplateCategoryKey];

    return (
      <div
        key={template.id}
        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleTemplateSelect(template)}
      >
        {/* Template Preview Image */}
        <div
          className="h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center relative overflow-hidden"
          style={{ backgroundColor: category?.color + "20" }}
        >
          <div className="text-4xl opacity-60">{category?.icon || "📄"}</div>

          {/* Template Type Badge */}
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 text-xs font-medium bg-white rounded-full shadow-sm">
              {template.type === "email"
                ? "📧"
                : template.type === "social_media"
                  ? "📱"
                  : "📬"}
              {template.type.replace("_", " ")}
            </span>
          </div>

          {/* Rating Badge */}
          {template.usage.rating && (
            <div className="absolute top-2 right-2 flex items-center space-x-1 bg-white rounded-full px-2 py-1 shadow-sm">
              <Star className="w-3 h-3 text-yellow-400 fill-current" />
              <span className="text-xs font-medium">
                {template.usage.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Template Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">
              {template.name}
            </h3>
            <div className="flex items-center space-x-1 ml-2">
              {template.config.difficulty && (
                <span
                  className={`px-1.5 py-0.5 text-xs rounded-full ${
                    template.config.difficulty === "beginner"
                      ? "bg-green-100 text-green-700"
                      : template.config.difficulty === "intermediate"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                  }`}
                >
                  {template.config.difficulty}
                </span>
              )}
            </div>
          </div>

          <p className="text-gray-600 text-xs mb-3 line-clamp-2">
            {template.description}
          </p>

          {/* Template Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Users className="w-3 h-3" />
                <span>{template.usage.timesUsed}</span>
              </div>
              {template.config.estimatedSetupTime && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{template.config.estimatedSetupTime}m</span>
                </div>
              )}
            </div>
            <span
              className={`px-2 py-1 rounded-full text-xs`}
              style={{
                backgroundColor: category?.color + "20",
                color: category?.color,
              }}
            >
              {category?.name || template.category}
            </span>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {template.config.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {template.config.tags.length > 3 && (
              <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                +{template.config.tags.length - 3}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleTemplateSelect(template);
              }}
              className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-3 h-3 inline mr-1" />
              Preview
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCustomizeTemplate(template);
              }}
              className="px-3 py-2 border border-gray-300 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              <Plus className="w-3 h-3 inline mr-1" />
              Customize
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Template Library
        </h1>
        <p className="text-gray-600">
          Choose from {statistics.totalTemplates} professional templates to
          power your campaigns
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Templates</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.totalTemplates}
              </p>
            </div>
            <Tag className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Most Popular</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {statistics.mostPopularTemplate?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                {statistics.mostPopularTemplate?.usage.timesUsed} uses
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Highest Rated</p>
              <p className="text-sm font-medium text-gray-900 truncate">
                {statistics.highestRatedTemplate?.name || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                ⭐{" "}
                {statistics.highestRatedTemplate?.usage.rating?.toFixed(1) ||
                  "N/A"}
              </p>
            </div>
            <Star className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-gray-900">
                {statistics.totalUsage.toLocaleString()}
              </p>
            </div>
            <Heart className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Channel Type */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={filters.type}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  type: e.target.value as ChannelType | "all",
                })
              }
            >
              <option value="all">All Channels</option>
              <option value="email">📧 Email</option>
              <option value="social_media">📱 Social Media</option>
              <option value="direct_mail">📬 Direct Mail</option>
            </select>

            {/* Category */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
            >
              <option value="all">All Categories</option>
              {Object.entries(TEMPLATE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>

            {/* Difficulty */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              value={filters.difficulty}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  difficulty: e.target.value as FilterOptions["difficulty"],
                })
              }
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        {[
          {
            key: "all",
            label: "All Templates",
            count: statistics.totalTemplates,
          },
          {
            key: "popular",
            label: "Popular",
            count: Math.min(50, statistics.totalTemplates),
          },
          {
            key: "rated",
            label: "Top Rated",
            count: templates.filter((t) => t.usage.rating).length,
          },
          {
            key: "recent",
            label: "Recent",
            count: templates.filter((t) => {
              const monthAgo = new Date();
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return t.createdAt >= monthAgo;
            }).length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
          >
            {tab.label}
            <span className="ml-1 text-xs opacity-75">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading templates...</span>
        </div>
      ) : templates.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {templates.map((template, index) =>
            renderTemplateCard(template, index),
          )}
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedTemplate.name}
                </h2>
                <p className="text-gray-600">{selectedTemplate.description}</p>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div
              className="p-6 overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 120px)" }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Template Details */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Template Details
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {selectedTemplate.type.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">
                        {selectedTemplate.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium">
                        {selectedTemplate.config.difficulty}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Setup Time:</span>
                      <span className="font-medium">
                        {selectedTemplate.config.estimatedSetupTime}m
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Times Used:</span>
                      <span className="font-medium">
                        {selectedTemplate.usage.timesUsed}
                      </span>
                    </div>
                    {selectedTemplate.usage.rating && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">
                          ⭐ {selectedTemplate.usage.rating.toFixed(1)}(
                          {selectedTemplate.usage.reviews} reviews)
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedTemplate.config.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Template Preview */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Content Preview
                  </h3>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
                    {selectedTemplate.type === "email" && (
                      <div>
                        <div className="mb-3">
                          <strong className="text-sm text-gray-600">
                            Subject:
                          </strong>
                          <div className="text-sm mt-1">
                            {selectedTemplate.content.subject}
                          </div>
                        </div>
                        <div>
                          <strong className="text-sm text-gray-600">
                            Content:
                          </strong>
                          <div
                            className="text-sm mt-1 prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{
                              __html:
                                selectedTemplate.content.htmlContent?.substring(
                                  0,
                                  500,
                                ) + "..." || "No preview available",
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {selectedTemplate.type === "social_media" && (
                      <div>
                        <strong className="text-sm text-gray-600">
                          Message:
                        </strong>
                        <div className="text-sm mt-1 whitespace-pre-wrap">
                          {selectedTemplate.content.message}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => handleCustomizeTemplate(selectedTemplate)}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
              >
                Customize
              </button>
              <button
                onClick={() => handleUseTemplate(selectedTemplate)}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Template Customization Modal */}
      {showCustomization && selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Customize Template
                </h2>
                <p className="text-gray-600">{selectedTemplate.name}</p>
              </div>
              <button
                onClick={() => setShowCustomization(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div
              className="p-6 overflow-y-auto"
              style={{ maxHeight: "calc(90vh - 120px)" }}
            >
              <div className="space-y-4">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Template Name
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={selectedTemplate.name + " (Custom)"}
                    value={customizations.name}
                    onChange={(e) =>
                      setCustomizations({
                        ...customizations,
                        name: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Email Subject (if email template) */}
                {selectedTemplate.type === "email" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={selectedTemplate.content.subject}
                      value={customizations.subject}
                      onChange={(e) =>
                        setCustomizations({
                          ...customizations,
                          subject: e.target.value,
                        })
                      }
                    />
                  </div>
                )}

                {/* Message Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Content
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={6}
                    placeholder={
                      selectedTemplate.content.message ||
                      "Enter custom message..."
                    }
                    value={customizations.message}
                    onChange={(e) =>
                      setCustomizations({
                        ...customizations,
                        message: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Hashtags (if social media template) */}
                {selectedTemplate.type === "social_media" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hashtags (one per line)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="#nonprofit&#10;#fundraising&#10;#community"
                      value={customizations.hashtags.join("\n")}
                      onChange={(e) =>
                        setCustomizations({
                          ...customizations,
                          hashtags: e.target.value
                            .split("\n")
                            .filter((h) => h.trim()),
                        })
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setShowCustomization(false);
                  resetCustomizations();
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCustomization}
                className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
              >
                Save Custom Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
