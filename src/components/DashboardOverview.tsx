import React from 'react';
import { UsersIcon, HeartIcon, DollarSignIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { KPIWidget } from './AnalyticsWidgets';

const donorStats = [
  {
    title: 'Total Donors',
    value: '1,245',
    icon: <UsersIcon className="w-5 h-5" />,
  },
  {
    title: 'Monthly Donors',
    value: '312',
    icon: <HeartIcon className="w-5 h-5" />,
  },
  {
    title: 'Avg. Gift Amount',
    value: '$89.50',
    icon: <DollarSignIcon className="w-5 h-5" />,
  },
];

const donorTrendData = [
  { month: 'Jan', donors: 100 },
  { month: 'Feb', donors: 120 },
  { month: 'Mar', donors: 140 },
  { month: 'Apr', donors: 180 },
  { month: 'May', donors: 160 },
  { month: 'Jun', donors: 190 },
  { month: 'Jul', donors: 210 },
];

const recentDonors = [
  { name: 'Jane Doe', amount: '$50', date: '2025-08-01' },
  { name: 'John Smith', amount: '$100', date: '2025-07-30' },
  { name: 'Emily Johnson', amount: '$75', date: '2025-07-29' },
  { name: 'Michael Brown', amount: '$40', date: '2025-07-28' },
];

const DonorInsightsPanel: React.FC = () => {
  return (
    <div className="p-6 space-y-8">
      {/* Donor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {donorStats.map((stat) => (
          <KPIWidget
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      {/* Donor Trend Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Donor Growth Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={donorTrendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="donors" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Donors Table */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Donors</h3>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="py-2">Name</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {recentDonors.map((donor, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-2">{donor.name}</td>
                <td className="py-2">{donor.amount}</td>
                <td className="py-2">{donor.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DonorInsightsPanel;
