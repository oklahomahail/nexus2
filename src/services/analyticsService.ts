// src/services/analyticsService.ts

import {
  AnalyticsFilters,
  CampaignAnalytics,
  DonorInsights,
  OrganizationAnalytics,
} from '../models/analytics';

class AnalyticsService {
  // --------------------------
  // Helpers
  // --------------------------

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

  // --------------------------
  // Campaign Analytics
  // --------------------------

  async getCampaignAnalytics(campaignId: string, filters?: AnalyticsFilters): Promise<CampaignAnalytics> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
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
  }

  // --------------------------
  // Donor Insights
  // --------------------------

  async getDonorInsights(filters?: AnalyticsFilters): Promise<DonorInsights> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    return {
      topDonors: [
        { id: 'd1', name: 'Alice M.', totalGiven: 12000 },
        { id: 'd2', name: 'Bob H.', totalGiven: 11000 },
        { id: 'd3', name: 'Samantha P.', totalGiven: 9800 }
      ],
      donorRetention: {
        current: 67,
        previous: 54,
        change: 13
      },
      acquisition: {
        newDonors: 87,
        returningDonors: 40
      }
    };
  }

  // --------------------------
  // Organization Analytics
  // --------------------------

  async getOrganizationAnalytics(filters?: AnalyticsFilters): Promise<OrganizationAnalytics> {
    await new Promise((resolve) => setTimeout(resolve, 700));

    return {
      currentPeriod: {
        startDate: '2024-01-01',
        endDate: '2024-08-31',
        totalRaised: 485600,
        donorCount: 1247,
        campaignCount: 12
      },
      previousPeriod: {
        startDate: '2023-01-01',
        endDate: '2023-08-31',
        totalRaised: 398200,
        donorCount: 1089,
        campaignCount: 10
      },
      growthMetrics: {
        raisedChange: 21.9,
        donorsChange: 14.5,
        campaignsChange: 20.0
      },
      performanceComparisons: {
        current: 485600,
        previous: 398200,
        label: "Fundraising Performance"
      },
      topPerformingCampaigns: [
        { id: "1", name: "Youth Sports Program", raised: 35000, goal: 35000 },
        { id: "2", name: "Back to School Drive", raised: 32500, goal: 50000 },
        { id: "3", name: "Emergency Food Relief", raised: 18750, goal: 25000 }
      ]
    };
  }

  // --------------------------
  // CSV Export
  // --------------------------

  async exportAnalyticsData(
    type: 'campaign' | 'donor' | 'organization',
    filters?: AnalyticsFilters
  ): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    return `data:text/csv;charset=utf-8,${encodeURIComponent(
      'Campaign,Total Raised,Donor Count,Goal Achievement\nYouth Sports Program,35000,156,100%\nBack to School Drive,32500,127,65%\nEmergency Food Relief,18750,89,75%'
    )}`;
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;