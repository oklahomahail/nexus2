import { Campaign, CampaignCreateRequest, CampaignUpdateRequest, CampaignFilters, CampaignStats } from '../models/campaign';
import { apiGet } from './apiClient';

// Mock data for development - replace with actual API calls
const mockCampaigns: Campaign[] = [
  {
    id: '1',
    name: 'Back to School Drive',
    description: 'Providing school supplies and resources for underprivileged children',
    goal: 50000,
    raised: 32500,
    startDate: '2024-07-01',
    endDate: '2024-08-31',
    status: 'Active',
    category: 'Education',
    targetAudience: 'Parents, teachers, local businesses',
    donorCount: 127,
    averageGift: 256,
    lastUpdated: new Date('2024-08-01'),
    createdAt: new Date('2024-06-15'),
    createdBy: 'Sarah Johnson',
    tags: ['education', 'children', 'community'],
    notes: 'Focus on social media outreach in August',
    emailsSent: 3200,
    clickThroughRate: 12.5,
    conversionRate: 8.2
  },
  {
    id: '2',
    name: 'Emergency Food Relief',
    description: 'Urgent funding needed for local food bank operations',
    goal: 25000,
    raised: 18750,
    startDate: '2024-06-15',
    endDate: '2024-09-15',
    status: 'Active',
    category: 'Emergency',
    targetAudience: 'Community members, local organizations',
    donorCount: 89,
    averageGift: 210,
    lastUpdated: new Date('2024-07-28'),
    createdAt: new Date('2024-06-01'),
    createdBy: 'Mike Chen',
    tags: ['emergency', 'food', 'community'],
    notes: 'Partner with local grocery stores',
    emailsSent: 1800,
    clickThroughRate: 15.2,
    conversionRate: 11.1
  },
  {
    id: '3',
    name: 'Youth Sports Program',
    description: 'Funding for equipment and facilities for youth athletics',
    goal: 35000,
    raised: 35000,
    startDate: '2024-03-01',
    endDate: '2024-05-31',
    status: 'Completed',
    category: 'Community',
    targetAudience: 'Parents, sports enthusiasts, local businesses',
    donorCount: 156,
    averageGift: 224,
    lastUpdated: new Date('2024-05-31'),
    createdAt: new Date('2024-02-15'),
    createdBy: 'Lisa Rodriguez',
    tags: ['sports', 'youth', 'health'],
    notes: 'Successfully reached goal 2 weeks early',
    emailsSent: 4500,
    clickThroughRate: 9.8,
    conversionRate: 7.3
  }
];

class CampaignService {
  private campaigns: Campaign[] = [...mockCampaigns];

  async getAllCampaigns(filters?: CampaignFilters): Promise<Campaign[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredCampaigns = [...this.campaigns];

    if (filters) {
      // Filter by status
      if (filters.status && filters.status.length > 0) {
        filteredCampaigns = filteredCampaigns.filter(c => 
          filters.status!.includes(c.status)
        );
      }

      // Filter by category
      if (filters.category && filters.category.length > 0) {
        filteredCampaigns = filteredCampaigns.filter(c => 
          filters.category!.includes(c.category)
        );
      }

      // Filter by search term
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredCampaigns = filteredCampaigns.filter(c => 
          c.name.toLowerCase().includes(searchTerm) ||
          c.description?.toLowerCase().includes(searchTerm) ||
          c.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      // Filter by date range
      if (filters.dateRange) {
        filteredCampaigns = filteredCampaigns.filter(c => {
          const campaignStart = new Date(c.startDate);
          const campaignEnd = new Date(c.endDate);
          const filterStart = new Date(filters.dateRange!.startDate);
          const filterEnd = new Date(filters.dateRange!.endDate);
          
          return campaignStart <= filterEnd && campaignEnd >= filterStart;
        });
      }

      // Filter by tags
      if (filters.tags && filters.tags.length > 0) {
        filteredCampaigns = filteredCampaigns.filter(c => 
          c.tags?.some(tag => filters.tags!.includes(tag))
        );
      }
    }

    // Sort by last updated (most recent first)
    return filteredCampaigns.sort((a, b) => 
      new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
    );
  }

  async getCampaignById(id: string): Promise<Campaign | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.campaigns.find(c => c.id === id) || null;
  }

  async createCampaign(data: CampaignCreateRequest): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newCampaign: Campaign = {
      id: Date.now().toString(),
      ...data,
      raised: 0,
      donorCount: 0,
      averageGift: 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
      status: data.status || 'Planned',
      emailsSent: 0,
      clickThroughRate: 0,
      conversionRate: 0
    };

    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async updateCampaign(data: CampaignUpdateRequest): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = this.campaigns.findIndex(c => c.id === data.id);
    if (index === -1) {
      throw new Error('Campaign not found');
    }

    const updatedCampaign: Campaign = {
      ...this.campaigns[index],
      ...data,
      lastUpdated: new Date()
    };

    this.campaigns[index] = updatedCampaign;
    return updatedCampaign;
  }

  async deleteCampaign(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const index = this.campaigns.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Campaign not found');
    }

    this.campaigns.splice(index, 1);
  }

  async duplicateCampaign(id: string): Promise<Campaign> {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const original = this.campaigns.find(c => c.id === id);
    if (!original) {
      throw new Error('Campaign not found');
    }

    const duplicated: Campaign = {
      ...original,
      id: Date.now().toString(),
      name: `${original.name} (Copy)`,
      raised: 0,
      donorCount: 0,
      averageGift: 0,
      status: 'Planned',
      createdAt: new Date(),
      lastUpdated: new Date(),
      emailsSent: 0,
      clickThroughRate: 0,
      conversionRate: 0
    };

    this.campaigns.push(duplicated);
    return duplicated;
  }

  async getCampaignStats(): Promise<CampaignStats> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const totalCampaigns = this.campaigns.length;
    const activeCampaigns = this.campaigns.filter(c => c.status === 'Active').length;
    const completedCampaigns = this.campaigns.filter(c => c.status === 'Completed').length;
    const totalRaised = this.campaigns.reduce((sum, c) => sum + c.raised, 0);
    const averageGoal = totalCampaigns > 0 ? 
      this.campaigns.reduce((sum, c) => sum + c.goal, 0) / totalCampaigns : 0;
    const successfulCampaigns = this.campaigns.filter(c => 
      c.status === 'Completed' && c.raised >= c.goal
    ).length;
    const successRate = completedCampaigns > 0 ? 
      (successfulCampaigns / completedCampaigns) * 100 : 0;
    const totalDonors = this.campaigns.reduce((sum, c) => sum + c.donorCount, 0);

    return {
      totalCampaigns,
      activeCampaigns,
      completedCampaigns,
      totalRaised,
      averageGoal,
      successRate,
      totalDonors
    };
  }

  async getAvailableTags(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const allTags = this.campaigns.flatMap(c => c.tags || []);
    return [...new Set(allTags)].sort();
  }
}

export const campaignService = new CampaignService();
export default campaignService;
