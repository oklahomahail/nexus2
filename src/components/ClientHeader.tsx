// src/components/ClientHeader.tsx
import { Plus, Settings, BarChart3, Target } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import { useClient } from "@/context/ClientContext";

export default function ClientHeader() {
  const { currentClient } = useClient();
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentClient) return null;

  const isClientDashboard = location.pathname === `/client/${currentClient.id}`;
  const isClientCampaigns =
    location.pathname === `/client/${currentClient.id}/campaigns`;
  const isClientAnalytics =
    location.pathname === `/client/${currentClient.id}/analytics`;

  return (
    <div className="space-y-4">
      {/* Client info and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {currentClient.brand?.logoUrl ? (
            <img
              src={currentClient.brand.logoUrl}
              alt="Logo"
              className="h-10 w-10 rounded-lg object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {currentClient.name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-white">
              {currentClient.name}
            </h1>
            <p className="text-slate-400 text-sm">Client Dashboard</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate(`/client/${currentClient.id}/campaigns`)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New Campaign</span>
          </button>
          <button className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 text-sm">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Client navigation tabs */}
      <nav className="flex space-x-1">
        <button
          onClick={() => navigate(`/client/${currentClient.id}`)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
            isClientDashboard
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Overview</span>
        </button>
        <button
          onClick={() => navigate(`/client/${currentClient.id}/campaigns`)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
            isClientCampaigns
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <Target className="w-4 h-4" />
          <span>Campaigns</span>
        </button>
        <button
          onClick={() => navigate(`/client/${currentClient.id}/analytics`)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
            isClientAnalytics
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
              : "text-slate-400 hover:text-white hover:bg-slate-700/50"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics</span>
        </button>
      </nav>

      {/* Quick stats row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs">Active Campaigns</div>
          <div className="text-2xl font-bold text-white">—</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs">Donors (30d)</div>
          <div className="text-2xl font-bold text-white">—</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs">Revenue (30d)</div>
          <div className="text-2xl font-bold text-white">—</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs">Avg. Gift Size</div>
          <div className="text-2xl font-bold text-white">—</div>
        </div>
      </div>
    </div>
  );
}
