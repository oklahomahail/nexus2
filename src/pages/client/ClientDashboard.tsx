import React from "react";
import { useParams } from "react-router-dom";

export default function ClientDashboard() {
  const { clientId } = useParams();

  return (
    <div className="p-6" data-tutorial-step="dashboard.page">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Dashboard</h1>
        <p className="text-gray-600">Welcome to {clientId} dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tutorial-step="dashboard.performance">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Raised</h3>
          <p className="text-2xl font-bold text-green-600">$127,450</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Active Campaigns</h3>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Donors</h3>
          <p className="text-2xl font-bold">1,248</p>
        </div>
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</h3>
          <p className="text-2xl font-bold text-blue-600">3.2%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">New donation received</span>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Campaign launched</span>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Report generated</span>
              <span className="text-xs text-gray-500">3 days ago</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50">
              Create New Campaign
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50">
              Generate Report
            </button>
            <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50">
              View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}