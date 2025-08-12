// src/pages/ClientDashboard.tsx
import {
  Target,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  Mail,
  MousePointer,
} from "lucide-react";

import { useClient } from "@/context/ClientContext";

export default function ClientDashboard() {
  const { currentClient } = useClient();

  if (!currentClient) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Client Selected
          </h3>
          <p className="text-slate-400">
            Select a client from the switcher to view their dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Mock data - replace with real data from your services
  const mockCampaigns = [
    {
      id: "1",
      name: "End of Year Giving Campaign",
      status: "Active",
      goal: 50000,
      raised: 32500,
      progress: 65,
      daysLeft: 45,
      donorCount: 127,
    },
    {
      id: "2",
      name: "Spring Fundraiser",
      status: "Planning",
      goal: 25000,
      raised: 0,
      progress: 0,
      daysLeft: 90,
      donorCount: 0,
    },
  ];

  const mockActivities = [
    {
      id: "1",
      type: "donation",
      message: "New donation of $250 from Sarah Johnson",
      time: "2 hours ago",
      icon: DollarSign,
      color: "text-green-400",
    },
    {
      id: "2",
      type: "campaign",
      message: "End of Year Campaign reached 65% of goal",
      time: "5 hours ago",
      icon: Target,
      color: "text-blue-400",
    },
    {
      id: "3",
      type: "email",
      message: "Monthly newsletter sent to 450 subscribers",
      time: "1 day ago",
      icon: Mail,
      color: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics Grid */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">
          Performance Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Target className="w-6 h-6 text-blue-400" />
              <span className="text-xs text-slate-400">Active</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">2</div>
            <div className="text-slate-400 text-sm">Campaigns</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-6 h-6 text-green-400" />
              <span className="text-xs text-green-400">+12%</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">384</div>
            <div className="text-slate-400 text-sm">Total Donors</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <DollarSign className="w-6 h-6 text-purple-400" />
              <span className="text-xs text-purple-400">+8%</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">$32,500</div>
            <div className="text-slate-400 text-sm">Revenue (30d)</div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-6 h-6 text-orange-400" />
              <span className="text-xs text-orange-400">$125</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">$85</div>
            <div className="text-slate-400 text-sm">Avg Gift Size</div>
          </div>
        </div>
      </section>

      {/* Active Campaigns */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Active Campaigns</h2>
          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
            View All
          </button>
        </div>
        <div className="grid gap-6">
          {mockCampaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {campaign.name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-slate-400">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === "Active"
                          ? "bg-green-900/20 text-green-400 border border-green-800/50"
                          : "bg-yellow-900/20 text-yellow-400 border border-yellow-800/50"
                      }`}
                    >
                      {campaign.status}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {campaign.daysLeft} days left
                    </span>
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {campaign.donorCount} donors
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    ${campaign.raised.toLocaleString()}
                  </div>
                  <div className="text-slate-400 text-sm">
                    of ${campaign.goal.toLocaleString()} goal
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-400">Progress</span>
                  <span className="text-sm font-medium text-white">
                    {campaign.progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
              </div>

              {/* Campaign actions */}
              <div className="flex items-center space-x-3">
                <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                  <MousePointer className="w-4 h-4" />
                  <span>View Details</span>
                </button>
                <button className="flex items-center space-x-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  <span>Send Update</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">Recent Activity</h2>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          {mockActivities.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-400">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {mockActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 hover:bg-slate-700/30 rounded-lg transition-colors"
                  >
                    <div
                      className={`p-2 rounded-lg bg-slate-700/50 ${activity.color}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm">{activity.message}</p>
                      <p className="text-slate-400 text-xs mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Quick Actions */}
      <section>
        <h2 className="text-xl font-bold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors text-left">
            <Target className="w-8 h-8 text-blue-400 mb-3" />
            <div className="text-white font-medium mb-1">New Campaign</div>
            <div className="text-slate-400 text-sm">
              Create a fundraising campaign
            </div>
          </button>

          <button className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors text-left">
            <Mail className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-white font-medium mb-1">Send Newsletter</div>
            <div className="text-slate-400 text-sm">Email your supporters</div>
          </button>

          <button className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors text-left">
            <TrendingUp className="w-8 h-8 text-purple-400 mb-3" />
            <div className="text-white font-medium mb-1">View Reports</div>
            <div className="text-slate-400 text-sm">Analyze performance</div>
          </button>

          <button className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-colors text-left">
            <Users className="w-8 h-8 text-orange-400 mb-3" />
            <div className="text-white font-medium mb-1">Manage Donors</div>
            <div className="text-slate-400 text-sm">View donor profiles</div>
          </button>
        </div>
      </section>
    </div>
  );
}
