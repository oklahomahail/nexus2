import React from "react";
import { useParams } from "react-router-dom";

export default function ClientAnalytics() {
  const { clientId: _clientId } = useParams();

  return (
    <div className="p-6" data-tutorial-step="analytics.page">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold mb-2">Analytics</h1>
        <p className="text-gray-600">Campaign performance and donor insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Campaign Performance</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Donations</span>
              <span className="font-semibold">$127,450</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Number of Donors</span>
              <span className="font-semibold">1,248</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Average Donation</span>
              <span className="font-semibold">$102.16</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="font-semibold text-green-600">3.2%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Donor Demographics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Age 25-34</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "35%" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">35%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Age 35-44</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "28%" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">28%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Age 45-54</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "22%" }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">22%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">
            Top Performing Campaigns
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">End-of-Year Holiday 2025</span>
              <span className="text-sm font-semibold">$45,230</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm">Summer Food Drive</span>
              <span className="text-sm font-semibold">$38,120</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm">Back to School Initiative</span>
              <span className="text-sm font-semibold">$44,100</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <div className="text-center text-gray-500 py-8">
            <p>Chart visualization would go here</p>
            <p className="text-sm">
              (Line chart showing donation trends over time)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
