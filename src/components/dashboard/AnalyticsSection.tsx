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
        <h2 className="text-xl font-bold text-[rgb(var(--nexus-slate-900))] tracking-tight">
          Analytics
        </h2>
        <button
          onClick={() => navigate(`/clients/${clientId}/analytics`)}
          className="flex items-center gap-1 text-sm text-[rgb(var(--nexus-blue-600))] hover:text-[rgb(var(--nexus-blue-700))] font-medium"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-[rgb(var(--nexus-green-500))]" />
            <span className="text-xs font-medium text-[rgb(var(--nexus-slate-700))]">
              Total Raised
            </span>
          </div>
          <div className="text-2xl font-semibold text-[rgb(var(--nexus-blue-600))]">
            ${(metrics.totalRaised / 1000).toFixed(1)}k
          </div>
          <div className="text-xs text-[rgb(var(--nexus-green-500))] mt-1 font-medium">
            +{metrics.revenueGrowth}% vs last month
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-[rgb(var(--nexus-blue-600))]" />
            <span className="text-xs font-medium text-[rgb(var(--nexus-slate-700))]">
              Total Donors
            </span>
          </div>
          <div className="text-2xl font-semibold text-[rgb(var(--nexus-blue-600))]">
            {metrics.totalDonors.toLocaleString()}
          </div>
          <div className="text-xs text-[rgb(var(--nexus-green-500))] mt-1 font-medium">
            +{metrics.donorGrowth}% growth
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-[rgb(var(--nexus-slate-700))]">
              Retention Rate
            </span>
          </div>
          <div className="text-2xl font-semibold text-[rgb(var(--nexus-blue-600))]">
            {metrics.retentionRate}%
          </div>
          <div className="text-xs text-[rgb(var(--nexus-slate-700))] mt-1">
            Track15 metric
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-[rgb(var(--nexus-slate-700))]">
              Avg Gift Size
            </span>
          </div>
          <div className="text-2xl font-semibold text-[rgb(var(--nexus-blue-600))]">
            ${metrics.avgGiftSize}
          </div>
          <div className="text-xs text-[rgb(var(--nexus-slate-700))] mt-1">
            Per donation
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl p-5 border border-[rgb(var(--nexus-slate-200))] shadow-sm">
        <h3 className="text-sm font-semibold text-[rgb(var(--nexus-slate-900))] mb-3">
          Recent Donations
        </h3>
        <div className="space-y-3">
          {recentDonations.map((donation) => (
            <div
              key={donation.id}
              className="flex items-center justify-between py-2 border-b border-[rgb(var(--nexus-slate-200))] last:border-0"
            >
              <div className="flex-1">
                <div className="text-sm font-medium text-[rgb(var(--nexus-slate-900))]">
                  {donation.donor}
                </div>
                <div className="text-xs text-[rgb(var(--nexus-slate-700))]">
                  {donation.time}
                </div>
              </div>
              <div className="text-sm font-semibold text-[rgb(var(--nexus-green-500))]">
                ${donation.amount}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate(`/clients/${clientId}/analytics`)}
          className="w-full mt-3 text-center text-sm text-[rgb(var(--nexus-blue-600))] hover:text-[rgb(var(--nexus-blue-700))] font-medium"
        >
          View all donations →
        </button>
      </div>

      {/* Donor Segments */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-200">
        <h3 className="text-sm font-semibold text-[rgb(var(--nexus-slate-900))] mb-3">
          Donor Segments
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[rgb(var(--nexus-slate-700))]">
              Current Donors
            </span>
            <span className="font-semibold text-[rgb(var(--nexus-slate-900))]">
              842
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[rgb(var(--nexus-slate-700))]">
              Lapsed Donors
            </span>
            <span className="font-semibold text-[rgb(var(--nexus-slate-900))]">
              215
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[rgb(var(--nexus-slate-700))]">
              High Value
            </span>
            <span className="font-semibold text-[rgb(var(--nexus-slate-900))]">
              48
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-[rgb(var(--nexus-slate-700))]">
              Monthly Givers
            </span>
            <span className="font-semibold text-[rgb(var(--nexus-slate-900))]">
              143
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
