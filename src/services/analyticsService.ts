import { CampaignAnalytics, DonorInsights, OrganizationAnalytics, AnalyticsFilters } from '../models/analytics';

// Mock data generator for realistic analytics
class AnalyticsService {
  private generateTimeSeriesData(startDate: string, endDate: string, totalRaised: number, totalDonors: number) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const data = [];
    let cumulativeRaised = 0;
    let cumulativeDonors = 0;
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      // Simulate realistic daily patterns
      const progressPercentage = i / days;
      const dailyRaised = Math.round((totalRaised * 0.8 * Math.random() + totalRaised * 0.2) / days);
      const dailyDonors = Math.round((totalDonors * 0.8 * Math.random() + totalDonors * 0.2) / days);
      
      cumulativeRaised += dailyRaised;
      cumulativeDonors += dailyDonors;
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        dailyRaised,
        dailyDonors,
        cumulativeRaised: Math.min(cumulativeRaised, totalRaised),
        cumulativeDonors: Math.min(cumulativeDonors, totalDonors)
      });
    }
    
    return data;
  }

  async getCampaignAnalytics(campaignId: string, filters?: AnalyticsFilters): Promise<CampaignAnalytics> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Mock data - replace with actual API call
    const mockData: CampaignAnalytics = {
      campaignId,
      campaignName: 'Back to School Drive',
      timeframe: {
        startDate: '2024-07-01',
        endDate: '2024-08-31'
      },
      fundraisingMetrics: {
        totalRaised: 32500,
        goalAmount: 50000,
        completionRate: 65,
        donorCount: 127,
        averageGiftSize: 256,
        largestGift: 2500,
        smallestGift: 25,
        repeatDonorRate: 34.5
      },
      outreachMetrics: {
        emailsSent: 3200,
        emailsOpened: 1440,
        emailsClicked: 396,
        openRate: 45,
        clickThroughRate: 12.4,
        unsubscribeRate: 1.2,
        bounceRate: 2.1
      },
      conversionMetrics: {
        websiteVisits: 1850,
        donationPageViews: 485,
        conversionRate: 26.2,
        abandonmentRate: 15.8,
        averageTimeOnPage: 142
      },
      donorSegmentation: {
        firstTimeDonors: 83,
        returningDonors: 44,
        majorGiftDonors: 8,
        midLevelDonors: 23,
        smallGiftDonors: 96
      },
      timeSeriesData: this.generateTimeSeriesData('2024-07-01', '2024-08-31', 32500, 127),
      channelPerformance: [
        {
          channel: 'Email',
          donorCount: 56,
          totalRaised: 14560,
          averageGift: 260,
          conversionRate: 28.5
        },
        {
          channel: 'Social Media',
          donorCount: 34,
          totalRaised: 6800,
          averageGift: 200,
          conversionRate: 18.2
        },
        {
          channel: 'Website',
          donorCount: 28,
          totalRaised: 8540,
          averageGift: 305,
          conversionRate: 31.4
        },
        {
          channel: 'Events',
          donorCount: 9,
          totalRaised: 2600,
          averageGift: 289,
          conversionRate: 45.0
        }
      ]
    };

    return mockData;
  }

  async getDonorInsights(filters?: AnalyticsFilters): Promise<DonorInsights> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const mockData: DonorInsights = {
      totalDonors: 1247,
      newDonorsThisMonth: 89,
      retentionRate: 67.3,
      averageLifetimeValue: 892,
      donorGrowthRate: 12.5,
      topDonorSegments: [
        {
          segment: 'Recurring Monthly Donors',
          count: 234,
          percentage: 18.8,
          totalContributed: 156800
        },
        {
          segment: 'Major Gift Donors',
          count: 45,
          percentage: 3.6,
          totalContributed: 198500
        },
        {
          segment: 'Event Participants',
          count: 178,
          percentage: 14.3,
          totalContributed: 89200
        },
        {
          segment: 'Alumni Network',
          count: 156,
          percentage: 12.5,
          totalContributed: 124800
        }
      ],
      demographicBreakdown: {
        ageGroups: [
          { range: '18-34', count: 298, percentage: 23.9, averageGift: 145 },
          { range: '35-49', count: 387, percentage: 31.0, averageGift: 285 },
          { range: '50-64', count: 342, percentage: 27.4, averageGift: 425 },
          { range: '65+', count: 220, percentage: 17.6, averageGift: 385 }
        ],
        geography: [
          { location: 'Texas', donorCount: 456, totalRaised: 145600 },
          { location: 'California', donorCount: 234, totalRaised: 89200 },
          { location: 'New York', donorCount: 178, totalRaised: 98500 },
          { location: 'Florida', donorCount: 156, totalRaised: 67800 },
          { location: 'Other States', donorCount: 223, totalRaised: 78900 }
        ],
        donorTenure: [
          { category: '0-1 years', count: 423, percentage: 33.9, averageAnnualGiving: 285 },
          { category: '1-3 years', count: 378, percentage: 30.3, averageAnnualGiving: 456 },
          { category: '3-5 years', count: 289, percentage: 23.2, averageAnnualGiving: 678 },
          { category: '5+ years', count: 157, percentage: 12.6, averageAnnualGiving: 892 }
        ]
      },
      givingPatterns: {
        monthlyTrends: [
          { month: 'Jan', donorCount: 89, averageGift: 245, totalRaised: 21800 },
          { month: 'Feb', donorCount: 76, averageGift: 268, totalRaised: 20400 },
          { month: 'Mar', donorCount: 94, averageGift: 255, totalRaised: 24000 },
          { month: 'Apr', donorCount: 87, averageGift: 289, totalRaised: 25100 },
          { month: 'May', donorCount: 112, averageGift: 234, totalRaised: 26200 },
          { month: 'Jun', donorCount: 98, averageGift: 278, totalRaised: 27200 },
          { month: 'Jul', donorCount: 134, averageGift: 289, totalRaised: 38700 },
          { month: 'Aug', donorCount: 127, averageGift: 256, totalRaised: 32500 }
        ],
        seasonalTrends: [
          { season: 'Spring', donorCount: 267, totalRaised: 69300 },
          { season: 'Summer', donorCount: 359, totalRaised: 98400 },
          { season: 'Fall', donorCount: 398, totalRaised: 125600 },
          { season: 'Winter', donorCount: 223, totalRaised: 86700 }
        ],
        recurringVsOneTime: {
          recurring: {
            count: 287,
            percentage: 23.0,
            totalValue: 198500
          },
          oneTime: {
            count: 960,
            percentage: 77.0,
            totalValue: 281500
          }
        }
      }
    };

    return mockData;
  }

  async getOrganizationAnalytics(filters?: AnalyticsFilters): Promise<OrganizationAnalytics> {
    await new Promise(resolve => setTimeout(resolve, 700));
    
    const mockData: OrganizationAnalytics = {
      overallMetrics: {
        totalFundsRaised: 485600,
        totalDonors: 1247,
        totalCampaigns: 12,
        averageCampaignSuccess: 78.5,
        donorRetentionRate: 67.3,
        costPerDollarRaised: 0.15
      },
      performanceComparisons: {
        currentPeriod: {
          startDate: '2024-01-01',
          endDate: '2024-08-31',
          totalRaised: 485600,
          donorCount: 1247,
          campaignCount: 8
        },
        previousPeriod: {
          startDate: '2023-01-01',
          endDate: '2023-08-31',
          totalRaised: 398200,
          donorCount: 1089,
          campaignCount: 7
        },
        growthMetrics: {
          fundsRaisedGrowth: 21.9,
          donorGrowth: 14.5,
          campaignGrowth: 14.3
        }
      },
      topPerformingCampaigns: [
        {
          campaignId: '1',
          name: 'Youth Sports Program',
          totalRaised: 35000,
          goalAchievement: 100,
          donorCount: 156,
          roi: 4.2
        },
        {
          campaignId: '2',
          name: 'Back to School Drive',
          totalRaised: 32500,
          goalAchievement: 65,
          donorCount: 127,
          roi: 3.8
        },
        {
          campaignId: '3',
          name: 'Emergency Food Relief',
          totalRaised: 18750,
          goalAchievement: 75,
          donorCount: 89,
          roi: 3.2
        }
      ],
      benchmarkData: {
        industryAverage: {
          donorRetentionRate: 54.2,
          averageGiftSize: 245,
          emailOpenRate: 35.8,
          conversionRate: 18.5
        },
        organizationPerformance: {
          donorRetentionRate: 67.3,
          averageGiftSize: 285,
          emailOpenRate: 45.0,
          conversionRate: 26.2
        },
        performanceRatings: {
          retentionRating: 'Excellent',
          giftSizeRating: 'Good',
          engagementRating: 'Excellent',
          conversionRating: 'Excellent'
        }
      }
    };

    return mockData;
  }

  async exportAnalyticsData(type: 'campaign' | 'donor' | 'organization', filters?: AnalyticsFilters): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock CSV generation
    const mockCsvUrl = `data:text/csv;charset=utf-8,${encodeURIComponent('Campaign,Total Raised,Donor Count,Goal Achievement\nYouth Sports Program,35000,156,100%\nBack to School Drive,32500,127,65%\nEmergency Food Relief,18750,89,75%')}`;
    
    return mockCsvUrl;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;