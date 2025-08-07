// src/panels/DashboardPanel.tsx - Updated with modern dark theme
import React, { useState } from 'react';
import { CampaignModal } from '../components/CampaignModal';
import { CampaignCreateRequest, CampaignUpdateRequest } from '../models/campaign';
import { Target, TrendingUp, Bot, Edit } from 'lucide-react';

interface DashboardPanelProps {
  totalDonors?: number;
  totalRevenue?: number;
  activeCampaigns?: number;
}

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
    <h3 className="text-slate-400 text-sm font-medium mb-2">{title}</h3>
    <p className="text-white text-2xl font-bold mb-1">{value}</p>
    {subtext && <p className="text-slate-500 text-xs">{subtext}</p>}
  </div>
);

const QuickActionCard = ({ title, description, icon: Icon, onClick }: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
}) => (
  <div 
    onClick={onClick}
    className="group bg-slate-800/30 border border-slate-700/30 rounded-xl p-6 hover:bg-slate-700/40 transition-all duration-200 cursor-pointer"
  >
    <div className="flex items-start space-x-4">
      <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
        <Icon className="w-5 h-5 text-blue-400" />
      </div>
      <div className="flex-1">
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  </div>
);

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  totalDonors = 128,
  totalRevenue = 0,
  activeCampaigns = 0,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSaveCampaign = async (data: CampaignCreateRequest | CampaignUpdateRequest): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Saved campaign:', data);
      setShowModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save campaign');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Error Display */}
      {error && (
        <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="text-red-400">⚠️</div>
            <div>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div>
        <h2 className="text-white text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Active Campaigns" 
            value={String(activeCampaigns)} 
            subtext="Current active campaigns" 
          />
          <StatCard 
            title="Donors Engaged" 
            value={String(totalDonors)} 
            subtext="Last 30 days" 
          />
          <StatCard 
            title="Funds Raised" 
            value={`$${totalRevenue.toLocaleString()}`} 
            subtext="Year to date" 
          />
          <StatCard 
            title="Emails Sent" 
            value="8,290" 
            subtext="All campaigns" 
          />
        </div>
      </div>

      {/* Current Project Card */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-white text-xl font-bold mb-2">Campaign Dashboard</h3>
            <p className="text-slate-400">Monitor campaign performance and progress</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="text-blue-400 hover:text-blue-300 transition-colors flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Donor Growth Over Time</h3>
        <div className="h-64 flex items-center justify-center">
          {/* Simulated Chart */}
          <div className="w-full h-full bg-slate-900/50 rounded-lg flex items-end justify-around p-4 space-x-2">
            {[140, 165, 180, 175, 160, 185, 200].map((height, index) => (
              <div
                key={index}
                className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm flex-1 transition-all duration-300 hover:from-blue-500 hover:to-blue-300"
                style={{ height: `${(height / 220) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard 
            icon={Target}
            title="Create Campaign"
            description="Start a new fundraising campaign"
            onClick={() => setShowModal(true)}
          />
          <QuickActionCard 
            icon={TrendingUp}
            title="View Analytics"
            description="Check campaign performance"
          />
          <QuickActionCard 
            icon={Bot}
            title="AI Assistant"
            description="Generate content with AI"
          />
        </div>
      </div>

      {/* Upcoming Milestones */}
      <div>
        <h3 className="text-white text-lg font-semibold mb-4">Upcoming Campaign Milestones</h3>
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-6">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-slate-300">Girlstart EOY draft due – Aug 12</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-slate-300">BBHH NTXGD Match Confirmed – Aug 18</span>
            </div>
            <div className="flex items-center space-x-3 text-sm">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-slate-300">CASA Campaign Launch – Sept 1</span>
            </div>
          </div>
        </div>
      </div>

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