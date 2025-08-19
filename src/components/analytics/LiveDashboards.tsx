// src/components/analytics/LiveDashboards.tsx
import {
  BarChart3,
  Users,
  Target,
  Activity,
  Briefcase,
  LineChart as LineChartIcon,
} from "lucide-react";
import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  BarChart,
  CartesianGrid,
} from "recharts";

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: "donor", label: "Donor View", icon: Users },
  { id: "board", label: "Board View", icon: Briefcase },
  { id: "exec", label: "Executive View", icon: BarChart3 },
];

// Fake timeline data for now
const sampleData = [
  { day: "Day 1", raised: 500, donors: 10, roi: 1.2 },
  { day: "Day 5", raised: 2500, donors: 35, roi: 1.4 },
  { day: "Day 10", raised: 7000, donors: 80, roi: 1.6 },
  { day: "Day 15", raised: 12000, donors: 130, roi: 1.7 },
  { day: "Day 20", raised: 20000, donors: 220, roi: 1.9 },
];

const LiveDashboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(tabs[0]);

  return (
    <div className="h-full flex flex-col bg-bg-primary text-text-primary">
      {/* Header */}
      <div className="border-b border-border-default px-6 py-4 flex justify-between items-center bg-bg-secondary">
        <div>
          <h2 className="text-xl font-bold">{activeTab.label}</h2>
          <p className="text-text-secondary text-sm">
            {activeTab.id === "donor" &&
              "Real-time campaign progress for donors"}
            {activeTab.id === "board" &&
              "Cross-campaign portfolio insights for board members"}
            {activeTab.id === "exec" &&
              "Strategic performance overview for executives"}
          </p>
        </div>
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab.id === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-accent-primary text-white shadow"
                    : "bg-bg-tertiary text-text-secondary hover:text-text-primary"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Donor View */}
        {activeTab.id === "donor" && (
          <div className="bg-bg-secondary rounded-xl border border-border-default p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Target className="w-5 h-5 text-accent-primary" />
              <span>Campaign Progress</span>
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sampleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="day" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="raised"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Board View */}
        {activeTab.id === "board" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-bg-secondary rounded-xl border border-border-default p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Activity className="w-5 h-5 text-accent-primary" />
                <span>Donor Growth</span>
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Bar dataKey="donors" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-bg-secondary rounded-xl border border-border-default p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <LineChartIcon className="w-5 h-5 text-accent-primary" />
                <span>ROI Trends</span>
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sampleData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="roi"
                    stroke="#f59e0b"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Executive View */}
        {activeTab.id === "exec" && (
          <div className="bg-bg-secondary rounded-xl border border-border-default p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-accent-primary" />
              <span>Portfolio Performance</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-bg-tertiary p-4 rounded-lg">
                <h4 className="text-sm text-text-secondary mb-1">Revenue</h4>
                <p className="text-2xl font-bold">$1.2M</p>
              </div>
              <div className="bg-bg-tertiary p-4 rounded-lg">
                <h4 className="text-sm text-text-secondary mb-1">Donors</h4>
                <p className="text-2xl font-bold">4,532</p>
              </div>
              <div className="bg-bg-tertiary p-4 rounded-lg">
                <h4 className="text-sm text-text-secondary mb-1">ROI</h4>
                <p className="text-2xl font-bold">1.8x</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveDashboards;
