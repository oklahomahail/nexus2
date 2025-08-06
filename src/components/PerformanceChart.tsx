import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

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

type ChartType = 'comparison' | 'success-rate' | 'roi';

interface PerformanceChartProps {
  title: string;
  type: ChartType;
  data: ComparisonData | CampaignSuccessData;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ title, type, data }) => {
  let labels: string[] = [];
  let datasetLabel = '';
  let datasetData: number[] = [];

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
    labels = d.map(c => c.name);
    datasetLabel = 'Goal Achievement (%)';
    datasetData = d.map(c => c.goalAchievement);
  } else if (type === 'roi') {
    const d = data as CampaignSuccessData;
    labels = d.map(c => c.name);
    datasetLabel = 'ROI';
    datasetData = d.map(c => c.roi);
  }

  const chartData = {
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: datasetData,
        backgroundColor: '#3B82F6'
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4 shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default PerformanceChart;
