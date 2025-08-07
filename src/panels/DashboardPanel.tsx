import React, { useState } from 'react';
import { CampaignModal } from '../components/CampaignModal';
import { CampaignCreateRequest, CampaignUpdateRequest } from '../models/campaign';

interface DashboardPanelProps {
  totalDonors: number;
  totalRevenue: number;
  activeCampaigns: number;
}

interface StatCardProps {
  title: string;
  value: string;
  subtext?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext }) => (
  <div className="rounded-2xl bg-white shadow p-4 w-full sm:w-64">
    <h3 className="text-sm text-gray-500">{title}</h3>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    {subtext && <p className="text-xs text-gray-400">{subtext}</p>}
  </div>
);

const DashboardPanel: React.FC<DashboardPanelProps> = ({
  totalDonors,
  totalRevenue,
  activeCampaigns,
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Campaign Dashboard</h2>
          <p className="text-sm text-gray-600">Monitor campaign performance and progress.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          disabled={loading}
          className="px-4 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          + New Campaign
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <StatCard title="Active Campaigns" value={String(activeCampaigns)} subtext="Current active campaigns" />
        <StatCard title="Donors Engaged" value={String(totalDonors)} subtext="Last 30 days" />
        <StatCard title="Funds Raised" value={`$${totalRevenue.toLocaleString()}`} subtext="Year to date" />
        <StatCard title="Emails Sent" value="8,290" subtext="All campaigns" />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">Upcoming Campaign Milestones</h3>
        <ul className="list-disc ml-6 text-sm text-gray-700 space-y-1">
          <li>Girlstart EOY draft due – Aug 12</li>
          <li>BBHH NTXGD Match Confirmed – Aug 18</li>
          <li>CASA Campaign Launch – Sept 1</li>
        </ul>
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
