/**
 * Analytics Section
 *
 * Quick analytics overview on dashboard
 * Track15 metrics summary
 */

import {
  TrendingUp,
  Users,
  DollarSign,
  Target,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useClient } from "@/context/ClientContext";

export default function AnalyticsSection() {
  const navigate = useNavigate();
  const { currentClient } = useClient();
  const clientId = currentClient?.id;

  // Mock data - replace with real analytics
  const metrics = {
    totalRaised: 127450,
    totalDonors: 1248,
    retentionRate: 68.5,
    avgGiftSize: 102,
    donorGrowth: 12.3,
    revenueGrowth: 8.7,
  };

  const recentDonations = [
    { id: "1", donor: "Sarah Johnson", amount: 500, time: "2 hours ago" },
    { id: "2", donor: "Michael Chen", amount: 250, time: "5 hours ago" },
    { id: "3", donor: "Emily Davis", amount: 100, time: "1 day ago" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h2>
        <button
          onClick={() => navigate(`/clients/${clientId}/analytics`)}
          className="flex items-center gap-1 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total Raised
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${(metrics.totalRaised / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-green-600 dark:text-green-400 mt-1">
            +{metrics.revenueGrowth}% vs last month
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Total Donors
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.totalDonors.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            +{metrics.donorGrowth}% growth
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Retention Rate
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metrics.retentionRate}%
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Track15 metric
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Avg Gift Size
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${metrics.avgGiftSize}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Per donation
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Recent Donations
        </h3>
        <div className="space-y-3">
          {recentDonations.map((donation) => (
            <div
              key={donation.id}
              className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {donation.donor}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {donation.time}
                </div>
              </div>
              <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                ${donation.amount}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate(`/clients/${clientId}/analytics`)}
          className="w-full mt-3 text-center text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
        >
          View all donations →
        </button>
      </div>

      {/* Donor Segments */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
          Donor Segments
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Current Donors
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              842
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Lapsed Donors
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              215
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">High Value</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              48
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700 dark:text-gray-300">
              Monthly Givers
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              143
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
