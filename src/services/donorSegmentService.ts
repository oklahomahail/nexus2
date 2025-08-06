import { 
  DonorSegment, 
  DonorSegmentData, 
  DonorSegmentAnalytics, 
  SegmentFilter, 
  SegmentComparison,
  SegmentMetricsTrend,
  SegmentGoal,
  DEFAULT_SEGMENT_TEMPLATES 
} from '../models/donorSegments';

// Mock data for development - replace with actual API calls
class DonorSegmentService {
  private segments: DonorSegment[] = [];
  private segmentData: DonorSegmentData[] = [];

  constructor() {
    this.initializeDefaultSegments();
    this.generateMockData();
  }

  private initializeDefaultSegments() {
    this.segments = DEFAULT_SEGMENT_TEMPLATES.map((template, index) => ({
      ...template,
      id: `segment-${index + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }));
  }

  private generateMockData() {
    // Generate realistic mock data for each segment
    this.segmentData = this.segments.map((segment, index) => {
      const baseMetrics = this.generateSegmentMetrics(segment);
      return {
        segmentId: segment.id,
        segmentName: segment.name,
        ...baseMetrics,
        giftPatterns: this.generateGiftPatterns(segment),
        campaignPerformance: this.generateCampaignPerformance(segment)
      };
    });
  }

  private generateSegmentMetrics(segment: DonorSegment): Omit<DonorSegmentData, 'segmentId' | 'segmentName' | 'giftPatterns' | 'campaignPerformance'> {
    // Generate realistic metrics based on segment type
    const segmentMultipliers: Record<string, any> = {
      'Board Members': { count: 12, avgGift: 2500, retention: 95, engagement: 95 },
      'Major Gift Prospects': { count: 45, avgGift: 1500, retention: 85, engagement: 80 },
      'Monthly Donors': { count: 234, avgGift: 85, retention: 88, engagement: 75 },
      'Annual Donors': { count: 456, avgGift: 350, retention: 72, engagement: 65 },
      'Volunteers': { count: 189, avgGift: 125, retention: 78, engagement: 90 },
      'Event Participants': { count: 167, avgGift: 200, retention: 65, engagement: 70 },
      'Corporate Partners': { count: 23, avgGift: 2000, retention: 82, engagement: 75 },
      'Lapsed Donors': { count: 298, avgGift: 150, retention: 15, engagement: 25 },
      'First-Time Donors': { count: 145, avgGift: 95, retention: 45, engagement: 60 },
      'Alumni': { count: 78, avgGift: 175, retention: 68, engagement: 55 }
    };

    const metrics = segmentMultipliers[segment.name] || { count: 100, avgGift: 200, retention: 60, engagement: 60 };
    
    return {
      donorCount: metrics.count,
      totalContributed: metrics.count * metrics.avgGift,
      averageGiftSize: metrics.avgGift,
      lastGiftDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
      retentionRate: metrics.retention,
      growthRate: (Math.random() - 0.5) * 30, // -15% to +15%
      conversionRate: segment.name.includes('Prospect') ? Math.random() * 25 + 10 : undefined,
      engagementScore: metrics.engagement
    };
  }

  private generateGiftPatterns(segment: DonorSegment) {
    const patterns = {
      frequency: this.getSegmentFrequency(segment),
      seasonalTrends: [
        { season: 'Spring' as const, donorCount: Math.floor(Math.random() * 50) + 20, totalGifts: Math.floor(Math.random() * 100) + 50 },
        { season: 'Summer' as const, donorCount: Math.floor(Math.random() * 40) + 15, totalGifts: Math.floor(Math.random() * 80) + 40 },
        { season: 'Fall' as const, donorCount: Math.floor(Math.random() * 80) + 40, totalGifts: Math.floor(Math.random() * 150) + 100 },
        { season: 'Winter' as const, donorCount: Math.floor(Math.random() * 100) + 60, totalGifts: Math.floor(Math.random() * 200) + 150 }
      ],
      channelPreferences: [
        { channel: 'Online' as const, percentage: Math.random() * 40 + 30, averageGift: Math.random() * 200 + 100 },
        { channel: 'Direct Mail' as const, percentage: Math.random() * 30 + 20, averageGift: Math.random() * 300 + 150 },
        { channel: 'Events' as const, percentage: Math.random() * 20 + 10, averageGift: Math.random() * 500 + 200 },
        { channel: 'Email' as const, percentage: Math.random() * 25 + 15, averageGift: Math.random() * 150 + 75 }
      ].map(channel => ({ 
        ...channel, 
        percentage: Number(channel.percentage.toFixed(1)),
        averageGift: Number(channel.averageGift.toFixed(0))
      }))
    };

    // Normalize percentages to sum to 100
    const totalPercentage = patterns.channelPreferences.reduce((sum, ch) => sum + ch.percentage, 0);
    patterns.channelPreferences = patterns.channelPreferences.map(ch => ({
      ...ch,
      percentage: Number((ch.percentage / totalPercentage * 100).toFixed(1))
    }));

    return patterns;
  }

  private getSegmentFrequency(segment: DonorSegment): 'one-time' | 'monthly' | 'quarterly' | 'annually' | 'irregular' {
    if (segment.name.includes('Monthly')) return 'monthly';
    if (segment.name.includes('Annual')) return 'annually';
    if (segment.name.includes('Board') || segment.name.includes('Major')) return 'quarterly';
    if (segment.name.includes('Lapsed') || segment.name.includes('First-Time')) return 'one-time';
    return 'irregular';
  }

  private generateCampaignPerformance(segment: DonorSegment) {
    const campaigns = [
      'Back to School Drive', 'Emergency Food Relief', 'Youth Sports Program', 
      'Holiday Giving', 'Annual Fund', 'Capital Campaign'
    ];

    return campaigns.slice(0, Math.floor(Math.random() * 4) + 2).map((campaign, index) => ({
      campaignId: `campaign-${index + 1}`,
      campaignName: campaign,
      participationRate: Math.random() * 30 + 10,
      totalRaised: Math.random() * 10000 + 5000,
      averageGift: Math.random() * 300 + 100,
      responseRate: Math.random() * 25 + 5
    })).map(perf => ({
      ...perf,
      participationRate: Number(perf.participationRate.toFixed(1)),
      totalRaised: Number(perf.totalRaised.toFixed(0)),
      averageGift: Number(perf.averageGift.toFixed(0)),
      responseRate: Number(perf.responseRate.toFixed(1))
    }));
  }

  // Public API methods
  async getAllSegments(): Promise<DonorSegment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.segments];
  }

  async getSegmentAnalytics(filters?: SegmentFilter): Promise<DonorSegmentAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 600));

    let filteredData = [...this.segmentData];

    // Apply filters
    if (filters?.segmentIds?.length) {
      filteredData = filteredData.filter(data => filters.segmentIds!.includes(data.segmentId));
    }

    const totalDonors = filteredData.reduce((sum, data) => sum + data.donorCount, 0);
    const totalContributed = filteredData.reduce((sum, data) => sum + data.totalContributed, 0);

    return {
      segmentData: filteredData,
      totalDonors,
      totalContributed,
      crossSegmentInsights: {
        topPerformingSegments: this.generateTopPerformingSegments(filteredData),
        segmentMigration: this.generateSegmentMigration(),
        opportunityAnalysis: this.generateOpportunityAnalysis(filteredData)
      },
      benchmarkData: {
        industryAverages: this.generateIndustryBenchmarks()
      }
    };
  }

  private generateTopPerformingSegments(data: DonorSegmentData[]) {
    const metrics: Array<{ metric: any; getValue: (d: DonorSegmentData) => number }> = [
      { metric: 'total_revenue', getValue: (d) => d.totalContributed },
      { metric: 'donor_count', getValue: (d) => d.donorCount },
      { metric: 'retention_rate', getValue: (d) => d.retentionRate },
      { metric: 'growth_rate', getValue: (d) => d.growthRate }
    ];

    return metrics.flatMap(({ metric, getValue }) => 
      [...data]
        .sort((a, b) => getValue(b) - getValue(a))
        .slice(0, 3)
        .map((d, index) => ({
          segmentId: d.segmentId,
          segmentName: d.segmentName,
          metric,
          value: getValue(d),
          rank: index + 1
        }))
    );
  }

  private generateSegmentMigration() {
    return [
      { fromSegmentId: 'segment-9', toSegmentId: 'segment-4', donorCount: 23, timeframe: 'Last 6 months' },
      { fromSegmentId: 'segment-8', toSegmentId: 'segment-3', donorCount: 15, timeframe: 'Last 6 months' },
      { fromSegmentId: 'segment-4', toSegmentId: 'segment-2', donorCount: 8, timeframe: 'Last 6 months' }
    ];
  }

  private generateOpportunityAnalysis(data: DonorSegmentData[]) {
    const opportunities: { segmentId: string; opportunity: "upgrade_potential" | "retention_risk"; description: string; estimatedImpact: number; actionRecommendation: string; }[] = [];

    // Find upgrade opportunities
    const lowValueHighEngagement = data.filter(d => d.averageGiftSize < 200 && d.engagementScore > 70);
    lowValueHighEngagement.forEach(segment => {
      opportunities.push({
        segmentId: segment.segmentId,
        opportunity: 'upgrade_potential' as const,
        description: `High engagement (${segment.engagementScore}%) with low average gift suggests upgrade potential`,
        estimatedImpact: segment.donorCount * 50,
        actionRecommendation: 'Target with mid-level gift asks and stewardship program'
      });
    });

    // Find retention risks
    const lowRetention = data.filter(d => d.retentionRate < 60 && d.retentionRate > 0);
    lowRetention.forEach(segment => {
      opportunities.push({
        segmentId: segment.segmentId,
        opportunity: 'retention_risk' as const,
        description: `Low retention rate (${segment.retentionRate}%) indicates need for better stewardship`,
        estimatedImpact: segment.donorCount * 0.3 * segment.averageGiftSize,
        actionRecommendation: 'Implement retention-focused communication strategy'
      });
    });

    return opportunities.slice(0, 5);
  }

  private generateIndustryBenchmarks() {
    return [
      { segmentType: 'Monthly Donors', averageRetentionRate: 85, averageGiftSize: 75, typicalGrowthRate: 12 },
      { segmentType: 'Annual Donors', averageRetentionRate: 68, averageGiftSize: 285, typicalGrowthRate: 8 },
      { segmentType: 'Major Gift Prospects', averageRetentionRate: 82, averageGiftSize: 1250, typicalGrowthRate: 15 },
      { segmentType: 'First-Time Donors', averageRetentionRate: 43, averageGiftSize: 125, typicalGrowthRate: 25 },
      { segmentType: 'Lapsed Donors', averageRetentionRate: 18, averageGiftSize: 165, typicalGrowthRate: -5 }
    ];
  }

  async createSegment(segmentData: Omit<DonorSegment, 'id' | 'createdAt' | 'updatedAt'>): Promise<DonorSegment> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const newSegment: DonorSegment = {
      ...segmentData,
      id: `custom-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.segments.push(newSegment);
    
    // Generate mock data for the new segment
    const mockData = {
      segmentId: newSegment.id,
      segmentName: newSegment.name,
      ...this.generateSegmentMetrics(newSegment),
      giftPatterns: this.generateGiftPatterns(newSegment),
      campaignPerformance: this.generateCampaignPerformance(newSegment)
    };
    
    this.segmentData.push(mockData);

    return newSegment;
  }

  async updateSegment(id: string, updates: Partial<DonorSegment>): Promise<DonorSegment> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const index = this.segments.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Segment not found');

    this.segments[index] = {
      ...this.segments[index],
      ...updates,
      updatedAt: new Date()
    };

    return this.segments[index];
  }

  async deleteSegment(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const index = this.segments.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Segment not found');

    if (this.segments[index].isDefault) {
      throw new Error('Cannot delete default segments');
    }

    this.segments.splice(index, 1);
    this.segmentData = this.segmentData.filter(data => data.segmentId !== id);
  }

  async compareSegments(segmentId1: string, segmentId2: string): Promise<SegmentComparison> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const segment1Data = this.segmentData.find(d => d.segmentId === segmentId1);
    const segment2Data = this.segmentData.find(d => d.segmentId === segmentId2);

    if (!segment1Data || !segment2Data) {
      throw new Error('One or both segments not found');
    }

    const calculateDifference = (base: number, compare: number) => ({
      base,
      compare,
      difference: compare - base,
      percentageDifference: base > 0 ? ((compare - base) / base) * 100 : 0
    });

    return {
      baseSegmentId: segmentId1,
      compareSegmentId: segmentId2,
      metrics: {
        donorCount: calculateDifference(segment1Data.donorCount, segment2Data.donorCount),
        averageGift: calculateDifference(segment1Data.averageGiftSize, segment2Data.averageGiftSize),
        retentionRate: calculateDifference(segment1Data.retentionRate, segment2Data.retentionRate),
        engagementScore: calculateDifference(segment1Data.engagementScore, segment2Data.engagementScore)
      },
      insights: this.generateComparisonInsights(segment1Data, segment2Data),
      recommendations: this.generateComparisonRecommendations(segment1Data, segment2Data)
    };
  }

  private generateComparisonInsights(seg1: DonorSegmentData, seg2: DonorSegmentData): string[] {
    const insights = [];
    
    if (seg2.averageGiftSize > seg1.averageGiftSize * 1.2) {
      insights.push(`${seg2.segmentName} has significantly higher average gifts (+${((seg2.averageGiftSize / seg1.averageGiftSize - 1) * 100).toFixed(1)}%)`);
    }
    
    if (seg2.retentionRate > seg1.retentionRate + 10) {
      insights.push(`${seg2.segmentName} shows much better donor retention (+${(seg2.retentionRate - seg1.retentionRate).toFixed(1)} percentage points)`);
    }
    
    if (seg2.engagementScore > seg1.engagementScore + 15) {
      insights.push(`${seg2.segmentName} demonstrates higher engagement levels (+${(seg2.engagementScore - seg1.engagementScore).toFixed(1)} points)`);
    }

    return insights.length > 0 ? insights : ['Both segments show similar performance patterns'];
  }

  private generateComparisonRecommendations(seg1: DonorSegmentData, seg2: DonorSegmentData): string[] {
    const recommendations = [];
    
    if (seg2.averageGiftSize > seg1.averageGiftSize * 1.2) {
      recommendations.push(`Apply successful strategies from ${seg2.segmentName} to improve ${seg1.segmentName} gift sizes`);
    }
    
    if (seg2.retentionRate > seg1.retentionRate + 10) {
      recommendations.push(`Study ${seg2.segmentName} retention tactics for ${seg1.segmentName} improvement`);
    }
    
    recommendations.push('Consider targeted campaigns that leverage the strengths of each segment');
    
    return recommendations;
  }

  async getSegmentTrends(segmentId: string, months: number = 12): Promise<SegmentMetricsTrend> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const timeSeriesData = [];
    const now = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      timeSeriesData.push({
        date: date.toISOString().split('T')[0],
        donorCount: Math.floor(Math.random() * 50) + 100,
        totalContributed: Math.floor(Math.random() * 5000) + 10000,
        averageGift: Math.floor(Math.random() * 100) + 150,
        retentionRate: Math.random() * 20 + 70,
        newDonors: Math.floor(Math.random() * 20) + 5,
        lapsedDonors: Math.floor(Math.random() * 15) + 2
      });
    }

    return {
      segmentId,
      timeSeriesData
    };
  }
}

export const donorSegmentService = new DonorSegmentService();
export default donorSegmentService;