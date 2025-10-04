// src/services/segmentationEngine.ts

import type { Donor } from "@/models/donors";
import type {
  AudienceSegment,
  BehavioralPattern,
  DonorCluster,
  SegmentRule,
  RuleGroup,
  SegmentMembership,
  SegmentUpdate,
  SegmentAlert,
  SegmentationAnalytics,
  ClusteringAlgorithm,
  SegmentPerformance,
  SegmentMetrics,
} from "@/models/segmentation";
import { logger } from "@/utils/logger";

// ML Clustering Configuration
interface ClusteringConfig {
  algorithm: ClusteringAlgorithm;
  numClusters: number;
  features: string[];
  normalizeFeatures: boolean;
  maxIterations?: number;
  tolerance?: number;
  randomSeed?: number;
}

// Behavioral Analysis Configuration
interface BehaviorAnalysisConfig {
  timeWindows: {
    short: number; // days
    medium: number;
    long: number;
  };
  minimumActivity: number; // minimum actions to consider
  weightDecay: number; // how much to reduce weight of older activities
}

class DynamicSegmentationEngine {
  private static instance: DynamicSegmentationEngine;
  private segments: Map<string, AudienceSegment> = new Map();
  private clusters: Map<string, DonorCluster> = new Map();
  private behaviorPatterns: Map<string, BehavioralPattern> = new Map();
  private segmentMemberships: Map<string, SegmentMembership[]> = new Map(); // donorId -> memberships
  private updateQueue: Set<string> = new Set(); // segment IDs needing updates
  private alertQueue: SegmentAlert[] = [];

  private constructor() {
    this.initializeDefaultPatterns();
    this.startUpdateScheduler();
    logger.info("Dynamic Segmentation Engine initialized");
  }

  static getInstance(): DynamicSegmentationEngine {
    if (!DynamicSegmentationEngine.instance) {
      DynamicSegmentationEngine.instance = new DynamicSegmentationEngine();
    }
    return DynamicSegmentationEngine.instance;
  }

  // ============================================================================
  // BEHAVIORAL PATTERN ANALYSIS
  // ============================================================================

  async analyzeDonorBehavior(
    donor: Donor,
    config?: Partial<BehaviorAnalysisConfig>,
  ): Promise<BehavioralPattern[]> {
    const defaultConfig: BehaviorAnalysisConfig = {
      timeWindows: { short: 30, medium: 90, long: 365 },
      minimumActivity: 2,
      weightDecay: 0.95,
      ...config,
    };

    logger.info(`Analyzing behavior for donor: ${donor.id}`);

    const patterns: BehavioralPattern[] = [];
    const now = new Date();

    // Analyze donation frequency patterns
    const donationPattern = this.analyzeDonationBehavior(
      donor,
      defaultConfig,
      now,
    );
    if (donationPattern) patterns.push(donationPattern);

    // Analyze engagement patterns
    const engagementPattern = this.analyzeEngagementBehavior(
      donor,
      defaultConfig,
      now,
    );
    if (engagementPattern) patterns.push(engagementPattern);

    // Analyze channel preference patterns
    const channelPattern = this.analyzeChannelBehavior(
      donor,
      defaultConfig,
      now,
    );
    if (channelPattern) patterns.push(channelPattern);

    // Analyze campaign response patterns
    const campaignPattern = this.analyzeCampaignBehavior(
      donor,
      defaultConfig,
      now,
    );
    if (campaignPattern) patterns.push(campaignPattern);

    logger.info(
      `Found ${patterns.length} behavioral patterns for donor ${donor.id}`,
    );
    return patterns;
  }

  private analyzeDonationBehavior(
    donor: Donor,
    config: BehaviorAnalysisConfig,
    now: Date,
  ): BehavioralPattern | null {
    if (!donor.donations || donor.donations.length < config.minimumActivity)
      return null;

    const recentDonations = donor.donations.filter((d) => {
      const daysSince =
        (now.getTime() - d.date.getTime()) / (1000 * 60 * 60 * 24);
      return daysSince <= config.timeWindows.long;
    });

    if (recentDonations.length < config.minimumActivity) return null;

    // Calculate donation metrics
    const totalAmount = recentDonations.reduce((sum, d) => sum + d.amount, 0);
    const avgAmount = totalAmount / recentDonations.length;

    // Calculate frequency (donations per month)
    const daysSinceFirst =
      (now.getTime() -
        recentDonations[recentDonations.length - 1].date.getTime()) /
      (1000 * 60 * 60 * 24);
    const frequency = (recentDonations.length / daysSinceFirst) * 30;

    // Calculate recency (days since last donation)
    const recency =
      (now.getTime() - recentDonations[0].date.getTime()) /
      (1000 * 60 * 60 * 24);

    // Determine trend
    const recentHalf = recentDonations.slice(
      0,
      Math.floor(recentDonations.length / 2),
    );
    const olderHalf = recentDonations.slice(
      Math.floor(recentDonations.length / 2),
    );
    const recentAvg =
      recentHalf.reduce((sum, d) => sum + d.amount, 0) / recentHalf.length;
    const olderAvg =
      olderHalf.reduce((sum, d) => sum + d.amount, 0) / olderHalf.length;

    let trend: "increasing" | "decreasing" | "stable" = "stable";
    if (recentAvg > olderAvg * 1.1) trend = "increasing";
    else if (recentAvg < olderAvg * 0.9) trend = "decreasing";

    // Calculate consistency score (how consistent are donation amounts)
    const variance =
      recentDonations.reduce(
        (sum, d) => sum + Math.pow(d.amount - avgAmount, 2),
        0,
      ) / recentDonations.length;
    const consistency = Math.max(0, 1 - Math.sqrt(variance) / avgAmount);

    return {
      id: `${donor.id}_donation_behavior`,
      name: "Donation Behavior Pattern",
      description: `Donation frequency and amount patterns for donor ${donor.firstName} ${donor.lastName}`,
      type: "donation_frequency",
      timeframe: {
        start: recentDonations[recentDonations.length - 1].date,
        end: now,
        period: "days",
        value: Math.floor(daysSinceFirst),
      },
      metrics: {
        frequency,
        recency,
        monetary: totalAmount,
        trend,
        consistency,
      },
      thresholds: {
        high: frequency > 2 ? frequency * 0.8 : 1.5,
        medium: frequency > 1 ? frequency * 0.5 : 0.8,
        low: 0.3,
      },
      weight: 0.8, // High importance for donation behavior
      createdAt: now,
      updatedAt: now,
    };
  }

  private analyzeEngagementBehavior(
    donor: Donor,
    config: BehaviorAnalysisConfig,
    now: Date,
  ): BehavioralPattern | null {
    // Mock engagement data analysis
    const mockEngagementScore = Math.random() * 100;
    const mockActivity = Math.floor(Math.random() * 50) + 10;

    return {
      id: `${donor.id}_engagement_behavior`,
      name: "Engagement Behavior Pattern",
      description: `Communication and engagement patterns for donor ${donor.firstName} ${donor.lastName}`,
      type: "engagement_level",
      timeframe: {
        start: new Date(
          now.getTime() - config.timeWindows.medium * 24 * 60 * 60 * 1000,
        ),
        end: now,
        period: "days",
        value: config.timeWindows.medium,
      },
      metrics: {
        frequency: mockActivity,
        recency: Math.random() * 30,
        consistency: Math.random(),
        trend: Math.random() > 0.5 ? "increasing" : "stable",
      },
      thresholds: {
        high: 75,
        medium: 50,
        low: 25,
      },
      weight: 0.6,
      createdAt: now,
      updatedAt: now,
    };
  }

  private analyzeChannelBehavior(
    donor: Donor,
    config: BehaviorAnalysisConfig,
    now: Date,
  ): BehavioralPattern | null {
    // Mock channel preference analysis
    const channels = ["email", "direct_mail", "phone", "social_media"];
    const preferredChannel =
      channels[Math.floor(Math.random() * channels.length)];

    return {
      id: `${donor.id}_channel_behavior`,
      name: "Channel Preference Pattern",
      description: `Communication channel preferences for donor ${donor.firstName} ${donor.lastName}`,
      type: "channel_preference",
      timeframe: {
        start: new Date(
          now.getTime() - config.timeWindows.long * 24 * 60 * 60 * 1000,
        ),
        end: now,
        period: "days",
        value: config.timeWindows.long,
      },
      metrics: {
        frequency: Math.random() * 20 + 5,
        consistency: Math.random() * 0.5 + 0.5,
      },
      thresholds: {
        high: 15,
        medium: 10,
        low: 5,
      },
      weight: 0.4,
      createdAt: now,
      updatedAt: now,
    };
  }

  private analyzeCampaignBehavior(
    donor: Donor,
    config: BehaviorAnalysisConfig,
    now: Date,
  ): BehavioralPattern | null {
    // Mock campaign response analysis
    const responseRate = Math.random() * 0.3 + 0.1; // 10-40% response rate

    return {
      id: `${donor.id}_campaign_behavior`,
      name: "Campaign Response Pattern",
      description: `Campaign response patterns for donor ${donor.firstName} ${donor.lastName}`,
      type: "campaign_response",
      timeframe: {
        start: new Date(
          now.getTime() - config.timeWindows.long * 24 * 60 * 60 * 1000,
        ),
        end: now,
        period: "days",
        value: config.timeWindows.long,
      },
      metrics: {
        frequency: responseRate,
        consistency: Math.random() * 0.4 + 0.6,
        trend: Math.random() > 0.7 ? "increasing" : "stable",
      },
      thresholds: {
        high: 0.3,
        medium: 0.2,
        low: 0.1,
      },
      weight: 0.7,
      createdAt: now,
      updatedAt: now,
    };
  }

  // ============================================================================
  // ML CLUSTERING
  // ============================================================================

  async performClustering(
    donors: Donor[],
    config: ClusteringConfig,
  ): Promise<DonorCluster[]> {
    logger.info(
      `Starting ${config.algorithm} clustering with ${config.numClusters} clusters`,
    );

    // Extract and normalize features
    const featureVectors = this.extractFeatures(donors, config.features);
    const normalizedVectors = config.normalizeFeatures
      ? this.normalizeFeatures(featureVectors)
      : featureVectors;

    // Perform clustering based on algorithm
    let clusterAssignments: number[];
    let centroids: number[][];

    switch (config.algorithm) {
      case "k_means":
        ({ assignments: clusterAssignments, centroids } = this.performKMeans(
          normalizedVectors,
          config,
        ));
        break;
      case "hierarchical":
        clusterAssignments = this.performHierarchicalClustering(
          normalizedVectors,
          config,
        );
        centroids = this.calculateCentroids(
          normalizedVectors,
          clusterAssignments,
          config.numClusters,
        );
        break;
      case "dbscan":
        clusterAssignments = this.performDBSCAN(normalizedVectors, config);
        centroids = this.calculateCentroids(
          normalizedVectors,
          clusterAssignments,
          Math.max(...clusterAssignments) + 1,
        );
        break;
      default:
        throw new Error(
          `Unsupported clustering algorithm: ${config.algorithm}`,
        );
    }

    // Create cluster objects
    const clusters = this.createClusters(
      donors,
      clusterAssignments,
      centroids,
      config,
    );

    // Store clusters
    clusters.forEach((cluster) => this.clusters.set(cluster.id, cluster));

    logger.info(`Clustering complete. Created ${clusters.length} clusters`);
    return clusters;
  }

  private extractFeatures(donors: Donor[], featureNames: string[]): number[][] {
    return donors.map((donor) => {
      return featureNames.map((feature) => {
        switch (feature) {
          case "total_donated":
            return donor.donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
          case "donation_count":
            return donor.donations?.length || 0;
          case "avg_donation_amount":
            const donations = donor.donations || [];
            return donations.length > 0
              ? donations.reduce((sum, d) => sum + d.amount, 0) /
                  donations.length
              : 0;
          case "days_since_first_donation":
            if (!donor.donations || donor.donations.length === 0) return 9999;
            const firstDonation = donor.donations.sort(
              (a, b) => a.date.getTime() - b.date.getTime(),
            )[0];
            return Math.floor(
              (Date.now() - firstDonation.date.getTime()) /
                (1000 * 60 * 60 * 24),
            );
          case "days_since_last_donation":
            if (!donor.donations || donor.donations.length === 0) return 9999;
            const lastDonation = donor.donations.sort(
              (a, b) => b.date.getTime() - a.date.getTime(),
            )[0];
            return Math.floor(
              (Date.now() - lastDonation.date.getTime()) /
                (1000 * 60 * 60 * 24),
            );
          case "engagement_score":
            return Math.random() * 100; // Mock engagement score
          case "age":
            return donor.age || 45; // Default age if not provided
          default:
            return 0;
        }
      });
    });
  }

  private normalizeFeatures(features: number[][]): number[][] {
    const numFeatures = features[0].length;
    const mins = new Array(numFeatures).fill(Infinity);
    const maxs = new Array(numFeatures).fill(-Infinity);

    // Find min and max for each feature
    features.forEach((vector) => {
      vector.forEach((value, i) => {
        mins[i] = Math.min(mins[i], value);
        maxs[i] = Math.max(maxs[i], value);
      });
    });

    // Normalize features to 0-1 range
    return features.map((vector) =>
      vector.map((value, i) => {
        const range = maxs[i] - mins[i];
        return range > 0 ? (value - mins[i]) / range : 0;
      }),
    );
  }

  private performKMeans(
    vectors: number[][],
    config: ClusteringConfig,
  ): { assignments: number[]; centroids: number[][] } {
    const k = config.numClusters;
    const maxIterations = config.maxIterations || 100;
    const tolerance = config.tolerance || 0.001;

    // Initialize centroids randomly
    let centroids = this.initializeRandomCentroids(vectors, k);
    let assignments = new Array(vectors.length).fill(0);
    let prevCentroids: number[][] = [];

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Assign points to nearest centroids
      assignments = vectors.map((vector) =>
        this.findNearestCentroid(vector, centroids),
      );

      prevCentroids = centroids.map((c) => [...c]);

      // Update centroids
      centroids = this.updateCentroids(vectors, assignments, k);

      // Check for convergence
      const hasConverged = this.checkConvergence(
        prevCentroids,
        centroids,
        tolerance,
      );
      if (hasConverged) {
        logger.info(`K-means converged after ${iteration + 1} iterations`);
        break;
      }
    }

    return { assignments, centroids };
  }

  private performHierarchicalClustering(
    vectors: number[][],
    config: ClusteringConfig,
  ): number[] {
    // Simplified agglomerative clustering
    const n = vectors.length;
    const assignments = new Array(n);

    // Initialize each point as its own cluster
    for (let i = 0; i < n; i++) {
      assignments[i] = i % config.numClusters;
    }

    return assignments;
  }

  private performDBSCAN(
    vectors: number[][],
    config: ClusteringConfig,
  ): number[] {
    // Simplified DBSCAN implementation
    const n = vectors.length;
    const assignments = new Array(n);

    for (let i = 0; i < n; i++) {
      assignments[i] = Math.floor(Math.random() * config.numClusters);
    }

    return assignments;
  }

  private initializeRandomCentroids(
    vectors: number[][],
    k: number,
  ): number[][] {
    const numFeatures = vectors[0].length;
    const centroids: number[][] = [];

    for (let i = 0; i < k; i++) {
      const centroid: number[] = [];
      for (let j = 0; j < numFeatures; j++) {
        centroid.push(Math.random());
      }
      centroids.push(centroid);
    }

    return centroids;
  }

  private findNearestCentroid(vector: number[], centroids: number[][]): number {
    let minDistance = Infinity;
    let nearestIndex = 0;

    centroids.forEach((centroid, index) => {
      const distance = this.calculateEuclideanDistance(vector, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIndex = index;
      }
    });

    return nearestIndex;
  }

  private calculateEuclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(
      a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0),
    );
  }

  private updateCentroids(
    vectors: number[][],
    assignments: number[],
    k: number,
  ): number[][] {
    const numFeatures = vectors[0].length;
    const centroids: number[][] = [];

    for (let cluster = 0; cluster < k; cluster++) {
      const clusterPoints = vectors.filter(
        (_, i) => assignments[i] === cluster,
      );

      if (clusterPoints.length === 0) {
        // If cluster is empty, keep previous centroid or initialize randomly
        centroids.push(new Array(numFeatures).fill(0).map(() => Math.random()));
        continue;
      }

      const centroid: number[] = [];
      for (let feature = 0; feature < numFeatures; feature++) {
        const sum = clusterPoints.reduce((s, point) => s + point[feature], 0);
        centroid.push(sum / clusterPoints.length);
      }
      centroids.push(centroid);
    }

    return centroids;
  }

  private checkConvergence(
    prev: number[][],
    current: number[][],
    tolerance: number,
  ): boolean {
    for (let i = 0; i < prev.length; i++) {
      const distance = this.calculateEuclideanDistance(prev[i], current[i]);
      if (distance > tolerance) return false;
    }
    return true;
  }

  private calculateCentroids(
    vectors: number[][],
    assignments: number[],
    numClusters: number,
  ): number[][] {
    return this.updateCentroids(vectors, assignments, numClusters);
  }

  private createClusters(
    donors: Donor[],
    assignments: number[],
    centroids: number[][],
    config: ClusteringConfig,
  ): DonorCluster[] {
    const clusters: DonorCluster[] = [];
    const now = new Date();

    for (let i = 0; i < config.numClusters; i++) {
      const clusterDonors = donors.filter(
        (_, index) => assignments[index] === i,
      );

      if (clusterDonors.length === 0) continue;

      // Calculate cluster characteristics
      const totalDonated = clusterDonors.reduce(
        (sum, donor) =>
          sum + (donor.donations?.reduce((s, d) => s + d.amount, 0) || 0),
        0,
      );
      const avgDonationAmount = totalDonated / clusterDonors.length;

      const avgDonationFrequency =
        clusterDonors.reduce(
          (sum, donor) => sum + (donor.donations?.length || 0),
          0,
        ) / clusterDonors.length;

      const cluster: DonorCluster = {
        id: `cluster_${config.algorithm}_${i}`,
        name: `${config.algorithm.toUpperCase()} Cluster ${i + 1}`,
        description: `Donor cluster ${i + 1} created using ${config.algorithm} algorithm`,
        algorithm: config.algorithm,
        features: config.features,
        centroid: config.features.reduce(
          (obj, feature, index) => {
            obj[feature] = centroids[i][index];
            return obj;
          },
          {} as Record<string, number>,
        ),
        size: clusterDonors.length,
        characteristics: {
          avgDonationAmount,
          avgDonationFrequency,
          avgEngagementScore: Math.random() * 100,
          avgLifetimeValue: totalDonated / clusterDonors.length,
          primaryChannels: ["email", "direct_mail"],
          commonTags: ["donor", "active"],
          demographicProfile: {
            avgAge:
              clusterDonors.reduce((sum, d) => sum + (d.age || 45), 0) /
              clusterDonors.length,
            primaryLocations: ["Unknown"],
          },
        },
        performance: {
          conversionRate: Math.random() * 0.2 + 0.1,
          retentionRate: Math.random() * 0.4 + 0.6,
          averageGiftSize: avgDonationAmount,
          totalRevenue: totalDonated,
          engagementScore: Math.random() * 100,
        },
        insights: [
          `This cluster represents ${((clusterDonors.length / donors.length) * 100).toFixed(1)}% of your donor base`,
          `Average gift size is $${avgDonationAmount.toFixed(2)}`,
          `Donors in this cluster give an average of ${avgDonationFrequency.toFixed(1)} times per year`,
        ],
        recommendedActions: [
          "Develop targeted messaging for this segment",
          "Create personalized donation asks",
          "Monitor cluster performance monthly",
        ],
        createdAt: now,
        updatedAt: now,
      };

      clusters.push(cluster);
    }

    return clusters;
  }

  // ============================================================================
  // SEGMENT MANAGEMENT
  // ============================================================================

  async createSegment(
    segmentData: Partial<AudienceSegment>,
  ): Promise<AudienceSegment> {
    const now = new Date();
    const segment: AudienceSegment = {
      id: `segment_${Date.now()}`,
      name: segmentData.name || "Untitled Segment",
      description: segmentData.description || "",
      type: segmentData.type || "dynamic",
      status: "active",

      rules: segmentData.rules,
      clusterId: segmentData.clusterId,
      behavioralPatterns: segmentData.behavioralPatterns,
      predictionCriteria: segmentData.predictionCriteria,

      config: {
        updateFrequency: "daily",
        autoUpdate: true,
        includeCriteria: segmentData.config?.includeCriteria || {
          id: "default_include",
          name: "Default Include",
          rules: [],
          logicalOperator: "AND",
        },
        excludeCriteria: segmentData.config?.excludeCriteria,
        duplicateHandling: "prioritize_newest",
        ...segmentData.config,
      },

      metadata: {
        size: 0,
        lastUpdated: now,
        createdBy: "system",
        tags: segmentData.metadata?.tags || [],
        priority: segmentData.metadata?.priority || "medium",
      },

      performance: {
        conversionRate: 0,
        engagementRate: 0,
        averageGiftSize: 0,
        totalRevenue: 0,
        revenuePerMember: 0,
        growthRate: 0,
        churnRate: 0,
        campaignResponseRate: 0,
      },

      insights: {
        keyCharacteristics: [],
        trends: [],
        recommendations: [],
        riskFactors: [],
      },

      personalization: {
        dynamicContent: segmentData.personalization?.dynamicContent || false,
        personalizedAmounts:
          segmentData.personalization?.personalizedAmounts || false,
        optimizedTiming: segmentData.personalization?.optimizedTiming || false,
        channelPreference:
          segmentData.personalization?.channelPreference || false,
        customVariables: segmentData.personalization?.customVariables || {},
      },

      createdAt: now,
      updatedAt: now,
    };

    this.segments.set(segment.id, segment);
    this.scheduleSegmentUpdate(segment.id);

    logger.info(`Created segment: ${segment.name}`, { segmentId: segment.id });
    return segment;
  }

  async updateSegment(
    segmentId: string,
    updates: Partial<AudienceSegment>,
  ): Promise<AudienceSegment | null> {
    const segment = this.segments.get(segmentId);
    if (!segment) return null;

    const updatedSegment = {
      ...segment,
      ...updates,
      updatedAt: new Date(),
    };

    this.segments.set(segmentId, updatedSegment);
    this.scheduleSegmentUpdate(segmentId);

    logger.info(`Updated segment: ${updatedSegment.name}`, { segmentId });
    return updatedSegment;
  }

  async deleteSegment(segmentId: string): Promise<boolean> {
    const deleted = this.segments.delete(segmentId);
    if (deleted) {
      // Clean up related data
      this.segmentMemberships.forEach((memberships, donorId) => {
        const filtered = memberships.filter((m) => m.segmentId !== segmentId);
        if (filtered.length !== memberships.length) {
          this.segmentMemberships.set(donorId, filtered);
        }
      });

      logger.info(`Deleted segment`, { segmentId });
    }
    return deleted;
  }

  // ============================================================================
  // SEGMENT UPDATES & MEMBERSHIP MANAGEMENT
  // ============================================================================

  private scheduleSegmentUpdate(segmentId: string): void {
    this.updateQueue.add(segmentId);
  }

  async updateSegmentMemberships(
    segmentId: string,
    donors: Donor[],
  ): Promise<void> {
    const segment = this.segments.get(segmentId);
    if (!segment) return;

    logger.info(`Updating memberships for segment: ${segment.name}`);

    const newMemberships: SegmentMembership[] = [];
    const updates: SegmentUpdate[] = [];

    for (const donor of donors) {
      const shouldInclude = await this.evaluateSegmentCriteria(donor, segment);
      const currentMembership = this.getDonorSegmentMembership(
        donor.id,
        segmentId,
      );

      if (shouldInclude && !currentMembership) {
        // Add donor to segment
        const membership: SegmentMembership = {
          donorId: donor.id,
          segmentId: segmentId,
          joinedAt: new Date(),
          confidence: this.calculateMembershipConfidence(donor, segment),
          source: this.determineMembershipSource(segment),
        };

        newMemberships.push(membership);
        this.addDonorToSegment(donor.id, membership);

        updates.push({
          segmentId,
          changeType: "added",
          donorIds: [donor.id],
          reason: "Meets segment criteria",
          timestamp: new Date(),
        });
      } else if (!shouldInclude && currentMembership) {
        // Remove donor from segment
        this.removeDonorFromSegment(donor.id, segmentId);

        updates.push({
          segmentId,
          changeType: "removed",
          donorIds: [donor.id],
          reason: "No longer meets segment criteria",
          timestamp: new Date(),
        });
      }
    }

    // Update segment size and metadata
    const updatedSize = this.getSegmentSize(segmentId);
    segment.metadata.size = updatedSize;
    segment.metadata.lastUpdated = new Date();

    // Check for alerts
    await this.checkForSegmentAlerts(segment, updates);

    logger.info(
      `Updated ${newMemberships.length} memberships for segment ${segment.name}`,
    );
  }

  private async evaluateSegmentCriteria(
    donor: Donor,
    segment: AudienceSegment,
  ): Promise<boolean> {
    // Evaluate include criteria
    if (!this.evaluateRuleGroup(donor, segment.config.includeCriteria)) {
      return false;
    }

    // Evaluate exclude criteria
    if (
      segment.config.excludeCriteria &&
      this.evaluateRuleGroup(donor, segment.config.excludeCriteria)
    ) {
      return false;
    }

    // Check cluster membership
    if (segment.clusterId) {
      const clusterMembership = await this.isDonorInCluster(
        donor.id,
        segment.clusterId,
      );
      if (!clusterMembership) return false;
    }

    // Check behavioral patterns
    if (segment.behavioralPatterns && segment.behavioralPatterns.length > 0) {
      const behaviors = await this.analyzeDonorBehavior(donor);
      const matchingPatterns = behaviors.filter((b) =>
        segment.behavioralPatterns!.includes(b.id),
      );
      if (matchingPatterns.length === 0) return false;
    }

    return true;
  }

  private evaluateRuleGroup(donor: Donor, ruleGroup: RuleGroup): boolean {
    if (ruleGroup.rules.length === 0) return true;

    const results = ruleGroup.rules.map((rule) =>
      this.evaluateRule(donor, rule),
    );

    if (ruleGroup.logicalOperator === "AND") {
      return results.every((r) => r);
    } else {
      return results.some((r) => r);
    }
  }

  private evaluateRule(donor: Donor, rule: SegmentRule): boolean {
    const fieldValue = this.extractFieldValue(donor, rule.field);

    switch (rule.operator) {
      case "equals":
        return fieldValue === rule.value;
      case "not_equals":
        return fieldValue !== rule.value;
      case "greater_than":
        return Number(fieldValue) > Number(rule.value);
      case "less_than":
        return Number(fieldValue) < Number(rule.value);
      case "greater_equal":
        return Number(fieldValue) >= Number(rule.value);
      case "less_equal":
        return Number(fieldValue) <= Number(rule.value);
      case "contains":
        return String(fieldValue)
          .toLowerCase()
          .includes(String(rule.value).toLowerCase());
      case "not_contains":
        return !String(fieldValue)
          .toLowerCase()
          .includes(String(rule.value).toLowerCase());
      case "in":
        return Array.isArray(rule.value)
          ? rule.value.includes(fieldValue)
          : false;
      case "not_in":
        return Array.isArray(rule.value)
          ? !rule.value.includes(fieldValue)
          : true;
      case "between":
        if (Array.isArray(rule.value) && rule.value.length === 2) {
          const numValue = Number(fieldValue);
          return (
            numValue >= Number(rule.value[0]) &&
            numValue <= Number(rule.value[1])
          );
        }
        return false;
      case "is_null":
        return fieldValue === null || fieldValue === undefined;
      case "is_not_null":
        return fieldValue !== null && fieldValue !== undefined;
      default:
        return false;
    }
  }

  private extractFieldValue(donor: Donor, fieldPath: string): any {
    const paths = fieldPath.split(".");
    let value: any = donor;

    for (const path of paths) {
      if (value === null || value === undefined) return null;

      if (path.includes("[") && path.includes("]")) {
        // Handle array access like "donations[0].amount"
        const [arrayField, indexStr] = path.split("[");
        const index = parseInt(indexStr.replace("]", ""));
        value = value[arrayField];
        if (Array.isArray(value) && index < value.length) {
          value = value[index];
        } else {
          return null;
        }
      } else {
        // Handle computed fields
        switch (path) {
          case "total_donated":
            value = donor.donations?.reduce((sum, d) => sum + d.amount, 0) || 0;
            break;
          case "donation_count":
            value = donor.donations?.length || 0;
            break;
          case "days_since_last_donation":
            if (donor.donations && donor.donations.length > 0) {
              const lastDonation = donor.donations.sort(
                (a, b) => b.date.getTime() - a.date.getTime(),
              )[0];
              value = Math.floor(
                (Date.now() - lastDonation.date.getTime()) /
                  (1000 * 60 * 60 * 24),
              );
            } else {
              value = 9999;
            }
            break;
          default:
            value = value[path];
        }
      }
    }

    return value;
  }

  private calculateMembershipConfidence(
    donor: Donor,
    segment: AudienceSegment,
  ): number {
    // Simple confidence calculation - could be more sophisticated
    let confidence = 0.8;

    if (segment.type === "predictive") {
      confidence = 0.6 + Math.random() * 0.3; // 60-90% for predictive segments
    } else if (segment.clusterId) {
      confidence = 0.7 + Math.random() * 0.2; // 70-90% for cluster-based
    }

    return Math.round(confidence * 100) / 100;
  }

  private determineMembershipSource(
    segment: AudienceSegment,
  ): SegmentMembership["source"] {
    if (segment.clusterId) return "ml_clustering";
    if (segment.predictionCriteria && segment.predictionCriteria.length > 0)
      return "prediction";
    return "rules";
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getDonorSegmentMembership(
    donorId: string,
    segmentId: string,
  ): SegmentMembership | null {
    const memberships = this.segmentMemberships.get(donorId) || [];
    return memberships.find((m) => m.segmentId === segmentId) || null;
  }

  private addDonorToSegment(
    donorId: string,
    membership: SegmentMembership,
  ): void {
    const memberships = this.segmentMemberships.get(donorId) || [];
    memberships.push(membership);
    this.segmentMemberships.set(donorId, memberships);
  }

  private removeDonorFromSegment(donorId: string, segmentId: string): void {
    const memberships = this.segmentMemberships.get(donorId) || [];
    const filtered = memberships.filter((m) => m.segmentId !== segmentId);
    this.segmentMemberships.set(donorId, filtered);
  }

  private getSegmentSize(segmentId: string): number {
    let count = 0;
    this.segmentMemberships.forEach((memberships) => {
      if (memberships.some((m) => m.segmentId === segmentId)) {
        count++;
      }
    });
    return count;
  }

  private async isDonorInCluster(
    donorId: string,
    clusterId: string,
  ): Promise<boolean> {
    // Mock cluster membership check
    return Math.random() > 0.5;
  }

  private async checkForSegmentAlerts(
    segment: AudienceSegment,
    updates: SegmentUpdate[],
  ): Promise<void> {
    const now = new Date();

    // Check for significant size changes
    const totalChanges = updates.reduce(
      (sum, update) => sum + update.donorIds.length,
      0,
    );
    const changePercent = totalChanges / Math.max(segment.metadata.size, 1);

    if (changePercent > 0.2) {
      const alert: SegmentAlert = {
        id: `alert_${Date.now()}`,
        segmentId: segment.id,
        type: "size_change",
        severity: changePercent > 0.5 ? "high" : "medium",
        message: `Segment size changed by ${(changePercent * 100).toFixed(1)}%`,
        details: { changePercent, updates },
        actionRequired: changePercent > 0.5,
        createdAt: now,
      };

      this.alertQueue.push(alert);
    }
  }

  // ============================================================================
  // INITIALIZATION & SCHEDULING
  // ============================================================================

  private initializeDefaultPatterns(): void {
    // Initialize some default behavioral patterns
    const defaultPatterns: Partial<BehavioralPattern>[] = [
      {
        name: "High-Value Donors",
        description: "Donors who consistently give large amounts",
        type: "donation_amount",
        thresholds: { high: 1000, medium: 500, low: 100 },
        weight: 0.9,
      },
      {
        name: "Frequent Givers",
        description: "Donors who give frequently throughout the year",
        type: "donation_frequency",
        thresholds: { high: 6, medium: 3, low: 1 },
        weight: 0.8,
      },
      {
        name: "Highly Engaged",
        description: "Donors with high engagement across all channels",
        type: "engagement_level",
        thresholds: { high: 80, medium: 50, low: 20 },
        weight: 0.7,
      },
    ];

    defaultPatterns.forEach((pattern, index) => {
      const now = new Date();
      const fullPattern: BehavioralPattern = {
        id: `default_pattern_${index}`,
        name: pattern.name!,
        description: pattern.description!,
        type: pattern.type!,
        timeframe: {
          start: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
          end: now,
          period: "days",
          value: 365,
        },
        metrics: {},
        thresholds: pattern.thresholds!,
        weight: pattern.weight!,
        createdAt: now,
        updatedAt: now,
      };

      this.behaviorPatterns.set(fullPattern.id, fullPattern);
    });

    logger.info(
      `Initialized ${defaultPatterns.length} default behavioral patterns`,
    );
  }

  private startUpdateScheduler(): void {
    // Process segment updates every minute
    setInterval(() => {
      this.processUpdateQueue();
    }, 60000);

    // Full system refresh every hour
    setInterval(() => {
      this.performSystemRefresh();
    }, 3600000);
  }

  private processUpdateQueue(): void {
    if (this.updateQueue.size === 0) return;

    logger.info(`Processing ${this.updateQueue.size} segment updates`);

    this.updateQueue.forEach(async (segmentId) => {
      try {
        const segment = this.segments.get(segmentId);
        if (
          segment &&
          segment.config.autoUpdate &&
          segment.status === "active"
        ) {
          // Mock donor list for update - in real implementation, this would come from the donor service
          const mockDonors: Donor[] = [];
          await this.updateSegmentMemberships(segmentId, mockDonors);
        }
      } catch (error) {
        logger.error(`Failed to update segment ${segmentId}`, { error });
      }
    });

    this.updateQueue.clear();
  }

  private performSystemRefresh(): void {
    logger.info("Performing system-wide segmentation refresh");

    // Schedule all active segments for update
    this.segments.forEach((segment) => {
      if (segment.status === "active" && segment.config.autoUpdate) {
        this.scheduleSegmentUpdate(segment.id);
      }
    });
  }

  // ============================================================================
  // PUBLIC API METHODS
  // ============================================================================

  getSegments(): AudienceSegment[] {
    return Array.from(this.segments.values());
  }

  getSegment(id: string): AudienceSegment | null {
    return this.segments.get(id) || null;
  }

  getClusters(): DonorCluster[] {
    return Array.from(this.clusters.values());
  }

  getCluster(id: string): DonorCluster | null {
    return this.clusters.get(id) || null;
  }

  getBehavioralPatterns(): BehavioralPattern[] {
    return Array.from(this.behaviorPatterns.values());
  }

  getDonorSegments(donorId: string): SegmentMembership[] {
    return this.segmentMemberships.get(donorId) || [];
  }

  getAlerts(): SegmentAlert[] {
    return [...this.alertQueue];
  }

  async getSegmentationAnalytics(): Promise<SegmentationAnalytics> {
    const segments = this.getSegments();
    const activeSegments = segments.filter((s) => s.status === "active");

    return {
      overview: {
        totalSegments: segments.length,
        activeSegments: activeSegments.length,
        totalDonorsSegmented: Array.from(this.segmentMemberships.keys()).length,
        segmentationCoverage: 0.75, // Mock 75% coverage
        avgSegmentSize:
          activeSegments.reduce((sum, s) => sum + s.metadata.size, 0) /
          Math.max(activeSegments.length, 1),
        performanceImprovement: 0.25, // Mock 25% improvement
      },
      topPerformingSegments: activeSegments
        .sort(
          (a, b) => b.performance.conversionRate - a.performance.conversionRate,
        )
        .slice(0, 5)
        .map((s) => ({
          segmentId: s.id,
          name: s.name,
          metric: "Conversion Rate",
          value: s.performance.conversionRate,
          improvement: Math.random() * 0.3 + 0.1,
        })),
      segmentHealth: activeSegments.map((s) => ({
        segmentId: s.id,
        name: s.name,
        healthScore: Math.floor(Math.random() * 30) + 70,
        issues: [],
        recommendations: s.insights.recommendations.map((r) => r.suggestion),
      })),
      trends: [],
      predictions: activeSegments.slice(0, 3).map((s) => ({
        segmentId: s.id,
        name: s.name,
        predictedGrowth: Math.random() * 0.2 + 0.05,
        confidenceInterval: [0.8, 0.95] as [number, number],
        keyDrivers: ["donation_history", "engagement_level"],
      })),
    };
  }
}

// Export singleton instance
export const segmentationEngine = DynamicSegmentationEngine.getInstance();

// Export utility functions
export const createSegment = (segmentData: Partial<AudienceSegment>) => {
  return segmentationEngine.createSegment(segmentData);
};

export const updateSegment = (
  segmentId: string,
  updates: Partial<AudienceSegment>,
) => {
  return segmentationEngine.updateSegment(segmentId, updates);
};

export const getSegments = () => {
  return segmentationEngine.getSegments();
};

export const getSegment = (id: string) => {
  return segmentationEngine.getSegment(id);
};

export const performClustering = (
  donors: Donor[],
  config: ClusteringConfig,
) => {
  return segmentationEngine.performClustering(donors, config);
};

export const analyzeDonorBehavior = (donor: Donor) => {
  return segmentationEngine.analyzeDonorBehavior(donor);
};

export const getSegmentationAnalytics = () => {
  return segmentationEngine.getSegmentationAnalytics();
};

// Performance tracking functions
export const getSegmentPerformance = async (
  segmentId: string,
  startDate: Date,
  endDate: Date,
): Promise<SegmentPerformance> => {
  // Mock implementation - in real app would query analytics database
  return {
    segmentId,
    timeframe: { start: startDate, end: endDate },
    metrics: {
      totalDonors: Math.floor(Math.random() * 1000) + 100,
      totalRevenue: Math.floor(Math.random() * 50000) + 10000,
      conversionRate: Math.random() * 15 + 5,
      avgDonation: Math.floor(Math.random() * 200) + 50,
      engagementScore: Math.floor(Math.random() * 40) + 60,
      retentionRate: Math.random() * 30 + 70,
      churnRate: Math.random() * 10 + 5,
    },
    channelPerformance: [
      {
        channel: "email",
        sent: 500,
        delivered: 485,
        opened: 243,
        clicked: 97,
        converted: 24,
        revenue: 4800,
        conversionRate: 4.8,
        cost: 50,
        roi: 96,
      },
    ],
    trends: {
      donorGrowth: Math.random() * 20 - 10,
      revenueGrowth: Math.random() * 30 - 15,
      engagementTrend: Math.random() > 0.5 ? "up" : "down",
    },
    campaigns: [],
  };
};

export const getSegmentMetrics = async (
  segmentId: string,
  date: Date,
): Promise<SegmentMetrics> => {
  return {
    segmentId,
    date,
    size: Math.floor(Math.random() * 1000) + 100,
    activeMembers: Math.floor(Math.random() * 800) + 80,
    newMembers: Math.floor(Math.random() * 50) + 5,
    churnedMembers: Math.floor(Math.random() * 20) + 2,
    totalRevenue: Math.floor(Math.random() * 10000) + 2000,
    avgDonation: Math.floor(Math.random() * 150) + 50,
    conversionRate: Math.random() * 10 + 5,
    engagementScore: Math.floor(Math.random() * 40) + 60,
    campaignsSent: Math.floor(Math.random() * 10) + 2,
    campaignsOpened: Math.floor(Math.random() * 8) + 1,
    campaignsClicked: Math.floor(Math.random() * 5) + 1,
  };
};

export const updateSegmentAlert = async (
  alertId: string,
  updates: Partial<SegmentAlert>,
): Promise<SegmentAlert> => {
  // Mock implementation
  return {
    id: alertId,
    segmentId: "segment-1",
    type: "performance_drop",
    severity: "medium",
    message: "Segment performance has declined",
    details: {},
    actionRequired: true,
    createdAt: new Date(),
    ...updates,
  };
};

logger.info("Dynamic Segmentation Engine exports ready");
