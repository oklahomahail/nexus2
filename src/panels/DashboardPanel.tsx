// src/panels/DashboardPanel.tsx - Fully modernized with unified design system
import React, { useState } from 'react';
import { CampaignModal } from '../components/CampaignModal';
import { CampaignCreateRequest, CampaignUpdateRequest } from '../models/campaign';
import { KPIWidget } from '../components/AnalyticsWidgets';
import LoadingSpinner from '../components/LoadingSpinner';
import { Target, TrendingUp, Bot, Edit, Users, DollarSign, Mail, Calendar, Plus, BarChart3 } from 'lucide-react';

interface DashboardPanelProps {
  totalDonors?: number;
  totalRevenue?: number;
  activeCampaigns?: number;
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  color?: 'blue' | 'green' | 'purple' | 'indigo';
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick,
  color = 'blue'
}) => {
  const colorClasses = {
    blue: 'border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/40',
    green: 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10 hover:border-green-500/40',
    purple: 'border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/40',
    indigo: 'border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/40'
  };

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-green-400', 
    purple: 'text-purple-400',
    indigo: 'text-indigo-400'
  };

  return (
    <div 
      onClick={onClick}
      className={`
        group card-base p-6 cursor-pointer transition-all duration-300 border
        ${colorClasses[color]}
      `}
    >
      <div className="flex items-start space-x-4">
        <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 group-hover:scale-105 transition-transform duration-200">
          <Icon className={`w-6 h-6 ${iconColors[color]}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-300 transition-colors">
            {title}
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

const MilestoneItem: React.FC<{
  title: string;
  date: string;
  status: 'upcoming' | 'progress' | 'completed';
}> = ({ title, date, status }) => {
  const statusColors = {
    upcoming: { dot: 'bg-yellow-400', text: 'text-yellow-400' },
    progress: { dot: 'bg-blue-400', text: 'text-blue-400' },
    completed: { dot: 'bg-green-400', text: 'text-green-400' }
  };

  return (
    <div className="flex items-start space-x-3 group">
      <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${statusColors[status].dot}`} />
      <div className="flex-1 min-w-0">
        <p className="text-slate-300 text-sm font-medium group-hover:text-white transition-colors">
          {title}
        </p>
        <p className={`text-xs mt-0.5 ${statusColors[status].text}`}>
          {date}
        </p>
      </div>
    </div>
  );
};

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  totalDonors = 128,
  totalRevenue = 45750,
  activeCampaigns = 3,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveCampaign = async (data: CampaignCreateRequest | CampaignUpdateRequest): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      console.log('Saved campaign:', data);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Sample chart data for visualization
  const chartData = [
    { month: 'Mar', donors: 140 },
    { month: 'Apr', donors: 165 },
    { month: 'May', donors: 180 },
    { month: 'Jun', donors: 175 },
    { month: 'Jul', donors: 160 },
    { month: 'Aug', donors: 185 },
    { month: 'Sep', donors: 200 }
  ];

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="card-base p-4 border-red-500/30 bg-red-500/5 animate-fade-in">
          <div className="flex items-start space-x-3">
            <div className="w-5 h-5 text-red-400 mt-0.5">⚠️</div>
            <div className="flex-1">
              <p className="text-red-300 text-sm font-medium">Campaign Error</p>
              <p className="text-red-400/80 text-sm mt-1">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-300 hover:text-red-200 text-sm mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="card-base p-6 border-l-4 border-l-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-white text-2xl font-bold mb-2">
              Welcome back! 👋
            </h2>
            <p className="text-slate-400 text-lg">
              Here's what's happening with your campaigns today
            </p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="button-primary flex items-center space-x-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl font-semibold">Performance Overview</h3>
          <button className="text-slate-400 hover:text-white text-sm flex items-center gap-2 transition-colors">
            <BarChart3 className="w-4 h-4" />
            View Detailed Analytics
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPIWidget 
            title="Active Campaigns" 
            value={activeCampaigns}
            trend="neutral"
            icon={<Target className="w-5 h-5" />}
          />
          <KPIWidget 
            title="Total Donors" 
            value={totalDonors}
            icon={<Users className="w-5 h-5" />}
          />
          <KPIWidget 
            title="Funds Raised" 
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />}
          />
          <KPIWidget 
            title="Emails Sent" 
            value="8,290"
            icon={<Mail className="w-5 h-5" />}
          />
        </div>
      </div>

      {/* Visual Chart Section */}
      <div className="card-base p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-white text-xl font-semibold mb-2">Donor Growth Trend</h3>
            <p className="text-slate-400">Monthly donor acquisition over the last 7 months</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-green-400">+15.8%</p>
            <p className="text-sm text-slate-400">Growth rate</p>
          </div>
        </div>
        
        {/* Simple Chart Visualization */}
        <div className="h-64 flex items-end justify-around p-4 space-x-2 bg-slate-900/50 rounded-xl border border-slate-700/30">
          {chartData.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center space-y-2">
              <div
                className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm w-full transition-all duration-500 hover:from-blue-500 hover:to-blue-300 cursor-pointer relative group"
                style={{ height: `${(item.donors / 220) * 100}%` }}
              >
                {/* Tooltip */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {item.donors} donors
                </div>
              </div>
              <span className="text-xs text-slate-400 font-medium">{item.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-white text-xl font-semibold mb-6">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard 
            icon={Target}
            title="Create Campaign"
            description="Launch a new fundraising campaign with AI-powered content generation"
            onClick={() => setShowModal(true)}
            color="blue"
          />
          <QuickActionCard 
            icon={TrendingUp}
            title="View Analytics"
            description="Deep dive into campaign performance, donor insights, and ROI metrics"
            color="green"
          />
          <QuickActionCard 
            icon={Bot}
            title="AI Assistant"
            description="Generate compelling campaign content, emails, and social media posts"
            color="purple"
          />
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div>
        <h3 className="text-white text-xl font-semibold mb-6">Upcoming Milestones</h3>
        <div className="card-base p-6">
          <div className="space-y-4">
            <MilestoneItem
              title="Girlstart EOY draft due"
              date="Aug 12, 2024"
              status="upcoming"
            />
            <MilestoneItem
              title="BBHH NTXGD Match Confirmed"
              date="Aug 18, 2024"
              status="progress"
            />
            <MilestoneItem
              title="CASA Campaign Launch"
              date="Sept 1, 2024"
              status="upcoming"
            />
            <MilestoneItem
              title="Q3 Reporting Complete"
              date="July 30, 2024"
              status="completed"
            />
          </div>
          
          <div className="mt-6 pt-4 border-t border-slate-700/50">
            <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-2 transition-colors">
              <Calendar className="w-4 h-4" />
              View all milestones
            </button>
          </div>
        </div>
      </div>

      {/* Campaign Modal */}
      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSaveCampaign}
        mode="create"
      />
    </div>
  );
};

export default DashboardPanel;
