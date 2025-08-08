// src/components/PerformanceChart.tsx - Modernized with dark theme
import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  ChartOptions
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type ComparisonData = {
  currentPeriod: {
    startDate: string;
    endDate: string;
    totalRaised: number;
    donorCount: number;
    campaignCount: number;
  };
  previousPeriod: {
    startDate: string;
    endDate: string;
    totalRaised: number;
    donorCount: number;
    campaignCount: number;
  };
  growthMetrics: {
    raisedChange: number;
    donorsChange: number;
    campaignsChange: number;
  };
};

type CampaignSuccessData = {
  campaignId: string;
  name: string;
  totalRaised: number;
  goalAchievement: number;
  donorCount: number;
  roi: number;
}[];

type ChartType = 'comparison' | 'success-rate' | 'roi' | 'trend';

interface PerformanceChartProps {
  title: string;
  type: ChartType;
  data: ComparisonData | CampaignSuccessData;
  className?: string;
  height?: number;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  title, 
  type, 
  data, 
  className = '',
  height = 300 
}) => {
  let labels: string[] = [];
  let datasetLabel = '';
  let datasetData: number[] = [];
  let chartType: 'bar' | 'line' = 'bar';

  // Prepare data based on chart type
  if (type === 'comparison') {
    const d = data as ComparisonData;
    labels = ['Funds Raised', 'Donors', 'Campaigns'];
    datasetLabel = 'Growth %';
    datasetData = [
      d.growthMetrics.raisedChange,
      d.growthMetrics.donorsChange,
      d.growthMetrics.campaignsChange
    ];
  } else if (type === 'success-rate') {
    const d = data as CampaignSuccessData;
    labels = d.map(c => c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name);
    datasetLabel = 'Goal Achievement (%)';
    datasetData = d.map(c => c.goalAchievement);
  } else if (type === 'roi') {
    const d = data as CampaignSuccessData;
    labels = d.map(c => c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name);
    datasetLabel = 'ROI %';
    datasetData = d.map(c => c.roi);
  } else if (type === 'trend') {
    chartType = 'line';
    // Handle trend data if needed
  }

  // Dark theme color palette
  const getColorPalette = (type: ChartType) => {
    const palettes = {
      comparison: {
        backgroundColor: ['#3B82F6', '#8B5CF6', '#10B981'],
        borderColor: ['#60A5FA', '#A78BFA', '#34D399'],
      },
      'success-rate': {
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
        borderColor: '#8B5CF6',
      },
      roi: {
        backgroundColor: 'rgba(34, 197, 94, 0.8)', 
        borderColor: '#22C55E',
      },
      trend: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3B82F6',
      }
    };
    return palettes[type];
  };

  const colors = getColorPalette(type);

  const chartData = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: datasetData,
        backgroundColor: colors.backgroundColor,
        borderColor: colors.borderColor,
        borderWidth: chartType === 'line' ? 3 : 1,
        borderRadius: chartType === 'bar' ? 6 : 0,
        borderSkipped: false,
        tension: chartType === 'line' ? 0.4 : undefined,
        fill: chartType === 'line' ? true : undefined,
        pointBackgroundColor: chartType === 'line' ? colors.borderColor : undefined,
        pointBorderColor: chartType === 'line' ? '#1F2937' : undefined,
        pointBorderWidth: chartType === 'line' ? 2 : undefined,
        pointRadius: chartType === 'line' ? 6 : undefined,
        pointHoverRadius: chartType === 'line' ? 8 : undefined,
      }
    ]
  };

  const baseOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.95)',
        titleColor: '#F1F5F9',
        bodyColor: '#CBD5E1',
        borderColor: '#475569',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          label: function(context: { dataset: { label: string; }; parsed: { y: any; }; }) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            
            if (type === 'comparison') {
              return `${label}: ${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
            } else if (type === 'success-rate') {
              return `Goal Achievement: ${value.toFixed(1)}%`;
            } else if (type === 'roi') {
              return `ROI: ${value.toFixed(1)}%`;
            }
            return `${label}: ${value}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          maxRotation: 0,
        },
        border: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(71, 85, 105, 0.3)',
          drawBorder: false,
        },
        ticks: {
          color: '#94A3B8',
          font: {
            size: 12,
            family: 'Inter, sans-serif'
          },
          callback: function(value: string) {
            if (type === 'comparison' || type === 'success-rate' || type === 'roi') {
              return value + '%';
            }
            return value;
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };

  const ChartComponent = chartType === 'line' ? Line : Bar;

  return (
    <div className={`card-base p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm text-slate-400">
            {type === 'comparison' && 'Period-over-period growth metrics'}
            {type === 'success-rate' && 'Campaign goal achievement rates'}
            {type === 'roi' && 'Return on investment by campaign'}
            {type === 'trend' && 'Performance trends over time'}
          </p>
        </div>
        
        {/* Chart Controls */}
        <div className="flex items-center space-x-2">
          <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      <div style={{ height: `${height}px` }} className="relative">
        <ChartComponent data={chartData} options={baseOptions} />
      </div>

      {/* Chart Legend/Summary */}
      <div className="mt-4 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {type === 'comparison' && 'Growth vs previous period'}
            {type === 'success-rate' && `${datasetData.length} campaigns analyzed`}
            {type === 'roi' && `Average ROI: ${(datasetData.reduce((a, b) => a + b, 0) / datasetData.length).toFixed(1)}%`}
          </span>
          
          {type === 'comparison' && (
            <div className="flex items-center space-x-4">
              {datasetData.map((value, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: Array.isArray(colors.backgroundColor) ? colors.backgroundColor[index] : colors.backgroundColor }}
                  />
                  <span className={`text-xs font-medium ${
                    value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {value > 0 ? '+' : ''}{value.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Enhanced Campaign Performance Table
interface CampaignPerformanceTableProps {
  campaigns: Array<{
    id: string;
    name: string;
    status: 'Active' | 'Planned' | 'Completed' | 'Cancelled';
    totalDonors: number;
    totalRevenue: number;
    roi: number;
    goal?: number;
    progress?: number;
  }>;
  className?: string;
}

export const CampaignPerformanceTable: React.FC<CampaignPerformanceTableProps> = ({ 
  campaigns, 
  className = '' 
}) => {
  const getStatusColor = (status: string) => {
    const colors = {
      'Active': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Planned': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'Completed': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return colors[status as keyof typeof colors] || colors.Active;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`card-base overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-slate-700/50">
        <h3 className="text-lg font-semibold text-white">Campaign Performance</h3>
        <p className="text-sm text-slate-400 mt-1">Track the success of your fundraising campaigns</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700/50">
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Campaign</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Status</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Donors</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Raised</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Progress</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">ROI</th>
              <th className="px-6 py-4 text-left text-sm font-medium text-slate-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {campaigns.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-white truncate max-w-48">
                    {campaign.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-300">
                  {campaign.totalDonors.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span className="font-semibold text-green-400">
                    {formatCurrency(campaign.totalRevenue)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {campaign.goal && campaign.progress ? (
                    <div className="w-24">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400">{campaign.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-700/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500 text-sm">N/A</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`font-semibold ${
                    campaign.roi > 0 ? 'text-green-400' : 
                    campaign.roi < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {campaign.roi > 0 ? '+' : ''}{campaign.roi.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {campaigns.length === 0 && (
        <div className="p-12 text-center">
          <div className="text-slate-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-300 mb-2">No campaign data available</h3>
          <p className="text-slate-400">Start tracking your campaigns to see performance metrics here.</p>
        </div>
      )}
    </div>
  );
};

export default PerformanceChart;
