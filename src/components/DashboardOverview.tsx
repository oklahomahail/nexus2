import React from 'react';
import { Panel, AnalyticsPanel, AlertPanel } from '@/components/ui-kit/Panel';
import { Card, MetricCard, CampaignQuickCard } from '@/components/ui-kit/Card';
import { useCampaigns, useAnalytics } from '../context/AppContext';

const DashboardOverview: React.FC = () => {
  const { stats: campaignStats } = useCampaigns();
  const { organization: orgAnalytics } = useAnalytics();

  const recentCampaigns = [
    {
      name: "Youth Sports Program",
      status: 'Active' as const,
      raised: 87500,
      goal: 75000,
      daysLeft: 12,
      category: 'Community'
    },
    {
      name: "Back to School Drive", 
      status: 'Active' as const,
      raised: 15200,
      goal: 25000,
      daysLeft: 28,
      category: 'Education'
    },
    {
      name: "Emergency Food Relief",
      status: 'Completed' as const,
      raised: 50000,
      goal: 45000,
      daysLeft: 0,
      category: 'Emergency'
    }
  ];

  return (
    <div className="space-y-6">
      <Panel 
        title="Welcome back, Sarah!"
        subtitle="Here's what's happening with your campaigns today"
        variant="brand"
        headerActions={
          <button className="px-4 py-2 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors text-sm font-medium">
            View Reports
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white/90">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{campaignStats.active}</p>
            <p className="text-sm">Active Campaigns</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">${campaignStats.totalRaised.toLocaleString()}</p>
            <p className="text-sm">Raised This Month</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-white">
              {orgAnalytics?.overallMetrics.totalDonors.toLocaleString() || '0'}
            </p>
            <p className="text-sm">Total Supporters</p>
          </div>
        </div>
      </Panel>

      <AnalyticsPanel 
        title="Key Performance Indicators"
        headerActions={
          <select className="text-sm border border-brand-secondary/20 rounded-lg px-3 py-1 bg-white">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Campaigns"
            value={campaignStats.total}
            change={15}
            icon="🎯"
            iconColor="bg-brand-secondary/10 text-brand-secondary"
          />
          <MetricCard
            title="Active Campaigns"
            value={campaignStats.active}
            change={8}
            icon="🚀"
            iconColor="bg-green-100 text-green-600"
          />
          <MetricCard
            title="Total Raised"
            value={`$${campaignStats.totalRaised.toLocaleString()}`}
            change={23}
            icon="💰"
            iconColor="bg-yellow-100 text-yellow-600"
          />
          <MetricCard
            title="Avg. Gift Size"
            value={orgAnalytics ? `$${Math.round(orgAnalytics.overallMetrics.totalFundsRaised / orgAnalytics.overallMetrics.totalDonors)}` : '$0'}
            change={-3}
            icon="🎁"
            iconColor="bg-purple-100 text-purple-600"
          />
        </div>
      </AnalyticsPanel>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Panel 
            title="Campaign Status"
            subtitle="Track your most important campaigns"
            headerActions={
              <button className="text-sm text-brand-secondary hover:text-brand-primary font-medium">
                View All →
              </button>
            }
          >
            <div className="grid gap-4">
              {recentCampaigns.map((campaign, index) => (
                <CampaignQuickCard
                  key={index}
                  campaign={campaign}
                  onClick={() => console.log('Navigate to campaign:', campaign.name)}
                />
              ))}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          {recentCampaigns.some(c => c.raised >= c.goal) && (
            <AlertPanel alertType="success" title="🎉 Goal Achieved!">
              <p className="text-sm text-green-800">
                Youth Sports Program exceeded its goal by 17%! 
                <button className="ml-2 text-green-600 hover:text-green-800 font-medium">
                  Send thank you →
                </button>
              </p>
            </AlertPanel>
          )}

          <AlertPanel alertType="warning" title="⚠️ Campaign Needs Attention">
            <p className="text-sm text-yellow-800 mb-2">
              Back to School Drive is 39% behind target with 28 days left.
            </p>
            <button className="text-xs bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-lg text-yellow-800 font-medium">
              Review Strategy
            </button>
          </AlertPanel>

          <Panel title="Recent Activity">
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-green-600 text-sm">✅</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-800">New Major Donor</p>
                  <p className="text-xs text-green-700">$2,500 donation received for Emergency Food Relief</p>
                  <p className="text-xs text-green-600 mt-1">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-sm">📧</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-800">Email Campaign Sent</p>
                  <p className="text-xs text-blue-700">Back to School update sent to 1,200 subscribers</p>
                  <p className="text-xs text-blue-600 mt-1">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-xl">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-purple-600 text-sm">🎯</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-purple-800">Campaign Milestone</p>
                  <p className="text-xs text-purple-700">Youth Sports reached 75% of goal</p>
                  <p className="text-xs text-purple-600 mt-1">1 day ago</p>
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center cursor-pointer hover:scale-105" onClick={() => console.log('Create campaign')}>
            <div className="w-12 h-12 bg-brand-secondary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-brand-secondary">🎯</span>
            </div>
            <p className="font-semibold text-brand-dark">New Campaign</p>
            <p className="text-xs text-brand-primary/70 mt-1">Start fundraising</p>
          </Card>
          <Card className="text-center cursor-pointer hover:scale-105" onClick={() => console.log('Send email')}>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-green-600">📧</span>
            </div>
            <p className="font-semibold text-brand-dark">Send Update</p>
            <p className="text-xs text-brand-primary/70 mt-1">Email supporters</p>
          </Card>
          <Card className="text-center cursor-pointer hover:scale-105" onClick={() => console.log('View analytics')}>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-yellow-600">📊</span>
            </div>
            <p className="font-semibold text-brand-dark">Analytics</p>
            <p className="text-xs text-brand-primary/70 mt-1">View insights</p>
          </Card>
          <Card className="text-center cursor-pointer hover:scale-105" onClick={() => console.log('Donor management')}>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl text-purple-600">👥</span>
            </div>
            <p className="font-semibold text-brand-dark">Donors</p>
            <p className="text-xs text-brand-primary/70 mt-1">Manage relationships</p>
          </Card>
        </div>
      </Panel>
    </div>
  );
};

export default DashboardOverview;
