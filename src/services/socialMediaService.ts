// src/services/socialMediaService.ts

import type {
  SocialMediaPost,
  CreateSocialMediaPostData,
  UpdateChannelData,
  SocialPlatform,
} from "@/models/channels";
import { logger } from "@/utils/logger";

// Mock data for development
const mockSocialMediaPosts: SocialMediaPost[] = [];

// Platform-specific configuration and limits
export const PLATFORM_CONFIGS = {
  facebook: {
    name: "Facebook",
    maxTextLength: 2000,
    maxHashtags: 30,
    supportsImages: true,
    supportsVideo: true,
    supportsScheduling: true,
    recommendedImageSize: "1200x630",
    color: "#1877F2",
    icon: "📘",
  },
  twitter: {
    name: "Twitter",
    maxTextLength: 280,
    maxHashtags: 2,
    supportsImages: true,
    supportsVideo: true,
    supportsScheduling: true,
    recommendedImageSize: "1024x512",
    color: "#1DA1F2",
    icon: "🐦",
  },
  instagram: {
    name: "Instagram",
    maxTextLength: 2200,
    maxHashtags: 30,
    supportsImages: true,
    supportsVideo: true,
    supportsScheduling: true,
    recommendedImageSize: "1080x1080",
    color: "#E4405F",
    icon: "📷",
  },
  linkedin: {
    name: "LinkedIn",
    maxTextLength: 3000,
    maxHashtags: 3,
    supportsImages: true,
    supportsVideo: true,
    supportsScheduling: true,
    recommendedImageSize: "1200x627",
    color: "#0A66C2",
    icon: "💼",
  },
  youtube: {
    name: "YouTube",
    maxTextLength: 5000,
    maxHashtags: 15,
    supportsImages: false,
    supportsVideo: true,
    supportsScheduling: true,
    recommendedImageSize: "1280x720",
    color: "#FF0000",
    icon: "📺",
  },
  tiktok: {
    name: "TikTok",
    maxTextLength: 150,
    maxHashtags: 100,
    supportsImages: false,
    supportsVideo: true,
    supportsScheduling: true,
    recommendedImageSize: "1080x1920",
    color: "#000000",
    icon: "🎵",
  },
} as const;

// Content Calendar Management
export class SocialMediaContentCalendar {
  private static posts: Map<string, SocialMediaPost[]> = new Map();

  static addPost(date: string, post: SocialMediaPost) {
    const datePosts = this.posts.get(date) || [];
    datePosts.push(post);
    this.posts.set(date, datePosts);
  }

  static getPostsForDate(date: string): SocialMediaPost[] {
    return this.posts.get(date) || [];
  }

  static getPostsForDateRange(
    startDate: string,
    endDate: string,
  ): Map<string, SocialMediaPost[]> {
    const result = new Map<string, SocialMediaPost[]>();
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (const [date, posts] of this.posts.entries()) {
      const postDate = new Date(date);
      if (postDate >= start && postDate <= end) {
        result.set(date, posts);
      }
    }

    return result;
  }

  static removePost(date: string, postId: string) {
    const datePosts = this.posts.get(date) || [];
    const updatedPosts = datePosts.filter((post) => post.id !== postId);

    if (updatedPosts.length === 0) {
      this.posts.delete(date);
    } else {
      this.posts.set(date, updatedPosts);
    }
  }

  static getAllPosts(): SocialMediaPost[] {
    return Array.from(this.posts.values()).flat();
  }

  static getUpcomingPosts(limit: number = 10): SocialMediaPost[] {
    const now = new Date();
    return this.getAllPosts()
      .filter((post) => post.scheduledAt && new Date(post.scheduledAt) > now)
      .sort(
        (a, b) =>
          new Date(a.scheduledAt!).getTime() -
          new Date(b.scheduledAt!).getTime(),
      )
      .slice(0, limit);
  }
}

// Hashtag and Mention Management
export class HashtagManager {
  private static trendingHashtags: Map<
    string,
    { count: number; platforms: SocialPlatform[] }
  > = new Map();

  static addHashtagUsage(hashtag: string, platform: SocialPlatform) {
    const current = this.trendingHashtags.get(hashtag) || {
      count: 0,
      platforms: [],
    };
    current.count++;

    if (!current.platforms.includes(platform)) {
      current.platforms.push(platform);
    }

    this.trendingHashtags.set(hashtag, current);
  }

  static getTrendingHashtags(
    limit: number = 20,
  ): Array<{ hashtag: string; count: number; platforms: SocialPlatform[] }> {
    return Array.from(this.trendingHashtags.entries())
      .map(([hashtag, data]) => ({ hashtag, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  static suggestHashtags(content: string, platform: SocialPlatform): string[] {
    // Simple hashtag suggestion based on content keywords
    const keywords = content.toLowerCase().match(/\b\w+\b/g) || [];
    const suggestions: string[] = [];

    // Platform-specific hashtag suggestions
    const commonNonprofitHashtags = [
      "#nonprofit",
      "#charity",
      "#giving",
      "#fundraising",
      "#volunteer",
      "#community",
      "#impact",
      "#change",
      "#help",
      "#support",
      "#donate",
      "#cause",
      "#mission",
      "#hope",
      "#together",
    ];

    // Add relevant hashtags based on keywords
    keywords.forEach((keyword) => {
      if (keyword.length > 3) {
        suggestions.push(`#${keyword}`);
      }
    });

    // Add common nonprofit hashtags
    suggestions.push(...commonNonprofitHashtags.slice(0, 5));

    // Respect platform limits
    const platformConfig = PLATFORM_CONFIGS[platform];
    return suggestions.slice(0, platformConfig.maxHashtags);
  }

  static validateHashtags(
    hashtags: string[],
    platform: SocialPlatform,
  ): { valid: string[]; invalid: string[]; warnings: string[] } {
    const platformConfig = PLATFORM_CONFIGS[platform];
    const valid: string[] = [];
    const invalid: string[] = [];
    const warnings: string[] = [];

    hashtags.forEach((hashtag) => {
      // Remove # if not present
      const cleanHashtag = hashtag.startsWith("#") ? hashtag : `#${hashtag}`;

      // Basic validation
      if (cleanHashtag.length < 2) {
        invalid.push(cleanHashtag);
        return;
      }

      if (cleanHashtag.length > 100) {
        invalid.push(cleanHashtag);
        return;
      }

      // Check for special characters (basic validation)
      if (!/^#[a-zA-Z0-9_]+$/.test(cleanHashtag)) {
        invalid.push(cleanHashtag);
        return;
      }

      valid.push(cleanHashtag);
    });

    // Check platform limits
    if (valid.length > platformConfig.maxHashtags) {
      warnings.push(
        `${platform} supports max ${platformConfig.maxHashtags} hashtags. Current: ${valid.length}`,
      );
    }

    return { valid, invalid, warnings };
  }
}

// Multi-Platform Posting Engine
export class MultiPlatformPostingEngine {
  static async publishPost(post: SocialMediaPost): Promise<{
    [platform in SocialPlatform]?: {
      success: boolean;
      postId?: string;
      error?: string;
    };
  }> {
    const results: {
      [platform in SocialPlatform]?: {
        success: boolean;
        postId?: string;
        error?: string;
      };
    } = {};

    for (const platform of post.platforms) {
      try {
        const result = await this.publishToPlatform(post, platform);
        results[platform] = result;
      } catch (error) {
        results[platform] = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return results;
  }

  private static async publishToPlatform(
    post: SocialMediaPost,
    platform: SocialPlatform,
  ): Promise<{ success: boolean; postId?: string; error?: string }> {
    // In a real implementation, this would integrate with each platform's API
    // For now, we'll simulate the posting process

    const platformConfig = PLATFORM_CONFIGS[platform];
    const platformContent = post.platformContent?.[platform];
    const content = platformContent?.message || post.message;

    // Validate content length
    if (content.length > platformConfig.maxTextLength) {
      throw new Error(
        `Content exceeds ${platform} limit of ${platformConfig.maxTextLength} characters`,
      );
    }

    // Simulate API delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000),
    );

    // Simulate success/failure (90% success rate)
    if (Math.random() < 0.9) {
      const mockPostId = `${platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      logger.info(`Posted to ${platform}:`, {
        postId: mockPostId,
        content: content.substring(0, 50) + "...",
      });

      return {
        success: true,
        postId: mockPostId,
      };
    } else {
      throw new Error(`Failed to post to ${platform}: API error`);
    }
  }

  static async schedulePost(post: SocialMediaPost): Promise<boolean> {
    // In a real implementation, this would schedule the post with each platform's scheduling API
    // or add to an internal job queue

    if (!post.scheduledAt) {
      throw new Error("Scheduled date is required for scheduling");
    }

    const scheduledDate = new Date(post.scheduledAt)
      .toISOString()
      .split("T")[0];
    SocialMediaContentCalendar.addPost(scheduledDate, post);

    logger.info("Post scheduled:", {
      postId: post.id,
      scheduledAt: post.scheduledAt,
      platforms: post.platforms,
    });

    return true;
  }
}

// Engagement Tracking
export class EngagementTracker {
  private static engagementData: Map<
    string,
    { [platform in SocialPlatform]?: any }
  > = new Map();

  static updateEngagement(
    postId: string,
    platform: SocialPlatform,
    metrics: any,
  ) {
    const currentData = this.engagementData.get(postId) || {};
    currentData[platform] = metrics;
    this.engagementData.set(postId, currentData);
  }

  static getEngagement(postId: string): { [platform in SocialPlatform]?: any } {
    return this.engagementData.get(postId) || {};
  }

  static generateMockEngagement(post: SocialMediaPost): void {
    // Generate realistic mock engagement data
    post.platforms.forEach((platform) => {
      const baseEngagement = Math.floor(Math.random() * 1000) + 100;
      const platformMultiplier = {
        facebook: 1.2,
        instagram: 1.5,
        twitter: 0.8,
        linkedin: 0.6,
        youtube: 2.0,
        tiktok: 3.0,
      }[platform];

      const metrics = {
        likes: Math.floor(baseEngagement * platformMultiplier),
        shares: Math.floor(baseEngagement * platformMultiplier * 0.1),
        comments: Math.floor(baseEngagement * platformMultiplier * 0.05),
        clicks: Math.floor(baseEngagement * platformMultiplier * 0.03),
        impressions: Math.floor(baseEngagement * platformMultiplier * 10),
        reach: Math.floor(baseEngagement * platformMultiplier * 8),
        engagement: Math.floor(baseEngagement * platformMultiplier * 1.1),
        engagementRate: Math.random() * 5 + 1,
        clickThroughRate: Math.random() * 2 + 0.5,
      };

      if (!post.metrics) {
        post.metrics = {};
      }
      post.metrics[platform] = metrics;

      this.updateEngagement(post.id, platform, metrics);
    });
  }
}

// Main Social Media Service Functions
export const createSocialMediaPost = async (
  data: CreateSocialMediaPostData,
): Promise<SocialMediaPost> => {
  try {
    const newPost: SocialMediaPost = {
      id: `social_${Date.now()}`,
      type: "social_media",
      name: data.name,
      campaignId: data.campaignId,
      clientId: data.clientId,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "current-user",
      platforms: data.platforms,
      message: data.message,
      hashtags: data.hashtags || [],
      mentions: [],
      publishType: data.publishType,
      scheduledAt: data.scheduledAt,
      status: "draft",
      metrics: {},
    };

    // Add hashtag usage tracking
    newPost.hashtags.forEach((hashtag) => {
      newPost.platforms.forEach((platform) => {
        HashtagManager.addHashtagUsage(hashtag, platform);
      });
    });

    mockSocialMediaPosts.push(newPost);
    logger.info("Social media post created successfully:", newPost.id);

    return newPost;
  } catch (error) {
    logger.error("Error creating social media post:", error);
    throw error;
  }
};

export const getSocialMediaPostById = async (
  id: string,
): Promise<SocialMediaPost | null> => {
  try {
    const post = mockSocialMediaPosts.find((p) => p.id === id);
    return post || null;
  } catch (error) {
    logger.error("Error getting social media post by ID:", error);
    throw error;
  }
};

export const getAllSocialMediaPosts = async (
  clientId?: string,
): Promise<SocialMediaPost[]> => {
  try {
    let posts = mockSocialMediaPosts;
    if (clientId) {
      posts = posts.filter((p) => p.clientId === clientId);
    }
    return posts;
  } catch (error) {
    logger.error("Error getting social media posts:", error);
    throw error;
  }
};

export const getSocialMediaPostsByCampaign = async (
  campaignId: string,
): Promise<SocialMediaPost[]> => {
  try {
    return mockSocialMediaPosts.filter((p) => p.campaignId === campaignId);
  } catch (error) {
    logger.error("Error getting social media posts by campaign:", error);
    throw error;
  }
};

export const updateSocialMediaPost = async (
  id: string,
  data: UpdateChannelData,
): Promise<SocialMediaPost | null> => {
  try {
    const index = mockSocialMediaPosts.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const updatedPost = {
      ...mockSocialMediaPosts[index],
      ...data,
      updatedAt: new Date(),
    } as SocialMediaPost;

    mockSocialMediaPosts[index] = updatedPost;
    logger.info("Social media post updated successfully:", id);
    return updatedPost;
  } catch (error) {
    logger.error("Error updating social media post:", error);
    throw error;
  }
};

export const deleteSocialMediaPost = async (id: string): Promise<boolean> => {
  try {
    const index = mockSocialMediaPosts.findIndex((p) => p.id === id);
    if (index === -1) return false;

    const post = mockSocialMediaPosts[index];

    // Remove from calendar if scheduled
    if (post.scheduledAt) {
      const date = new Date(post.scheduledAt).toISOString().split("T")[0];
      SocialMediaContentCalendar.removePost(date, id);
    }

    mockSocialMediaPosts.splice(index, 1);
    logger.info("Social media post deleted successfully:", id);
    return true;
  } catch (error) {
    logger.error("Error deleting social media post:", error);
    throw error;
  }
};

export const publishSocialMediaPost = async (id: string): Promise<boolean> => {
  try {
    const post = await getSocialMediaPostById(id);
    if (!post) return false;

    // Update status to publishing
    await updateSocialMediaPost(id, { status: "published" });

    // Publish to all platforms
    const results = await MultiPlatformPostingEngine.publishPost(post);

    // Check if at least one platform succeeded
    const hasSuccess = Object.values(results).some((result) => result?.success);

    if (hasSuccess) {
      // Generate mock engagement after a delay
      setTimeout(() => {
        EngagementTracker.generateMockEngagement(post);
      }, 5000);

      logger.info("Social media post published successfully:", {
        postId: id,
        results,
      });
      return true;
    } else {
      // Update status back to failed
      await updateSocialMediaPost(id, { status: "failed" });
      logger.error("Failed to publish to any platform:", results);
      return false;
    }
  } catch (error) {
    logger.error("Error publishing social media post:", error);
    throw error;
  }
};

export const scheduleSocialMediaPost = async (
  id: string,
  scheduledAt: Date,
): Promise<boolean> => {
  try {
    const post = await getSocialMediaPostById(id);
    if (!post) return false;

    // Update post with scheduled time
    const updatedPost = await updateSocialMediaPost(id, {
      status: "scheduled",
      scheduledAt,
    });

    if (updatedPost) {
      await MultiPlatformPostingEngine.schedulePost(updatedPost);
      logger.info("Social media post scheduled successfully:", id);
      return true;
    }

    return false;
  } catch (error) {
    logger.error("Error scheduling social media post:", error);
    throw error;
  }
};

// Content Calendar Functions
export const getContentCalendar = async (
  startDate: string,
  endDate: string,
  clientId?: string,
): Promise<Map<string, SocialMediaPost[]>> => {
  try {
    let calendarPosts = SocialMediaContentCalendar.getPostsForDateRange(
      startDate,
      endDate,
    );

    // Filter by client if specified
    if (clientId) {
      const filteredCalendar = new Map<string, SocialMediaPost[]>();
      for (const [date, posts] of calendarPosts.entries()) {
        const clientPosts = posts.filter((post) => post.clientId === clientId);
        if (clientPosts.length > 0) {
          filteredCalendar.set(date, clientPosts);
        }
      }
      calendarPosts = filteredCalendar;
    }

    return calendarPosts;
  } catch (error) {
    logger.error("Error getting content calendar:", error);
    throw error;
  }
};

export const getUpcomingPosts = async (
  clientId?: string,
  limit: number = 10,
): Promise<SocialMediaPost[]> => {
  try {
    let upcomingPosts = SocialMediaContentCalendar.getUpcomingPosts(limit * 2); // Get more to filter

    if (clientId) {
      upcomingPosts = upcomingPosts.filter(
        (post) => post.clientId === clientId,
      );
    }

    return upcomingPosts.slice(0, limit);
  } catch (error) {
    logger.error("Error getting upcoming posts:", error);
    throw error;
  }
};

// Analytics Functions
export const getSocialMediaAnalytics = async (
  postId: string,
): Promise<{ [platform in SocialPlatform]?: any }> => {
  try {
    return EngagementTracker.getEngagement(postId);
  } catch (error) {
    logger.error("Error getting social media analytics:", error);
    throw error;
  }
};

export const getHashtagSuggestions = async (
  content: string,
  platform: SocialPlatform,
): Promise<string[]> => {
  try {
    return HashtagManager.suggestHashtags(content, platform);
  } catch (error) {
    logger.error("Error getting hashtag suggestions:", error);
    throw error;
  }
};

export const getTrendingHashtags = async (
  limit: number = 20,
): Promise<
  Array<{ hashtag: string; count: number; platforms: SocialPlatform[] }>
> => {
  try {
    return HashtagManager.getTrendingHashtags(limit);
  } catch (error) {
    logger.error("Error getting trending hashtags:", error);
    throw error;
  }
};

export const validateContent = async (
  content: string,
  platform: SocialPlatform,
): Promise<{ isValid: boolean; warnings: string[]; suggestions: string[] }> => {
  try {
    const platformConfig = PLATFORM_CONFIGS[platform];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Check content length
    if (content.length > platformConfig.maxTextLength) {
      warnings.push(
        `Content exceeds ${platform} limit of ${platformConfig.maxTextLength} characters (current: ${content.length})`,
      );
      suggestions.push(
        "Consider shortening your message or splitting it into multiple posts",
      );
    }

    // Check for hashtags
    const hashtags = content.match(/#\w+/g) || [];
    if (hashtags.length > platformConfig.maxHashtags) {
      warnings.push(
        `Too many hashtags for ${platform} (max: ${platformConfig.maxHashtags}, current: ${hashtags.length})`,
      );
      suggestions.push("Remove some hashtags or use platform-specific content");
    }

    // Platform-specific suggestions
    if (platform === "twitter" && content.length < 100) {
      suggestions.push(
        "Twitter posts with 100-280 characters tend to get better engagement",
      );
    }

    if (platform === "instagram" && hashtags.length < 5) {
      suggestions.push(
        "Instagram posts perform better with 5-10 relevant hashtags",
      );
    }

    return {
      isValid: warnings.length === 0,
      warnings,
      suggestions,
    };
  } catch (error) {
    logger.error("Error validating content:", error);
    throw error;
  }
};

// Initialize some mock data
const initializeMockData = () => {
  // Add some trending hashtags
  const mockHashtags = [
    "#nonprofit",
    "#charity",
    "#giving",
    "#fundraising",
    "#volunteer",
    "#community",
    "#impact",
    "#change",
    "#help",
    "#support",
  ];

  mockHashtags.forEach((hashtag) => {
    const platforms: SocialPlatform[] = ["facebook", "twitter", "instagram"];
    platforms.forEach((platform) => {
      HashtagManager.addHashtagUsage(hashtag, platform);
    });
  });

  logger.info("Social media service initialized with mock data");
};

// Initialize on service load
initializeMockData();
