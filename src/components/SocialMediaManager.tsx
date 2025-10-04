// src/components/SocialMediaManager.tsx

import {
  Share2,
  Calendar,
  Hash,
  Clock,
  Send,
  BarChart3,
  Plus,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  MessageSquare,
  Heart,
} from "lucide-react";
import React, { useState, useEffect } from "react";

import type {
  SocialMediaPost,
  CreateSocialMediaPostData,
  SocialPlatform,
} from "@/models/channels";
import {
  createSocialMediaPost,
  getAllSocialMediaPosts,
  publishSocialMediaPost,
  getHashtagSuggestions,
  getTrendingHashtags,
  validateContent,
  PLATFORM_CONFIGS,
} from "@/services/socialMediaService";

interface SocialMediaManagerProps {
  campaignId?: string;
  clientId: string;
}

type ViewMode = "create" | "calendar" | "analytics" | "posts";

export const SocialMediaManager: React.FC<SocialMediaManagerProps> = ({
  campaignId,
  clientId,
}) => {
  const [currentView, setCurrentView] = useState<ViewMode>("create");
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingHashtags, setTrendingHashtags] = useState<
    Array<{ hashtag: string; count: number; platforms: SocialPlatform[] }>
  >([]);

  // Post creation state
  const [postData, setPostData] = useState<Partial<CreateSocialMediaPostData>>({
    campaignId: campaignId || "",
    clientId,
    platforms: ["facebook"],
    message: "",
    hashtags: [],
    publishType: "immediate",
  });

  const [selectedPlatforms, setSelectedPlatforms] = useState<SocialPlatform[]>([
    "facebook",
  ]);
  const [hashtagInput, setHashtagInput] = useState("");
  const [suggestedHashtags, setSuggestedHashtags] = useState<string[]>([]);
  const [contentValidation, setContentValidation] = useState<{
    [platform: string]: any;
  }>({});

  useEffect(() => {
    void loadPosts();
    void loadTrendingHashtags();
  }, [clientId, campaignId]);

  useEffect(() => {
    // Validate content for each platform when message changes
    if (postData.message) {
      selectedPlatforms.forEach(async (platform) => {
        const validation = await validateContent(postData.message!, platform);
        setContentValidation((prev) => ({
          ...prev,
          [platform]: validation,
        }));
      });
    }
  }, [postData.message, selectedPlatforms]);

  const loadPosts = async () => {
    try {
      setIsLoading(true);
      const allPosts = await getAllSocialMediaPosts(clientId);
      const filteredPosts = campaignId
        ? allPosts.filter((p) => p.campaignId === campaignId)
        : allPosts;
      setPosts(filteredPosts);
    } catch (error) {
      console.error("Error loading posts:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingHashtags = async () => {
    try {
      const hashtags = await getTrendingHashtags(10);
      setTrendingHashtags(hashtags);
    } catch (error) {
      console.error("Error loading trending hashtags:", error);
    }
  };

  const handlePlatformToggle = (platform: SocialPlatform) => {
    const newPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((p) => p !== platform)
      : [...selectedPlatforms, platform];

    setSelectedPlatforms(newPlatforms);
    setPostData((prev) => ({ ...prev, platforms: newPlatforms }));
  };

  const handleHashtagAdd = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;
    const currentHashtags = postData.hashtags || [];

    if (!currentHashtags.includes(cleanHashtag)) {
      const newHashtags = [...currentHashtags, cleanHashtag];
      setPostData((prev) => ({ ...prev, hashtags: newHashtags }));
    }

    setHashtagInput("");
  };

  const handleHashtagRemove = (hashtag: string) => {
    const newHashtags = (postData.hashtags || []).filter((h) => h !== hashtag);
    setPostData((prev) => ({ ...prev, hashtags: newHashtags }));
  };

  const getSuggestedHashtags = async () => {
    if (!postData.message) return;

    try {
      // Get suggestions for the first platform (you could enhance this to get suggestions for all platforms)
      const suggestions = await getHashtagSuggestions(
        postData.message,
        selectedPlatforms[0],
      );
      setSuggestedHashtags(suggestions.slice(0, 8));
    } catch (error) {
      console.error("Error getting hashtag suggestions:", error);
    }
  };

  const handleCreatePost = async () => {
    if (!postData.name || !postData.message) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);
      const newPost = await createSocialMediaPost(
        postData as CreateSocialMediaPostData,
      );
      setPosts((prev) => [newPost, ...prev]);

      // Reset form
      setPostData({
        campaignId: campaignId || "",
        clientId,
        platforms: ["facebook"],
        message: "",
        hashtags: [],
        publishType: "immediate",
      });
      setSelectedPlatforms(["facebook"]);

      alert("Social media post created successfully!");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Error creating post");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishPost = async (postId: string) => {
    try {
      setIsLoading(true);
      await publishSocialMediaPost(postId);
      await loadPosts(); // Reload to get updated status
      alert("Post published successfully!");
    } catch (error) {
      console.error("Error publishing post:", error);
      alert("Error publishing post");
    } finally {
      setIsLoading(false);
    }
  };

  const renderPlatformSelector = () => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Platforms *
      </label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Object.entries(PLATFORM_CONFIGS).map(([key, config]) => {
          const platform = key as SocialPlatform;
          const isSelected = selectedPlatforms.includes(platform);

          return (
            <label
              key={platform}
              className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handlePlatformToggle(platform)}
                className="sr-only"
              />
              <div className="flex items-center space-x-2">
                <div
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ backgroundColor: config.color }}
                >
                  <span className="text-white text-xs">{config.icon}</span>
                </div>
                <span className="font-medium">{config.name}</span>
              </div>
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-blue-500 ml-auto" />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );

  const renderContentValidation = () => (
    <div className="space-y-2">
      {selectedPlatforms.map((platform) => {
        const validation = contentValidation[platform];
        if (!validation) return null;

        const platformConfig = PLATFORM_CONFIGS[platform];
        const messageLength = postData.message?.length || 0;

        return (
          <div key={platform} className="p-3 border rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: platformConfig.color }}
              />
              <span className="font-medium text-sm">{platformConfig.name}</span>
              <div className="flex items-center space-x-1">
                <span
                  className={`text-xs ${
                    messageLength > platformConfig.maxTextLength
                      ? "text-red-600"
                      : "text-gray-600"
                  }`}
                >
                  {messageLength}/{platformConfig.maxTextLength}
                </span>
              </div>
            </div>

            {validation.warnings.length > 0 && (
              <div className="space-y-1">
                {validation.warnings.map((warning: string, index: number) => (
                  <div key={index} className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                    <span className="text-xs text-yellow-700">{warning}</span>
                  </div>
                ))}
              </div>
            )}

            {validation.suggestions.length > 0 && (
              <div className="space-y-1 mt-2">
                {validation.suggestions.map(
                  (suggestion: string, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                      <span className="text-xs text-blue-700">
                        {suggestion}
                      </span>
                    </div>
                  ),
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCreateView = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-6">Create Social Media Post</h3>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Post Title *
            </label>
            <input
              type="text"
              value={postData.name || ""}
              onChange={(e) =>
                setPostData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="Enter post title"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {renderPlatformSelector()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={postData.message || ""}
              onChange={(e) =>
                setPostData((prev) => ({ ...prev, message: e.target.value }))
              }
              placeholder="What's on your mind?"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="mt-2">
              <button
                onClick={getSuggestedHashtags}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Get Hashtag Suggestions
              </button>
            </div>
          </div>

          {postData.message && renderContentValidation()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hashtags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {(postData.hashtags || []).map((hashtag) => (
                <span
                  key={hashtag}
                  className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                >
                  {hashtag}
                  <button
                    onClick={() => handleHashtagRemove(hashtag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (hashtagInput.trim()) {
                      handleHashtagAdd(hashtagInput.trim());
                    }
                  }
                }}
                placeholder="Add hashtag (without #)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (hashtagInput.trim()) {
                    handleHashtagAdd(hashtagInput.trim());
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>

            {/* Suggested Hashtags */}
            {suggestedHashtags.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-600 mb-2 block">
                  Suggested:
                </span>
                <div className="flex flex-wrap gap-2">
                  {suggestedHashtags.map((hashtag) => (
                    <button
                      key={hashtag}
                      onClick={() => handleHashtagAdd(hashtag)}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      {hashtag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Hashtags */}
            {trendingHashtags.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-gray-600 mb-2 block">
                  Trending:
                </span>
                <div className="flex flex-wrap gap-2">
                  {trendingHashtags.slice(0, 6).map(({ hashtag }) => (
                    <button
                      key={hashtag}
                      onClick={() => handleHashtagAdd(hashtag)}
                      className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                    >
                      {hashtag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publishing Options
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="publishType"
                  value="immediate"
                  checked={postData.publishType === "immediate"}
                  onChange={(e) =>
                    setPostData((prev) => ({
                      ...prev,
                      publishType: e.target.value as any,
                    }))
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <Send className="w-4 h-4 text-gray-600" />
                <span>Publish Immediately</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="publishType"
                  value="scheduled"
                  checked={postData.publishType === "scheduled"}
                  onChange={(e) =>
                    setPostData((prev) => ({
                      ...prev,
                      publishType: e.target.value as any,
                    }))
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <Clock className="w-4 h-4 text-gray-600" />
                <span>Schedule for Later</span>
              </label>
            </div>

            {postData.publishType === "scheduled" && (
              <div className="mt-3">
                <input
                  type="datetime-local"
                  value={
                    postData.scheduledAt
                      ? new Date(postData.scheduledAt)
                          .toISOString()
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setPostData((prev) => ({
                      ...prev,
                      scheduledAt: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              {selectedPlatforms.length} platform
              {selectedPlatforms.length !== 1 ? "s" : ""} selected
            </div>

            <button
              onClick={handleCreatePost}
              disabled={isLoading || !postData.name || !postData.message}
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="w-4 h-4" />
              <span>{isLoading ? "Creating..." : "Create Post"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPostsView = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Social Media Posts</h3>
          <button
            onClick={() => setCurrentView("create")}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            <span>New Post</span>
          </button>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-8">
            <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No social media posts yet</p>
            <button
              onClick={() => setCurrentView("create")}
              className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first post
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <div
                key={post.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{post.name}</h4>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        post.status === "published"
                          ? "bg-green-100 text-green-800"
                          : post.status === "scheduled"
                            ? "bg-blue-100 text-blue-800"
                            : post.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {post.status === "draft" && (
                      <button
                        onClick={() => handlePublishPost(post.id)}
                        disabled={isLoading}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                      >
                        <Send className="w-4 h-4" />
                        <span>Publish</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-3">{post.message}</p>

                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-2">
                    <span>Platforms:</span>
                    <div className="flex space-x-1">
                      {post.platforms.map((platform) => (
                        <div
                          key={platform}
                          className="w-4 h-4 rounded flex items-center justify-center text-xs"
                          style={{
                            backgroundColor: PLATFORM_CONFIGS[platform].color,
                          }}
                          title={PLATFORM_CONFIGS[platform].name}
                        >
                          <span className="text-white">
                            {PLATFORM_CONFIGS[platform].icon}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {post.hashtags.length > 0 && (
                    <div className="flex items-center space-x-1">
                      <Hash className="w-4 h-4" />
                      <span>{post.hashtags.length} hashtags</span>
                    </div>
                  )}
                </div>

                {post.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.hashtags.slice(0, 5).map((hashtag) => (
                      <span
                        key={hashtag}
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                      >
                        {hashtag}
                      </span>
                    ))}
                    {post.hashtags.length > 5 && (
                      <span className="text-xs text-gray-600">
                        +{post.hashtags.length - 5} more
                      </span>
                    )}
                  </div>
                )}

                {post.metrics && Object.keys(post.metrics).length > 0 && (
                  <div className="border-t pt-3">
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      {post.platforms.map((platform) => {
                        const metrics = post.metrics?.[platform];
                        if (!metrics) return null;

                        return (
                          <div key={platform} className="text-center">
                            <div className="font-medium text-gray-900">
                              {metrics.likes}
                            </div>
                            <div className="text-gray-600 flex items-center justify-center space-x-1">
                              <Heart className="w-3 h-3" />
                              <span>{PLATFORM_CONFIGS[platform].name}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
                  <span>
                    Created {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  {post.scheduledAt && (
                    <span>
                      Scheduled for{" "}
                      {new Date(post.scheduledAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderNavigationTabs = () => (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {[
          { key: "create" as const, label: "Create Post", icon: Plus },
          { key: "posts" as const, label: "All Posts", icon: MessageSquare },
          { key: "calendar" as const, label: "Calendar", icon: Calendar },
          { key: "analytics" as const, label: "Analytics", icon: BarChart3 },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
              currentView === key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Social Media Manager
        </h2>
        <p className="text-gray-600 mt-1">
          Create, schedule, and manage your social media content across multiple
          platforms
        </p>
      </div>

      {renderNavigationTabs()}

      {currentView === "create" && renderCreateView()}
      {currentView === "posts" && renderPostsView()}
      {currentView === "calendar" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Content Calendar</h3>
          <p className="text-gray-600">Content calendar view coming soon...</p>
        </div>
      )}
      {currentView === "analytics" && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Social Media Analytics</h3>
          <p className="text-gray-600">Analytics dashboard coming soon...</p>
        </div>
      )}
    </div>
  );
};
